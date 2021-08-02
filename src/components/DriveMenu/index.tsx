import React from 'react';
import { View, StyleSheet } from 'react-native';
import MainIcon from '../../../assets/icons/figma-icons/add-main.svg'
import * as Unicons from '@iconscout/react-native-unicons'

export default function DriveMenu(): JSX.Element {
  return <View style={styles.container}>
    <View>
      <Unicons.UilHdd size={28} color="#C1C7D0" />
    </View>
    <View>
      <Unicons.UilClockEight size={28} color="#C1C7D0" />
    </View>
    <View>
      <MainIcon />
    </View>
    <View>
      <Unicons.UilLinkAdd size={28} color="#C1C7D0" />
    </View>
    <View>
      <Unicons.UilCog size={28} color="#C1C7D0" />
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