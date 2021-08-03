import React from 'react'
import { CreateNavigatorConfig, NavigationParams, NavigationRoute, NavigationRouteConfigMap, NavigationStackRouterConfig, NavigationState } from 'react-navigation';
import { StackNavigationConfig, StackNavigationOptions, StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
import analytics from './helpers/lytics';
import CreateFolder from './screens/CreateFolder';
import Intro from './screens/Intro';
import Login from './screens/Login';
import Register from './screens/Register';
import Forgot from './screens/Forgot';
import OutOfSpace from './screens/OutOfSpace';
import Storage from './screens/Storage';
import StorageWebView from './screens/StorageWebView';
import EntryGateway from './screens/EntryGateway';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabExplorer from './screens/TabExplorer';

type RouteConfig = NavigationRouteConfigMap<StackNavigationOptions, StackNavigationProp<NavigationRoute<NavigationParams>, NavigationParams>, any>
type NavigatorOptions = CreateNavigatorConfig<StackNavigationConfig, NavigationStackRouterConfig, StackNavigationOptions, StackNavigationProp<NavigationRoute<NavigationParams>, NavigationParams>>

const routeConfig: RouteConfig = {
  EntryPoint: { screen: EntryGateway },
  Register: { screen: Register },
  Login: { screen: Login },
  Intro: { screen: Intro },
  FileExplorer: { screen: TabExplorer },
  CreateFolder: { screen: CreateFolder },
  Forgot: { screen: Forgot },
  OutOfSpace: { screen: OutOfSpace },
  Storage: { screen: Storage },
  StorageWebView: { screen: StorageWebView }
};

const navigatorOptions: NavigatorOptions = {
  initialRouteName: 'Login',
  headerMode: 'none'
};

const StackNav = createNativeStackNavigator();

function trackScreen(previousScreen: NavigationState, nextScreen: NavigationState) {
  try {
    const routeName = nextScreen.routes[0].routeName

    analytics.screen(routeName)
  } catch {
  }
}

function AppNavigator(): JSX.Element {
  return <StackNav.Navigator screenOptions={{ headerShown: false }}>
    {Object.entries(routeConfig).map(([name, component]) => (
      <StackNav.Screen key={name} name={name} component={component.screen} />
    ))}
  </StackNav.Navigator>;
}

export default AppNavigator