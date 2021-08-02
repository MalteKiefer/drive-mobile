import { isValidEmail, sendDeactivationsEmail } from './ForgotUtils';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  TextInput,
  TouchableHighlight
} from 'react-native';
import React, { useEffect, useState } from 'react'
import { normalize } from '../../helpers';
import { connect } from 'react-redux';
import strings from '../../../assets/lang/strings';
import InternxtLogo from '../../../assets/logo.svg'
import globalStyle from '../../styles/global.style';
import { tailwind } from '../../helpers/designSystem';
import EnvelopeIcon from '../../../assets/icons/figma-icons/envelope.svg'

function Forgot(props: any): JSX.Element {
  const [currentContainer, setCurrentCointainer] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Get email form field
  const [email, setIsEmail] = useState('');
  const isValidEmailField = isValidEmail(email);

  useEffect(() => { // do something after isLoading has updated
    if (isLoading === true) {
      if (!isValidEmailField) {
        setIsLoading(false)
        return Alert.alert('Warning', 'Enter a valid e-mail address');
      }
    }

  }, [isLoading])

  const sendDeactivationEmail = () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true)
    sendDeactivationsEmail(email).then(() => {
      setIsLoading(false)
      setCurrentCointainer(2)

    }).catch(() => {
      setIsLoading(false)
      return Alert.alert('Error', 'Connection to server failed');
    });

  }

  if (currentContainer === 1) {
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <View
          style={[
            styles.containerCentered,
            isLoading ? styles.halfOpacity : {}
          ]}
        >
          <View style={styles.containerHeader}>
            <View style={tailwind('items-center pb-10')}>
              <InternxtLogo />
            </View>

            <Text style={tailwind('text-sm')}>
              {strings.screens.forgot_password.subtitle_1}

              <Text style={styles.bold}>{strings.screens.forgot_password.bold}</Text>

              {strings.screens.forgot_password.subtitle_2}
            </Text>

            <View style={globalStyle.textInputStyle.wrapper}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(value) => setIsEmail(value)}
                placeholder={strings.components.inputs.email}
                placeholderTextColor="#666666"
                maxLength={64}
                keyboardType="email-address"
                textContentType="emailAddress"
              />
              <EnvelopeIcon
                fill="#aaa"
                style={globalStyle.textInputStyle.icon} />
            </View>

            <View style={globalStyle.buttonInputStyle.wrapper}>
              <TouchableHighlight
                style={tailwind('bg-blue-60 h-16')}
                onPress={() => sendDeactivationEmail()}
              >
                <Text style={tailwind('text-base text-red-60')}>
                  GGG
                  {strings.components.buttons.continue}
                </Text>
              </TouchableHighlight>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    );

  }

  if (currentContainer === 2) {
    return (
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <View
          style={[
            styles.containerCentered,
            isLoading ? styles.halfOpacity : {}
          ]}
        >
          <View style={styles.containerHeader}>
            <View style={styles.flexRow}>
              <Text style={styles.title}>{strings.screens.deactivation_screen.title}</Text>
            </View>

            <Text style={styles.text}>
              {strings.screens.deactivation_screen.subtitle_1}
            </Text>

            <View style={styles.grayBox}>
              <Text style={styles.grayBoxText}>
                {strings.screens.deactivation_screen.subtitle_2}
              </Text>
            </View>

            <View style={styles.buttonWrapper}>
              <TouchableHighlight
                style={[styles.button, styles.buttonOn]}
                underlayColor="#00aaff"
                onPress={() => sendDeactivationEmail()}
              >
                <Text style={styles.buttonOnLabel}>
                  {strings.components.buttons.deactivation}
                </Text>
              </TouchableHighlight>
            </View>

            <Text
              style={tailwind('')}
              onPress={() => props.navigation.replace('Register')}
            >
              {strings.components.buttons.sing_up}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    );

  }

  return <></>;

}
const mapStateToProps = (state: any) => {
  return { ...state };
};

export default connect(mapStateToProps)(Forgot)

const styles = StyleSheet.create({
  bold: {
    fontFamily: 'NeueEinstellung-Bold'
  },
  button: {
    alignItems: 'center',
    borderRadius: 3.4,
    height: normalize(55),
    justifyContent: 'center',
    marginTop: normalize(10),
    width: '45%'
  },
  buttonOn: {
    backgroundColor: '#4585f5',
    flex: 1
  },
  buttonOnLabel: {
    color: '#fff',
    fontFamily: 'NeueEinstellung-Medium',
    fontSize: normalize(15)
  },
  buttonWrapper: {
    flexDirection: 'row',
    marginTop: normalize(15)
  },
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    justifyContent: 'center',
    padding: normalize(20)
  },
  containerCentered: {
    alignSelf: 'center',
    height: normalize(600),
    justifyContent: 'center',
    width: '100%'
  },
  containerHeader: {
  },
  flexRow: {
    flexDirection: 'row'
  },
  grayBox: {
    backgroundColor: '#f7f7f7',
    padding: normalize(23)
  },
  grayBoxText: {
    color: '#737880',
    fontFamily: 'NeueEinstellung-Regular',
    fontSize: normalize(15)
  },
  halfOpacity: {
    opacity: 0.5
  },
  input: {
    color: '#000',
    flex: 1,
    fontFamily: 'NeueEinstellung-Medium',
    fontSize: normalize(15),
    letterSpacing: -0.2,
    paddingLeft: normalize(20)
  },
  text: {
    color: '#737880',
    fontFamily: 'NeueEinstellung-Regular',
    fontSize: normalize(15),
    marginBottom: normalize(20),
    textAlign: 'justify'
  },
  title: {
    color: '#000',
    fontFamily: 'NeueEinstellung-Bold',
    fontSize: normalize(22),
    letterSpacing: -1.5,
    marginBottom: normalize(15),
    marginTop: normalize(-25)
  }
});