import React from 'react';
import { GestureResponderEvent, Text, TouchableHighlight, View } from 'react-native';
import { connect } from 'react-redux';
import AppMenu from '../../components/AppMenu';
import { Reducers } from '../../redux/reducers/reducers';
import * as Unicons from '@iconscout/react-native-unicons'
import { tailwind } from '../../helpers/designSystem';

function ConfigurationItem(props: {
  title: string,
  onPress?: (event: GestureResponderEvent) => void
}) {
  return <TouchableHighlight onPress={(event) => {
    if (props.onPress) {
      props.onPress(event);
    }
  }}>
    <View style={[tailwind('bg-white flex-row'), {
      height: 56,
      borderBottomWidth: 1,
      borderColor: '#DFE1E6',
      padding: 17
    }]}>
      <View style={tailwind('flex-grow justify-center')}>
        <Text>{props.title}</Text>
      </View>
      <View style={tailwind('justify-center')}>
        <Unicons.UilAngleRightB color="#C1C7D0" />
      </View>
    </View>
  </TouchableHighlight>
}

function ConfigurationGap() {
  return <View style={{ height: 17 }} />
}

function Configuration(props: Reducers): JSX.Element {
  return <View>
    <AppMenu {...props} title="Settings" hideSearch={true} hideOptions={true} />
    <ConfigurationItem title="Storage"
      onPress={() => {
        props.navigation.push('Storage')
      }} />
    <ConfigurationItem title="Billing"
      onPress={() => {
        props.navigation.push('Billing')
      }} />
    <ConfigurationGap />
    <ConfigurationItem title="Security" />
    <ConfigurationItem title="Change password"
      onPress={() => {
        props.navigation.push('ChangePassword')
      }} />
    <ConfigurationGap />
    <ConfigurationItem title="Contact" />
    <ConfigurationItem title="More info" />
    <ConfigurationItem title="Log out" />
  </View>
}
const mapStateToProps = (state: any) => {
  return { ...state }
};

export default connect(mapStateToProps)(Configuration);
