import React from 'react'
import { View, StyleSheet, Text, Alert } from 'react-native';
import { connect } from 'react-redux';
import { uniqueId } from 'lodash';
import Modal from 'react-native-modalbox';
import { launchCameraAsync, requestCameraPermissionsAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';

import { fileActions, layoutActions } from '../../redux/actions';
import SettingsItem from '../SettingsModal/SettingsItem';
import { createFileEntry, FileEntry, getFinalUri, uploadFile } from '../../services/upload';
import Separator from '../../components/Separator';
import * as Unicons from '@iconscout/react-native-unicons'
import analytics from '../../helpers/lytics';
import { deviceStorage, encryptFilename } from '../../helpers';
import { stat } from '../../lib/fs';
import Toast from 'react-native-toast-message'

interface FileMeta {
  progress: number
  currentFolder: number
  id: string
  createdAt: Date,
  type: string;
  name: string;
  size: number;
  uri: string;
  lastModified?: number;
  output?: FileList | null;
}

function UploadModal(props: any) {
  const currentFolder =
    props.filesState?.folderContent?.currentFolder
    ||
    props.authenticationState?.user?.root_folder_id || 123; // TODO: Fix this

  async function upload(result: FileMeta, fileType: 'document' | 'image') {
    function progressCallback(progress: number) {
      props.dispatch(fileActions.uploadFileSetProgress(progress, result.id));
    }

    // Set name for pics/photos
    if (!result.name) {
      result.name = result.uri.split('/').pop(); // ??
    }

    const regex = /^(.*:\/{0,2})\/?(.*)$/gm
    const fileUri = result.uri.replace(regex, '$2')
    const extension = fileUri.split('.').pop();
    const finalUri = getFinalUri(fileUri, fileType);

    result.uri = finalUri;
    result.type = fileType;

    const fileId = await uploadFile(result, progressCallback);
    const fileStat = await stat(finalUri);

    const folderId = result.currentFolder.toString();
    const name = encryptFilename(result.name, folderId);
    const fileSize = fileStat.size;
    const type = extension;
    const { bucket } = await deviceStorage.getUser();
    const fileEntry: FileEntry = { fileId, file_id: fileId, type, bucket, size: fileSize.toString(), folder_id: folderId, name, encrypt_version: '03-aes' };

    return createFileEntry(fileEntry);
  }

  async function trackUploadStart() {
    const { uuid, email } = await deviceStorage.getUser();
    const uploadStartedTrack = { userId: uuid, email, device: 'mobile' };

    analytics.track('file-upload-start', uploadStartedTrack).catch(() => null);
  }

  async function trackUploadSuccess() {
    const { email, uuid } = await deviceStorage.getUser();
    const uploadFinishedTrack = { userId: uuid, email, device: 'mobile' };

    analytics.track('file-upload-finished', uploadFinishedTrack).catch(() => null);
  }

  async function trackUploadError(err: Error) {
    const { email, uuid } = await deviceStorage.getUser();
    const uploadErrorTrack = { userId: uuid, email, device: 'mobile', error: err.message };

    analytics.track('file-upload-error', uploadErrorTrack).catch(() => null);
  }

  return (
    <Modal
      isOpen={props.layoutState.showUploadModal}
      position={'bottom'}
      entry={'bottom'}
      coverScreen={true}
      swipeArea={50}
      style={styles.modalSettings}
      onClosed={() => {
        props.dispatch(layoutActions.closeUploadFileModal())
      }}
      backButtonClose={true}
      animationDuration={200}>

      <View style={styles.drawerKnob}></View>

      <View style={styles.alignCenter}>
        <Text style={styles.modalTitle}>Upload</Text>
      </View>
      <Separator />
      <SettingsItem
        text={'Upload file'}
        icon={Unicons.UilUploadAlt}
        onPress={async () => {
          // const result: DocumentResult = await getDocumentAsync({
          //   multiple: true,
          //   copyToCacheDirectory: true
          // })
          try {
            const result = await DocumentPicker.pickMultiple({ type: [DocumentPicker.types.allFiles] });
            const file: any = result[0]

            file.progress = 0
            file.currentFolder = currentFolder
            file.createdAt = new Date()
            file.id = uniqueId();

            trackUploadStart();
            props.dispatch(fileActions.uploadFileStart());
            props.dispatch(fileActions.addUploadingFile(file));

            upload(file, 'document').then(() => {
              trackUploadSuccess();
              props.dispatch(fileActions.removeUploadingFile(file.id));
              props.dispatch(fileActions.updateUploadingFile(file.id));
              props.dispatch(fileActions.uploadFileSetUri(undefined));
            }).catch(err => {
              trackUploadError(err);
              props.dispatch(fileActions.uploadFileFailed(file.id));
              Alert.alert('Error', 'Cannot upload file due to: ' + err.message);
            }).finally(() => {
              props.dispatch(fileActions.uploadFileFinished(file.name));
            });

          } catch (err) {
            if (!DocumentPicker.isCancel(err)) {
              Toast.show({
                type: 'err',
                position: 'bottom',
                text1: err.message,
                visibilityTime: 5000,
                autoHide: true,
                bottomOffset: 100
              });
            }
          }
        }}
      />

      <SettingsItem
        text={'Take photo & upload'}
        icon={Unicons.UilCameraPlus}
        onPress={async () => {
          const { status } = await requestCameraPermissionsAsync();

          if (status === 'granted') {
            let error: Error | null = null;

            const result = await launchCameraAsync().catch(err => {
              error = err;
            })

            if (error || !result) {
              return Alert.alert(error?.message);
            }

            if (!result) {
              return;
            }

            if (!result.cancelled) {
              const file: any = result

              // Set name for pics/photos
              if (!file.name) {
                file.name = result.uri.split('/').pop()
              }
              file.progress = 0
              file.currentFolder = currentFolder
              file.createdAt = new Date()
              file.id = uniqueId()

              props.dispatch(fileActions.addUploadingFile(file))
              // upload(file);
            }
          }
        }}
      />

      <SettingsItem
        text={'Upload media'}
        icon={Unicons.UilImagePlus}
        onPress={async () => {
          const { status } = await requestMediaLibraryPermissionsAsync(false)

          if (status === 'granted') {
            launchImageLibrary({ selectionLimit: 0, mediaType: 'mixed' }, (response) => {
              if (response.assets) {
                const result = response.assets[0]
                const fileUploading: any = result

                // Set name for pics/photos
                if (!fileUploading.name) {
                  fileUploading.name = result.uri.split('/').pop()
                }
                fileUploading.progress = 0
                fileUploading.currentFolder = currentFolder
                fileUploading.createdAt = new Date()
                fileUploading.id = uniqueId()

                props.dispatch(fileActions.addUploadingFile(fileUploading))
                // upload(fileUploading);
              }
            });
          }
        }}/>

      <SettingsItem
        text={'New folder'}
        icon={Unicons.UilFolderUpload}
        onPress={() => {
          props.dispatch(layoutActions.openCreateFolderModal());
          props.dispatch(layoutActions.closeUploadFileModal());
        }}
      />

      <Separator />
      <View style={styles.cancelContainer}>
        <SettingsItem
          text={<Text style={styles.cancelText}>Cancel</Text>}
          onPress={() => {
            props.dispatch(layoutActions.closeUploadFileModal());
          }}
        />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalSettings: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: 350
  },
  drawerKnob: {
    alignSelf: 'center',
    backgroundColor: '#0F62FE',
    borderRadius: 4,
    height: 4,
    margin: 12,
    width: 50
  },
  cancelText: {
    color: '#f00',
    textAlign: 'center',
    flexGrow: 1,
    fontFamily: 'NeueEinstellung-Regular',
    fontSize: 19,
    fontWeight: '500'
  },
  modalTitle: {
    color: '#42526E',
    fontFamily: 'NeueEinstellung-Regular',
    fontSize: 16,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: 'bold'
  },
  cancelContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    flexGrow: 1,
    marginBottom: 16
  },
  alignCenter: { alignItems: 'center' }
})

const mapStateToProps = (state: any) => {
  return {
    user: state.authenticationState.user,
    layoutState: state.layoutState
  };
};

export default connect(mapStateToProps)(UploadModal);
