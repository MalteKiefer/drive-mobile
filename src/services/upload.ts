import { Alert, Platform } from 'react-native'
import RNFetchBlob from 'rn-fetch-blob'
import analytics, { getLyticsData } from '../helpers/lytics'
import { fileActions, userActions } from '../redux/actions'
import { NEWTORK_TIMEOUT } from '../screens/FileExplorer/init'
import PackageJson from '../../package.json'

export function uploadFile(props: any, result: any, currentFolder: number | undefined): void {
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