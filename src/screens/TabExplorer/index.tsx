import React from 'react';
import { Reducers } from '../../redux/reducers/reducers';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import FileExplorer from '../FileExplorer';
import Recents from '../Recents';
import Share from '../Share';
import Configuration from '../Configuration';
import MyTabBar from './myTabBar';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs/lib/typescript/src/types'
import VoidScreen from '../VoidScreen';

const Tab = createBottomTabNavigator();

export default function TabExplorer(props: Reducers): JSX.Element {
  return <Tab.Navigator
    tabBar={(tabBarProps: BottomTabBarProps) => <MyTabBar {...{ ...props, ...tabBarProps }} />}
    initialRouteName={'FileExplorer'}
    screenOptions={({ route }) => ({
      headerShown: false
    })}
  >
    <Tab.Screen name="Drive" component={FileExplorer} />
    <Tab.Screen name="Recents" component={Recents} />
    <Tab.Screen name="Upload" component={VoidScreen} />
    <Tab.Screen name="Share" component={Share} />
    <Tab.Screen name="Settings" component={Configuration} />
  </ Tab.Navigator>
}