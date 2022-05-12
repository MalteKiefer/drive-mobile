import React, { useEffect } from 'react';
// import { NavigationParams, NavigationRoute, NavigationRouteConfigMap } from 'react-navigation';
//import { StackNavigationOptions, StackNavigationProp } from 'react-navigation-stack/lib/typescript/src/vendor/types';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import ReceiveSharingIntent from 'react-native-receive-sharing-intent';

import { AppScreenKey } from '../types';
import SignInScreen from './SignInScreen';
import SignUpScreen from './SignUpScreen';
import HomeScreen from './HomeScreen';
import StorageScreen from './StorageScreen';
import AuthenticatedNavigator from './AuthenticatedNavigator';
import BillingScreen from './BillingScreen';
import ChangePasswordScreen from './ChangePasswordScreen';
import RecoverPasswordScreen from './RecoverPasswordScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import PhotosNavigator from './PhotosNavigator';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import PhotosPreviewScreen from './PhotosNavigator/PhotosPreviewScreen';
import { appThunks } from '../store/slices/app';
import { driveActions } from '../store/slices/drive';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DebugScreen from './DebugScreen';
import analyticsService from '../services/analytics';

/*type RouteConfig = NavigationRouteConfigMap<
  StackNavigationOptions,
  StackNavigationProp<NavigationRoute<NavigationParams>, NavigationParams>,
  any
>;*/
type RouteConfig = any;

const routeConfig: RouteConfig = {
  [AppScreenKey.Debug]: { screen: DebugScreen },
  [AppScreenKey.SignUp]: { screen: SignUpScreen },
  [AppScreenKey.SignIn]: { screen: SignInScreen },
  [AppScreenKey.Home]: { screen: HomeScreen },
  [AppScreenKey.TabExplorer]: { screen: AuthenticatedNavigator },
  [AppScreenKey.ForgotPassword]: { screen: ForgotPasswordScreen },
  [AppScreenKey.Storage]: { screen: StorageScreen },
  [AppScreenKey.Billing]: { screen: BillingScreen },
  [AppScreenKey.ChangePassword]: { screen: ChangePasswordScreen },
  [AppScreenKey.RecoverPassword]: { screen: RecoverPasswordScreen },
  [AppScreenKey.Photos]: { screen: PhotosNavigator },
  [AppScreenKey.PhotosPreview]: { screen: PhotosPreviewScreen },
};

const StackNav = createNativeStackNavigator();

function AppNavigator(): JSX.Element {
  const dispatch = useAppDispatch();
  const isLoggedIn = useAppSelector((state) => state.auth.loggedIn);
  const initialRouteName = isLoggedIn ? AppScreenKey.TabExplorer : AppScreenKey.SignIn;
  const onAppLinkOpened = async (event: Linking.EventType) => {
    const sessionId = await AsyncStorage.getItem('tmpCheckoutSessionId');

    if (isLoggedIn) {
      const comesFromCheckout = !!sessionId && event.url.includes('checkout');

      if (comesFromCheckout) {
        await analyticsService.trackPayment(sessionId as string);
        await AsyncStorage.removeItem('tmpCheckoutSessionId');
      }
    }

    if (event.url) {
      const regex = /inxt:\/\//g;
      if (event.url.match(/inxt:\/\/.*:\/*/g)) {
        const finalUri = event.url.replace(regex, '');

        dispatch(driveActions.setUri(finalUri));
      }
    }
  };

  useEffect(() => {
    Linking.addEventListener('url', onAppLinkOpened);

    Linking.getInitialURL().then((uri) => {
      if (uri) {
        if (uri.match(/inxt:\/\/.*:\/*/g)) {
          const regex = /inxt:\/\//g;
          const finalUri = uri.replace(regex, '');

          dispatch(driveActions.setUri(finalUri));
        }
      }
    });

    if (Platform.OS === 'android') {
      ReceiveSharingIntent.getReceivedFiles(
        (files) => {
          const fileInfo = {
            fileUri: files[0].contentUri,
            fileName: files[0].fileName,
          };

          dispatch(driveActions.setUri(fileInfo.fileUri));
          ReceiveSharingIntent.clearReceivedFiles();
        },
        (error) => {
          Alert.alert('There was an error', error.message);
        },
        'inxt',
      );
    }

    dispatch(appThunks.initializeThunk());

    return () => {
      Linking.removeEventListener('url', onAppLinkOpened);
    };
  }, []);

  return (
    <StackNav.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
      {Object.entries(routeConfig).map(([name, component]: [string, any]) => (
        <StackNav.Screen
          key={name}
          name={name}
          component={component.screen}
          options={{ animation: 'slide_from_right' }}
        />
      ))}
    </StackNav.Navigator>
  );
}

export default AppNavigator;
