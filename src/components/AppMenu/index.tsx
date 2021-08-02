import React, { Fragment, useState, useRef } from 'react'
import { View, StyleSheet, Platform, TextInput, Alert, Text } from 'react-native'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import { getLyticsData } from '../../helpers';
import analytics from '../../helpers/lytics';
import { fileActions, layoutActions, userActions } from '../../redux/actions';
import PackageJson from '../../../package.json'
import { NEWTORK_TIMEOUT } from '../../screens/FileExplorer/init';
import * as Unicons from '@iconscout/react-native-unicons';

interface AppMenuProps {
  navigation?: any
  filesState?: any
  dispatch?: any,
  layoutState?: any
  authenticationState?: any
}

function AppMenu(props: AppMenuProps) {
  const [activeSearchBox, setActiveSearchBox] = useState(false)
  const selectedItems = props.filesState.selectedItems;
  const textInput = useRef<TextInput>(null)

  const uploadFile = (result: any, currentFolder: number | undefined) => {
    props.dispatch(fileActions.uploadFileStart())

    const userData = getLyticsData().then((res) => {
      analytics.track('file-upload-start', { userId: res.uuid, email: res.email, device: 'mobile' }).catch(() => { })
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

            analytics.track('file-upload-finished', { userId: userData.uuid, email: userData.email, device: 'mobile' }).catch(() => { })

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
      analytics.track('file-upload-error', { userId: userData.uuid, email: userData.email, device: 'mobile' }).catch(() => { })
      props.dispatch(fileActions.uploadFileFailed(result.id))
      props.dispatch(fileActions.uploadFileFinished(result.name))
    }
  }

  const parentFolderId = props?.filesState?.folderContent?.parentId;

  return <View style={styles.container}>

    <Fragment>
      <View style={styles.buttonContainer}>
        <View style={styles.commonButtons}>
          <View style={{ width: 50 }}>
            <TouchableWithoutFeedback onPress={() => {
              props.dispatch(fileActions.getFolderContent(parentFolderId));
            }}>
              <Unicons.UilArrowLeft color={parentFolderId ? '#0F62FE' : '#EBECF0'} size={27} />
            </TouchableWithoutFeedback>
          </View>
          <View>
            <Text style={{
              fontFamily: 'NeueEinstellung-SemiBold',
              fontSize: 24,
              color: '#42526E'
            }}>Storage</Text>
          </View>
          <View style={{
            width: 70,
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}>
            <TouchableWithoutFeedback onPress={() => {
              props.dispatch(layoutActions.openSearch())
            }}>
              <Unicons.UilSearch color='#0F62FE' size={27} />
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback
              onPress={() => {
                props.dispatch(layoutActions.openSettings());
              }}>
              <Unicons.UilEllipsisV color='#0F62FE' size={27} />
            </TouchableWithoutFeedback>
          </View>
        </View>
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
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  container: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'flex-start'
  }
});

const mapStateToProps = (state: any) => {
  return { ...state };
};

export default connect(mapStateToProps)(AppMenu)