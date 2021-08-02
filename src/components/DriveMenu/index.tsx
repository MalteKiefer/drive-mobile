import React from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import MainIcon from '../../../assets/icons/figma-icons/add-main.svg'
import * as Unicons from '@iconscout/react-native-unicons'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import strings from '../../../assets/lang/strings';
import { fileActions, layoutActions, userActions } from '../../redux/actions';
import { uniqueId } from 'lodash';
import { getLyticsData } from '../../helpers';
import analytics from '../../helpers/lytics';
import PackageJson from '../../../package.json'
import RNFetchBlob from 'rn-fetch-blob';
import { NEWTORK_TIMEOUT } from '../../screens/FileExplorer/init';
import { ImagePickerResult, launchCameraAsync, launchImageLibraryAsync, MediaTypeOptions, requestCameraPermissionsAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import { getDocumentAsync } from 'expo-document-picker'

function uploadFile(props: any, result: any, currentFolder: number | undefined) {
  props.dispatch(fileActions.uploadFileStart())

  const userData = getLyticsData().then((res) => {
    analytics.track('file-upload-start', {
      userId: res.uuid,
      email: res.email,
      device: 'mobile'
    }).catch(() => { })
  })

  try {
    // Set name for pics/photos
    if (!result.name) {
      result.name = result.uri.split('/').pop()
    }
    //result.type = 'application/octet-stream';

    const token = props.authenticationState.token
    const mnemonic = props.authenticationState.user.mnemonic

    const headers = {
      'Authorization': `Bearer ${token}`,
      'internxt-mnemonic': mnemonic,
      'Content-Type': 'multipart/form-data',
      'internxt-version': PackageJson.version,
      'internxt-client': 'drive-mobile'
    };

    const regex = /^(.*:\/{0,2})\/?(.*)$/gm
    const file = result.uri.replace(regex, '$2')

    const finalUri = Platform.OS === 'ios' ? RNFetchBlob.wrap(decodeURIComponent(file)) : RNFetchBlob.wrap(result.uri)

    RNFetchBlob.config({ timeout: NEWTORK_TIMEOUT }).fetch('POST', `${process.env.REACT_NATIVE_API_URL}/api/storage/folder/${currentFolder}/upload`, headers,
      [
        { name: 'xfile', filename: result.name, data: finalUri }
      ])
      .uploadProgress({ count: 10 }, async (sent, total) => {
        props.dispatch(fileActions.uploadFileSetProgress(sent / total, result.id))

        if (sent / total >= 1) { // Once upload is finished (on small files it almost never reaches 100% as it uploads really fast)
          props.dispatch(fileActions.uploadFileSetUri(result.uri)) // Set the uri of the file so FileItem can get it as props
        }
      })
      .then((res) => {
        props.dispatch(fileActions.removeUploadingFile(result.id))
        props.dispatch(fileActions.updateUploadingFile(result.id))
        props.dispatch(fileActions.uploadFileSetUri(undefined))
        if (res.respInfo.status === 401) {
          throw res;

        } else if (res.respInfo.status === 402) {
          // setHasSpace

        } else if (res.respInfo.status === 201) {
          // CHECK THIS METHOD ONCE LOCAL UPLOAD
          //props.dispatch(fileActions.fetchIfSameFolder(result.currentFolder))

          analytics.track('file-upload-finished', {
            userId: userData.uuid,
            email: userData.email,
            device: 'mobile'
          }).catch(() => { })

        } else if (res.respInfo.status !== 502) {
          Alert.alert('Error', 'Cannot upload file');
        }

        // CHECK ONCE LOCAL UPLOAD
        props.dispatch(fileActions.uploadFileFinished(result.name))
      })
      .catch((err) => {
        if (err.status === 401) {
          props.dispatch(userActions.signout())

        } else {
          Alert.alert('Error', 'Cannot upload file\n' + err)
        }

        props.dispatch(fileActions.uploadFileFailed(result.id))
        props.dispatch(fileActions.uploadFileFinished(result.name))
      })

  } catch (error) {
    analytics.track('file-upload-error', {
      userId: userData.uuid,
      email: userData.email,
      device: 'mobile'
    }).catch(() => { })
    props.dispatch(fileActions.uploadFileFailed(result.id))
    props.dispatch(fileActions.uploadFileFinished(result.name))
  }
}

function RequestFile(props: any) {
  Alert.alert(strings.components.app_menu.upload.title, '', [
    {
      text: strings.components.app_menu.upload.document,
      onPress: async () => {
        const result = getDocumentAsync({ copyToCacheDirectory: false })

        if (result.type !== 'cancel') {
          const fileUploading: any = result

          fileUploading.progress = 0
          fileUploading.currentFolder = props.filesState.folderContent.currentFolder
          fileUploading.createdAt = new Date()
          fileUploading.id = uniqueId()

          props.dispatch(fileActions.addUploadingFile(fileUploading))
          uploadFile(props, fileUploading, props.filesState.folderContent.currentFolder)
        }
      }
    },
    {
      text: strings.components.app_menu.upload.media,
      onPress: async () => {
        const { status } = await requestMediaLibraryPermissionsAsync()

        if (status === 'granted') {
          const result = launchImageLibraryAsync({ mediaTypes: MediaTypeOptions.All })

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
            uploadFile(props, fileUploading, fileUploading.currentFolder)
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
          const result: ImagePickerResult = await launchCameraAsync()

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
            uploadFile(props, fileUploading, props.filesState.folderContent.currentFolder)
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
}

function DriveMenu(props: any): JSX.Element {
  return <View style={styles.container}>
    <TouchableWithoutFeedback onPress={() => {
    }}>
      <Unicons.UilHdd size={28} color="#C1C7D0" />
    </TouchableWithoutFeedback>
    <TouchableWithoutFeedback onPress={() => {
    }}>
      <Unicons.UilClockEight size={28} color="#C1C7D0" />
    </TouchableWithoutFeedback>
    <TouchableWithoutFeedback onPress={() => {
      props.dispatch(layoutActions.openUploadFileModal());
    }}>
      <MainIcon />
    </TouchableWithoutFeedback>
    <TouchableWithoutFeedback onPress={() => {
    }}>
      <Unicons.UilLinkAdd size={28} color="#C1C7D0" />
    </TouchableWithoutFeedback>
    <TouchableWithoutFeedback onPress={() => {
    }}>
      <Unicons.UilCog size={28} color="#C1C7D0" />
    </TouchableWithoutFeedback>
  </View>
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 20
  }
});

const mapStateToProps = (state: any) => {
  return { ...state };
};

export default connect(mapStateToProps)(DriveMenu);
