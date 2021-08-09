import { getDocumentAsync } from 'expo-document-picker';
import { launchCameraAsync, launchImageLibraryAsync, MediaTypeOptions, requestCameraPermissionsAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import { uniqueId } from 'lodash';
import React, { Fragment, useState, useRef } from 'react'
import { View, StyleSheet, Platform, TextInput, Image, Alert } from 'react-native'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import strings from '../../../assets/lang/strings';
import { encryptFilename, getLyticsData } from '../../helpers';
import { getIcon } from '../../helpers/getIcon';
import analytics from '../../helpers/lytics';
import { fileActions, layoutActions, userActions } from '../../redux/actions';
import MenuItem from '../MenuItem';
import PackageJson from '../../../package.json'
import { getUser } from '../../database/DBUtils.ts/utils';

import { FilesState } from '../../redux/reducers/files.reducer';
import { getEnvironmentConfig, Network } from '../../lib/network';
import { LayoutState } from '../../redux/reducers/layout.reducer';
import { AuthenticationState } from '../../redux/reducers/authentication.reducer';
import { getHeaders } from '../../helpers/headers';
import { getItemsLocalStorage } from '../../modals/CreateAlbumModal/init';

interface AppMenuProps {
  navigation?: any
  filesState?: FilesState
  dispatch?: any,
  layoutState?: LayoutState
  authenticationState?: AuthenticationState
}

type FileType = 'document' | 'image';

function AppMenu(props: AppMenuProps) {
  const [activeSearchBox, setActiveSearchBox] = useState(false)
  const selectedItems = props.filesState.selectedItems;
  const textInput = useRef<TextInput>(null)

  const handleClickSearch = () => {
    if (textInput && textInput.current) {
      textInput.current.focus();
    }
  }

  const closeSearch = () => {
    if (textInput && textInput.current) {
      textInput.current.blur();
    }
  }

  const getFinalUri = (fileUri: string, fileType: FileType): string => {
    return fileType === 'document' ? decodeURIComponent(fileUri) : fileUri;
  }

  const uploadFile = async (result: any, currentFolder: number | undefined, fileType: FileType) => {
    props.dispatch(fileActions.uploadFileStart())

    const userData = getLyticsData().then((res) => {
      analytics.track('file-upload-start', { userId: res.uuid, email: res.email, device: 'mobile' }).catch(() => { })
    })

    const regex = /^(.*:\/{0,2})\/?(.*)$/gm
    const fileUri = result.uri.replace(regex, '$2')
    const extension = fileUri.split('.').pop();
    const finalUri = getFinalUri(fileUri, fileType);

    const { bridgeUser, bridgePass, encryptionKey, bucketId } = await getEnvironmentConfig();
    const network = new Network(bridgeUser, bridgePass, encryptionKey);

    const stat = await RNFetchBlob.fs.stat(finalUri);

    const fileId = await network.uploadFile(bucketId, {
      fileUri: finalUri,
      filepath: finalUri,
      progressCallback: (progress) => {
        props.dispatch(fileActions.uploadFileSetProgress(progress, result.id))
        if (progress >= 1) {
          props.dispatch(fileActions.uploadFileSetUri(result.uri)) // Set the uri of the file so FileItem can get it as props
        }
      }
    });

    const folderId = props.filesState.folderContent.id;
    const name = encryptFilename(result.name, folderId);
    const fileSize = stat.size;
    const type = extension;

    const fileEntry = {
      fileId,
      file_id: fileId,
      type,
      bucket: bucketId,
      size: fileSize,
      folder_id: folderId,
      name,
      encrypt_version: '03-aes'
    };

    const items = await getItemsLocalStorage()
    const mnemonic = items.xUserJson.mnemonic
    const xToken = items.xToken
    const headers = await getHeaders(xToken, mnemonic)

    const createFileEntry = () => {
      const body = JSON.stringify({ file: fileEntry });
      const params = { method: 'post', headers, body };

      return fetch(`${process.env.REACT_NATIVE_API_URL}/api/storage/file`, params);
    };

    const user = await getUser();

    try {
      await createFileEntry();
      analytics.track('file-upload-finished', { userId: user.uuid, email: user.email, device: 'mobile' }).catch(() => { })

      props.dispatch(fileActions.removeUploadingFile(result.id))
      props.dispatch(fileActions.updateUploadingFile(result.id))
      props.dispatch(fileActions.uploadFileSetUri(undefined))
    } catch (err) {
      analytics.track('file-upload-error', { userId: user.uuid, email: user.email, device: 'mobile' }).catch(() => { })
      props.dispatch(fileActions.uploadFileFailed(result.id));

      Alert.alert('Error', 'Cannot upload file due to: ' + err.message);
    } finally {
      props.dispatch(fileActions.uploadFileFinished(result.name));
    }
  }

  return <View
    style={styles.container}>

    <View style={[styles.searchContainer, { display: activeSearchBox ? 'flex' : 'none' }]}>
      <Image
        style={{ marginLeft: 20, marginRight: 10 }}
        source={getIcon('search')}
      />

      <TextInput
        ref={textInput}
        style={styles.searchInput}
        placeholder={strings.components.app_menu.search_box}
        value={props.filesState.searchString}
        onChange={e => {
          props.dispatch(fileActions.setSearchString(e.nativeEvent.text))
        }}
      />

      <TouchableWithoutFeedback
        onPress={() => {
          props.dispatch(fileActions.setSearchString(''));
          props.dispatch(layoutActions.closeSearch());
          setActiveSearchBox(false)
          closeSearch()
        }}
      >
        <Image
          style={{ marginLeft: 10, marginRight: 20, height: 16, width: 16 }}
          source={getIcon('close')}
        />
      </TouchableWithoutFeedback>
    </View>

    <Fragment>
      <View style={[styles.buttonContainer, { display: activeSearchBox ? 'none' : 'flex' }]}>
        <View style={styles.commonButtons}>
          <MenuItem
            style={styles.mr10}
            name="search"
            onClickHandler={() => {
              setActiveSearchBox(true)
              props.dispatch(layoutActions.openSearch())
              handleClickSearch()

            }} />

          <MenuItem
            style={styles.mr10}
            name="list"
            onClickHandler={() => {
              props.dispatch(layoutActions.closeSearch())
              props.dispatch(layoutActions.openSortModal())
            }} />

          <MenuItem
            style={styles.mr10}
            name="upload"
            onClickHandler={() => {
              Alert.alert(strings.components.app_menu.upload.title, '', [
                {
                  text: strings.components.app_menu.upload.document,
                  onPress: async () => {
                    const result = await getDocumentAsync({ copyToCacheDirectory: false })

                    if (result.type !== 'cancel') {
                      const fileUploading: any = result

                      fileUploading.progress = 0
                      fileUploading.currentFolder = props.filesState.folderContent.currentFolder
                      fileUploading.createdAt = new Date()
                      fileUploading.id = uniqueId()

                      props.dispatch(fileActions.addUploadingFile(fileUploading))
                      uploadFile(fileUploading, props.filesState.folderContent.currentFolder, 'document')
                    }
                  }
                },
                {
                  text: strings.components.app_menu.upload.media,
                  onPress: async () => {
                    const { status } = await requestMediaLibraryPermissionsAsync()

                    if (status === 'granted') {
                      const result = await launchImageLibraryAsync({ mediaTypes: MediaTypeOptions.All })

                      if (!result.cancelled) {
                        const fileUploading: any = result

                        // Set name for pics/photos
                        if (!fileUploading.name) {
                          fileUploading.name = result.uri.split('/').pop()
                        }
                        fileUploading.progress = 0
                        fileUploading.currentFolder = props.filesState.folderContent.currentFolder
                        fileUploading.createdAt = new Date()
                        fileUploading.id = uniqueId()

                        props.dispatch(fileActions.addUploadingFile(fileUploading))
                        uploadFile(fileUploading, fileUploading.currentFolder, 'image')
                      }
                    } else {
                      Alert.alert('Camera roll permissions needed to perform this action')
                    }
                  }
                },
                {
                  text: strings.components.app_menu.upload.take_photo,
                  onPress: async () => {
                    const { status } = await requestCameraPermissionsAsync()

                    if (status === 'granted') {
                      const result = await launchCameraAsync()

                      if (!result.cancelled) {
                        const fileUploading: any = result

                        // Set name for pics/photos
                        if (!fileUploading.name) {
                          fileUploading.name = result.uri.split('/').pop()
                        }
                        fileUploading.progress = 0
                        fileUploading.currentFolder = props.filesState.folderContent.currentFolder
                        fileUploading.createdAt = new Date()
                        fileUploading.id = uniqueId()

                        props.dispatch(fileActions.addUploadingFile(fileUploading))
                        uploadFile(fileUploading, props.filesState.folderContent.currentFolder, 'image')
                      }
                    }
                  }
                },
                {
                  text: strings.components.app_menu.upload.cancel,
                  style: 'destructive'
                }
              ], {
                cancelable: Platform.OS === 'android'
              })
            }} />

          <MenuItem
            name="create"
            style={styles.mr10}
            onClickHandler={() => {
              props.navigation.replace('CreateFolder')
            }} />

          {
            selectedItems.length > 0 ?
              <MenuItem name="delete" onClickHandler={() => {
                props.dispatch(layoutActions.openDeleteModal())
              }} />
              :
              null
          }
        </View>

        <MenuItem
          name="settings"
          onClickHandler={() => {
            props.dispatch(layoutActions.openSettings());
          }} />
      </View>
    </Fragment>
  </View>
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    marginLeft: 17,
    marginRight: 10
  },
  commonButtons: {
    flexDirection: 'row',
    flexGrow: 1
  },
  container: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    height: 54,
    justifyContent: 'flex-start',
    marginTop: Platform.OS === 'ios' ? 30 : 0,
    paddingTop: 3
  },
  mr10: {
    marginRight: 10
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 30,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 20,
    marginRight: 20,
    position: 'relative'
  },
  searchInput: {
    flex: 1,
    fontFamily: 'CerebriSans-Medium',
    fontSize: 17,
    marginLeft: 15,
    marginRight: 15
  }
});

const mapStateToProps = (state: any) => {
  return { ...state };
};

export default connect(mapStateToProps)(AppMenu)