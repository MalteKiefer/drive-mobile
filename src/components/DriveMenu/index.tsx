import React from 'react';
import { View, StyleSheet } from 'react-native';
import MainIcon from '../../../assets/icons/figma-icons/add-main.svg'
import * as Unicons from '@iconscout/react-native-unicons'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { layoutActions } from '../../redux/actions';

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
