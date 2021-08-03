import React from 'react';
import { Reducers } from '../../redux/reducers/reducers';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import FileExplorer from '../FileExplorer';
// eslint-disable-next-line unused-imports/no-unused-imports
import Recents from '../Recents';
import Share from '../Share';
import Configuration from '../Configuration';
import MyTabBar from './myTabBar';

const Tab = createBottomTabNavigator();

export default function TabExplorer(props: Reducers): JSX.Element {
  return <Tab.Navigator
    tabBar={props => <MyTabBar {...props} />}
    screenOptions={({ route }) => ({
      headerShown: false
    })}
  >
    <Tab.Screen name="Drive" component={FileExplorer} />
    <Tab.Screen name="Recents" component={Recents} />
    <Tab.Screen name="Upload" component={FileExplorer} />
    <Tab.Screen name="Share" component={Share} />
    <Tab.Screen name="Settings" component={Configuration} />
  </ Tab.Navigator>
}