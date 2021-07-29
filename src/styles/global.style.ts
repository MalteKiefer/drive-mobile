import { StyleSheet } from 'react-native'
import { normalize } from '../helpers';

export default {
  buttonInputStyle: StyleSheet.create({
    wrapper: {
      marginTop: normalize(15)
    },
    button: {
      alignItems: 'center',
      alignSelf: 'stretch',
      backgroundColor: '#0F62FE',
      borderRadius: 10,
      height: normalize(55),
      justifyContent: 'center',
      width: normalize(130)
    },
    block: {
      width: '100%'
    },
    label: {
      color: '#fff',
      fontFamily: 'NeueEinstellung-Regular',
      fontSize: normalize(15),
      textAlign: 'center'
    }
  }),
  textInputStyle: StyleSheet.create({
    wrapper: {
      borderColor: 'rgba(0,0,0,0.25)',
      borderRadius: 10,
      borderWidth: 1,
      height: normalize(55),
      justifyContent: 'center',
      marginBottom: normalize(13)
    },
    icon: {
      position: 'absolute',
      right: 0,
      marginRight: 10
    },
    inputOpacity: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 3
      },
      shadowOpacity: 0.29,
      shadowRadius: 4.65,
      elevation: 7
    }
  }),
  text: StyleSheet.create({
    normal: {
      color: '#253858',
      fontFamily: 'NeueEinstellung-Regular'
    },
    link: {
      color: '#0F62FE',
      fontFamily: 'NeueEinstellung-Regular'
    },
    center: {
      textAlign: 'center'
    },
    mt10: {
      marginTop: 10
    }
  }),
  image: StyleSheet.create({
    center: {
      alignItems: 'center',
      justifyContent: 'center'
    }
  })
}