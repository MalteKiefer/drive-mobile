import React from 'react'
import { View, StyleSheet, Text, Alert } from 'react-native';
import Modal from 'react-native-modalbox'
import { fileActions, layoutActions } from '../../redux/actions';
import SettingsItem from '../SettingsModal/SettingsItem';
import { connect } from 'react-redux';
import { uniqueId } from 'lodash';
import { uploadFile } from '../../services/upload';
import { launchCameraAsync, launchImageLibraryAsync, MediaTypeOptions, requestCameraPermissionsAsync, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import { getDocumentAsync } from 'expo-document-picker'

function UploadModal(props: any) {

  const currentFolder =
    props.filesState?.folderContent?.currentFolder
    ||
    props.authenticationState?.user?.root_folder_id || 123; // TODO: Fix this

  return (
    <Modal
      isOpen={props.layoutState.showUploadModal}
      position={'bottom'}
      entry={'bottom'}
      coverScreen={false}
      swipeThreshold={40}
      swipeToClose={true}
      style={styles.modalSettings}
      onClosed={() => {
        props.dispatch(layoutActions.closeUploadFileModal())
      }}
      backButtonClose={true}
      animationDuration={200}>

      <View style={styles.drawerKnob}></View>

      <View style={{ alignItems: 'center' }}>
        <Text>Upload</Text>
      </View>

      <SettingsItem
        text={'Upload file'}
        onPress={() => {
          const result = getDocumentAsync({
            copyToCacheDirectory: false
          })

          if (result.type !== 'cancel') {
            const fileUploading: any = result

            fileUploading.progress = 0
            fileUploading.currentFolder = currentFolder
            fileUploading.createdAt = new Date()
            fileUploading.id = uniqueId()

            props.dispatch(fileActions.addUploadingFile(fileUploading))
            uploadFile(props, fileUploading, currentFolder)
          }
        }}
      />

      <SettingsItem
        text={'Take photo & upload'}
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
              uploadFile(props, fileUploading, currentFolder)
            }
          }
        }}
      />

      <SettingsItem
        text={'Upload media'}
        onPress={async () => {
          const { status } = await requestMediaLibraryPermissionsAsync(false)

          if (status === 'granted') {
            const result = await launchImageLibraryAsync({ mediaTypes: MediaTypeOptions.All })

            if (!result.cancelled) {
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
              uploadFile(props, fileUploading, fileUploading.currentFolder)
            }
          } else {
            Alert.alert('Camera roll permissions needed to perform this action')
          }
        }}
      />

      <SettingsItem
        text={'New folder'}
        onPress={() => {
        }}
      />
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalSettings: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: 300
  },
  drawerKnob: {
    alignSelf: 'center',
    backgroundColor: '#0F62FE',
    borderRadius: 4,
    height: 4,
    margin: 12,
    width: 50
  }
})

const mapStateToProps = (state: any) => {
  return {
    user: state.authenticationState.user,
    layoutState: state.layoutState
  };
};

export default connect(mapStateToProps)(UploadModal);
