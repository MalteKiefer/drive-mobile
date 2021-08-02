import React from 'react'
import { View, StyleSheet, Text } from 'react-native';
import Modal from 'react-native-modalbox'
import { layoutActions } from '../../redux/actions';
import SettingsItem from '../SettingsModal/SettingsItem';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { LayoutState } from '../../redux/reducers/layout.reducer';

interface UploadModalProps {
  layoutState: LayoutState
  dispatch: Dispatch,
  navigation: any
}

function UploadModal(props: UploadModalProps) {
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
        }}
      />

      <SettingsItem
        text={'Take photo & upload'}
        onPress={() => {

        }}
      />

      <SettingsItem
        text={'Upload media'}
        onPress={() => {
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
