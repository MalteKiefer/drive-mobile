import React from 'react';
import { Reducers } from '../../redux/reducers/reducers';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, View } from 'react-native';
import FileExplorer from '../FileExplorer';
import * as Unicons from '@iconscout/react-native-unicons'
// eslint-disable-next-line unused-imports/no-unused-imports
import MainIcon from '../../../assets/icons/figma-icons/add-main.svg'

const Tab = createBottomTabNavigator();

const tabIcons = {
  Drive: Unicons.UilHdd,
  Recents: Unicons.UilClockEight,
  Upload: Unicons.UilPlus,
  Share: Unicons.UilLinkAdd,
  Settings: Unicons.UilCog
}

export default function TabExplorer(props: Reducers): JSX.Element {
  return <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      // eslint-disable-next-line react/display-name
      tabBarIcon: (tabProps: any) => {
        const Icon = tabIcons[route.name];

        return <Icon size={tabProps.size} color={tabProps.color} />;
      },
      tabBarActiveTintColor: '#0F62FE',
      tabBarInactiveTintColor: '#C1C7D0'
    })}
  >
    <Tab.Screen name="Drive" component={FileExplorer} />
    <Tab.Screen name="Recents" component={() => <View><Text>Recents Screen</Text></View>} />
    <Tab.Screen name="Upload" component={() => <View><Text>Upload Screen or Action?</Text></View>} />
    <Tab.Screen name="Share" component={() => <View><Text>Share screen</Text></View>} />
    <Tab.Screen name="Settings" component={() => <View><Text>Settings Screen</Text></View>} />
  </Tab.Navigator>
}