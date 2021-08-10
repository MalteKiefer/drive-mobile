import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import AppMenu from '../../components/AppMenu';
import { Reducers } from '../../redux/reducers/reducers';
import IndividualsTab from './IndividualsTab';

const Tab = createMaterialTopTabNavigator();

function Billing(props: Reducers) {
  return <View>
    <AppMenu {...props} title="Billing" onBackPress={() => {
      props.navigation.goBack();
    }} />

    <Tab.Navigator>
      <Tab.Screen name="Individuals" component={IndividualsTab} />
    </Tab.Navigator>

  </View>;
}

const mapStateToProps = (state: any) => ({ ...state });

export default connect(mapStateToProps)(Billing);