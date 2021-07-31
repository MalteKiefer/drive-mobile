import React from 'react';
import { View, StyleSheet } from 'react-native';
import HddIcon from '../../../assets/icons/figma-icons/hdd.svg'
import RecentsIcons from '../../../assets/icons/figma-icons/clock.svg'
import ShareIcon from '../../../assets/icons/figma-icons/link-add.svg'
import SettingsIcon from '../../../assets/icons/figma-icons/settings.svg'
import MainIcon from '../../../assets/icons/figma-icons/add-main.svg'

export default function DriveMenu() {
  return <View style={styles.container}>
    <View>
      <HddIcon />
    </View>
    <View>
      <RecentsIcons />
    </View>
    <View>
      <MainIcon />
    </View>
    <View>
      <ShareIcon />
    </View>
    <View>
      <SettingsIcon />
    </View>
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