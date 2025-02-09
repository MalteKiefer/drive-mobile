import { Photo } from '@internxt/sdk/dist/photos';
import { NativeStackScreenProps, NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp, CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabNavigationProp, BottomTabScreenProps } from '@react-navigation/bottom-tabs';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Debug: undefined;
  SignUp: undefined;
  SignIn: undefined;
  TabExplorer: NavigatorScreenParams<TabExplorerStackParamList> & { showReferralsBanner?: boolean };
  ForgotPassword: undefined;
  PhotosPreview: {
    data: Omit<Photo, 'takenAt' | 'statusChangedAt' | 'createdAt' | 'updatedAt'> & {
      takenAt: string;
      statusChangedAt: string;
      createdAt: string;
      updatedAt: string;
    };
    preview: string;
  };
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;

export type RootScreenNavigationProp<Screen extends keyof RootStackParamList> = NativeStackNavigationProp<
  RootStackParamList,
  Screen
>;

export type TabExplorerStackParamList = {
  Home: undefined;
  Drive: undefined;
  Add: undefined;
  Photos: undefined;
  Settings: undefined;
};

export type TabExplorerScreenProps<Screen extends keyof TabExplorerStackParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabExplorerStackParamList, Screen>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type TabExplorerScreenNavigationProp<Screen extends keyof TabExplorerStackParamList> = CompositeNavigationProp<
  BottomTabNavigationProp<TabExplorerStackParamList, Screen>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type PhotosStackParamList = {
  PhotosPermissions: undefined;
  PhotosGallery: undefined;
};

export type PhotosScreenProps<Screen extends keyof PhotosStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<PhotosStackParamList, Screen>,
  TabExplorerScreenProps<keyof TabExplorerStackParamList>
>;

export type PhotosScreenNavigationProp<Screen extends keyof PhotosStackParamList> = CompositeNavigationProp<
  NativeStackNavigationProp<PhotosStackParamList, Screen>,
  TabExplorerScreenNavigationProp<keyof TabExplorerStackParamList>
>;

export type SettingsStackParamList = {
  SettingsHome: undefined;
  Account: undefined;
  Storage: undefined;
  Plan: undefined;
  Security: undefined;
};

export type SettingsScreenProps<Screen extends keyof SettingsStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<SettingsStackParamList, Screen>,
  TabExplorerScreenProps<keyof TabExplorerStackParamList>
>;

export type SettingsScreenNavigationProp<Screen extends keyof SettingsStackParamList> = CompositeNavigationProp<
  NativeStackNavigationProp<SettingsStackParamList, Screen>,
  TabExplorerScreenNavigationProp<keyof TabExplorerStackParamList>
>;
