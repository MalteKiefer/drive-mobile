import prettysize from 'prettysize';
import React, { useEffect, useState } from 'react'
import { Image, Platform, StyleSheet, Text, View } from 'react-native'
import { TextInput } from 'react-native-gesture-handler';
import Modal from 'react-native-modalbox'
import TimeAgo from 'react-native-timeago';
import { connect } from 'react-redux';
import Separator from '../../components/Separator';
import { getIcon } from '../../helpers/getIcon';
import { fileActions, layoutActions } from '../../redux/actions';
import SettingsItem from '../SettingsModal/SettingsItem';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { updateFileMetadata, updateFolderMetadata } from './actions';
import analytics, { getLyticsData } from '../../helpers/lytics';
import strings from '../../../assets/lang/strings';

interface FileDetailsProps {
  dispatch?: any
  showItemModal: boolean
  selectedItems: any[]
  folderContent: any
}

function FileDetailsModal(props: FileDetailsProps) {
  const [originalfilename, setOriginalFileName] = useState('')
  const [newfilename, setNewFileName] = useState('')

  const selectedItems = props.selectedItems
  const showModal = props.showItemModal && selectedItems.length > 0

  const file = selectedItems.length > 0 && selectedItems[0]
  const isFolder = file && !selectedItems[0].fileId
  const folder = isFolder && file

  useEffect(() => {
    if (props.showItemModal === true) {
      setOriginalFileName(file.name)
      setNewFileName(file.name)
    }
  }, [props.showItemModal])

  return <>
    {
      isFolder ?
        <Modal
          position={'bottom'}
          isOpen={showModal}
          swipeArea={100}
          swipeToClose={true}
          style={[styles.modal, styles.modalFolder]}
          onClosed={async () => {
            props.dispatch(fileActions.deselectAll())
            props.dispatch(layoutActions.closeItemModal())

            const metadata: any = {}

            if (newfilename !== originalfilename) {
              metadata.itemName = newfilename
            }

            if (Object.keys(metadata).length > 0) {
              await updateFolderMetadata(metadata, folder.id)

              props.dispatch(fileActions.getFolderContent(folder.parentId))
              if (newfilename !== originalfilename) {
                const userData = await getLyticsData()

                analytics.track('folder-rename', {
                  userId: userData.uuid,
                  email: userData.email,
                  platform: 'mobile',
                  device: Platform.OS,
                  folder_id: folder.id
                }).catch(() => { })
              }
            }
          }}
          backButtonClose={true}
          animationDuration={200}
        >
          <View style={styles.drawerKnob}></View>

          <TextInput
            style={styles.folderName}
            onChangeText={value => {
              setNewFileName(value)
            }}
            value={newfilename}
          />

          <Separator />

        </Modal>
        :
        <Modal
          position={'bottom'}
          swipeArea={20}
          style={[styles.modal, styles.modalSettingsFile]}
          isOpen={showModal}
          onClosed={async () => {
            props.dispatch(fileActions.deselectAll())
            props.dispatch(layoutActions.closeItemModal())

            const metadata: any = {}

            if (newfilename !== originalfilename) {
              metadata.itemName = newfilename
              await updateFileMetadata(metadata, file.fileId)
              props.dispatch(fileActions.getFolderContent(props.folderContent.currentFolder))
              const userData = await getLyticsData()

              analytics.track('file-rename', {
                userId: userData.uuid,
                email: userData.email,
                platform: 'mobile',
                device: Platform.OS,
                folder_id: file.id
              }).catch(() => { })
            }
          }}
          backButtonClose={true}
          backdropPressToClose={true}
          animationDuration={200}
        >
          <View style={styles.drawerKnob}></View>

          <TextInput
            style={styles.fileName}
            onChangeText={value => setNewFileName(value)}
            value={newfilename}
          />

          <Separator />

          <View style={styles.infoContainer}>
            <Text style={styles.textDefault}>
              <Text>{strings.components.file_and_folder_options.type}</Text>
              <Text style={styles.cerebriSansBold}>
                {file && file.type ? file.type.toUpperCase() : ''}
              </Text>
            </Text>

            <Text style={styles.textDefault}>
              <Text>{strings.components.file_and_folder_options.added}</Text>
              <Text style={styles.cerebriSansBold}>
                <TimeAgo time={file.created_at} />
              </Text>
            </Text>

            <Text style={styles.textDefault}>
              <Text>{strings.components.file_and_folder_options.size}</Text>
              <Text style={styles.cerebriSansBold}>
                {file ? prettysize(file.size) : ''}
              </Text>
            </Text>
          </View>

          <Separator />

          <View style={styles.optionsContainer}>
            <SettingsItem
              text={
                <Text>
                  <Image source={getIcon('move')} style={{ width: 20, height: 20 }} />
                  <Text style={styles.mr20}> </Text>
                  <Text style={styles.cerebriSansBold}> {strings.components.file_and_folder_options.move}</Text>
                </Text>
              }
              onPress={() => {
                props.dispatch(layoutActions.openMoveFilesModal());
              }}
            />

            <SettingsItem
              text={
                <Text>
                  <Image source={getIcon('share')} style={{ width: 20, height: 14 }} />
                  <Text style={styles.mr20}> </Text>
                  <Text style={{}}> {strings.components.file_and_folder_options.share}</Text>
                </Text>
              }
              onPress={() => {
                props.dispatch(layoutActions.closeItemModal())
                props.dispatch(layoutActions.openShareModal())
              }}
            />

            <SettingsItem
              text={<Text>
                <Image source={getIcon('delete')} style={{ width: 16, height: 21 }} />
                <Text style={styles.mr20}> </Text>
                <Text style={styles.cerebriSansBold}>  {strings.components.file_and_folder_options.delete}</Text>
              </Text>}
              onPress={() => {
                props.dispatch(layoutActions.openDeleteModal())
              }}
            />
          </View>
        </Modal>}
  </>;
}

const mapStateToProps = (state: any) => {
  return {
    folderContent: state.filesState.folderContent,
    showItemModal: state.layoutState.showItemModal,
    selectedItems: state.filesState.selectedItems
  }
}

export default connect(mapStateToProps)(FileDetailsModal)

const styles = StyleSheet.create({
  cerebriSansBold: {
    fontFamily: 'NeueEinstellung-Bold'
  },
  drawerKnob: {
    alignSelf: 'center',
    backgroundColor: '#0F62FE',
    borderRadius: 4,
    height: 4,
    margin: 12,
    width: 50
  },
  fileName: {
    width: wp(92),
    alignSelf: 'center',
    fontFamily: 'NeueEinstellung-Bold',
    fontSize: 20,
    padding: 0 // remove default padding on Android
  },
  folderName: {
    fontFamily: 'NeueEinstellung-Bold',
    fontSize: 20,
    marginLeft: 26,
    padding: 0 // Remove default padding Android
  },
  infoContainer: {
    height: 'auto'
  },
  modal: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32
  },
  modalFolder: {
    height: hp('90%') < 550 ? 550 : Math.min(600, hp('90%')),
    marginTop: wp('12')
  },
  modalSettingsFile: {
    height: 'auto'
  },
  mr20: {
    marginRight: 20
  },
  optionsContainer: {
    marginBottom: 15
  },
  textDefault: {
    fontFamily: 'NeueEinstellung-Regular',
    fontSize: 18,
    fontWeight: 'bold',
    paddingBottom: 6,
    paddingLeft: 24
  }
})