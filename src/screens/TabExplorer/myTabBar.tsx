import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import * as Unicons from '@iconscout/react-native-unicons'
import MainIcon from '../../../assets/icons/figma-icons/add-main.svg'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

const tabIcons = {
  Drive: Unicons.UilHdd,
  Recents: Unicons.UilClockEight,
  Upload: MainIcon,
  Share: Unicons.UilLinkAdd,
  Settings: Unicons.UilCog
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function MyTabBar(props: any): JSX.Element {

  return (
    <View style={styles.tabContainer}>
      {props.state.routes.map((route, index) => {
        const { options } = props.descriptors[route.key];
        const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;

        const isFocused = props.state.index === index;

        const onPress = () => {

          if (route.name === 'Upload') {
            return Alert.alert('Upload');
          }
          const event = props.navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true
          });

          if (!isFocused && !event.defaultPrevented) {
            props.navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          props.navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        const Icon = tabIcons[route.name];

        return (
          // eslint-disable-next-line react/jsx-key
          <TouchableWithoutFeedback
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
          >
            <View style={styles.tabItem}>
              <Icon size={30} color={isFocused ? '#0F62FE' : '#C1C7D0'} />
              {/*<Text style={{ color: isFocused ? '#0F62FE' : '#C1C7D0' }}>
                {label}
                </Text>*/}
            </View>
          </TouchableWithoutFeedback>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    paddingTop: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#C1C7D0',
    paddingLeft: 19,
    paddingRight: 19,
    paddingBottom: 16
  },
  tabItem: {
    flexDirection: 'column',
    alignItems: 'center',
    width: 70
  }
});