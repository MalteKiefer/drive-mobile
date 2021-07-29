import React, { useEffect } from 'react'
import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, StyleSheet, Alert } from 'react-native';
import { TextInput, TouchableHighlight } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import strings from '../../../assets/lang/strings';
import { deviceStorage } from '../../helpers';
import analytics from '../../helpers/lytics';
import { normalize } from '../../helpers/normalize'
import { userActions } from '../../redux/actions';
import { AuthenticationState } from '../../redux/reducers/authentication.reducer';
import { Reducers } from '../../redux/reducers/reducers';
import globalStyles from '../../styles/global.style';
import { validate2FA, apiLogin } from './access';
import InternxtLogo from '../../../assets/logo.svg'
import EnvelopeIcon from '../../../assets/icons/figma-icons/envelope.svg'
import EyeIcon from '../../../assets/icons/figma-icons/eye.svg'

interface LoginProps extends Reducers {
  goToForm?: (screenName: string) => void
  dispatch?: any
  navigation?: any
  authenticationState: AuthenticationState
}

function Login(props: LoginProps): JSX.Element {
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [showTwoFactor, setShowTwoFactor] = useState(false)

  const handleOnPress = async () => {
    setIsLoading(true)

    try {
      const userLoginData = await apiLogin(email)

      if (userLoginData.tfa && !twoFactorCode) { setShowTwoFactor(true) }
      else { await props.dispatch(userActions.signin(email, password, userLoginData.sKey, twoFactorCode)) }

    } catch (err) {
      analytics.track('user-signin-attempted', {
        status: 'error',
        message: err.message
      }).catch(() => { })

      Alert.alert('Could not log in', err.message)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (props.authenticationState.error) {
      Alert.alert('Login error', props.authenticationState.error)
      setIsLoading(false)
    }
  }, [props.authenticationState])

  useEffect(() => {
    if (props.authenticationState.loggedIn === true) {
      const rootFolderId = props.authenticationState.user.root_folder_id;

      props.navigation.replace('FileExplorer', {
        folderId: rootFolderId
      })
    } else {
      (async () => {
        const xToken = await deviceStorage.getItem('xToken')
        const xUser = await deviceStorage.getItem('xUser')

        if (xToken && xUser) {
          props.dispatch(userActions.localSignIn(xToken, xUser))
        } else {
          setIsLoading(false)
        }
      })()
    }
  }, [props.authenticationState.loggedIn, props.authenticationState.token])

  return (
    <KeyboardAvoidingView behavior='height' style={styles.container}>
      <View style={[styles.containerCentered, isLoading ? styles.halfOpacity : {}]}>
        <View style={styles.containerHeader}>
          <View style={[styles.flexRow, styles.title]}>
            <InternxtLogo />
          </View>
        </View>

        <View style={showTwoFactor ? styles.hideInputFieldWrapper : styles.showInputFieldsWrapper}>
          <View style={globalStyles.textInputStyle.wrapper}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={value => setEmail(value)}
              placeholder={strings.components.inputs.email}
              placeholderTextColor="#666"
              maxLength={64}
              keyboardType="email-address"
              autoCapitalize={'none'}
              autoCorrect={false}
              textContentType="emailAddress"
              editable={!isLoading}
            />
            <EnvelopeIcon style={globalStyles.textInputStyle.icon} />
          </View>

          <View style={globalStyles.textInputStyle.wrapper}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={value => setPassword(value)}
              placeholder={strings.components.inputs.password}
              placeholderTextColor="#666"
              secureTextEntry={true}
              textContentType="password"
              editable={!isLoading}
            />
            <EyeIcon style={globalStyles.textInputStyle.icon} />
          </View>
        </View>

        <View style={showTwoFactor ? styles.showInputFieldsWrapper : styles.hideInputFieldWrapper}>
          <View style={globalStyles.textInputStyle.wrapper}>
            <TextInput
              style={[styles.input, validate2FA(twoFactorCode) ? {} : { borderWidth: 1, borderColor: '#f00' }]}
              value={twoFactorCode}
              onChangeText={value => setTwoFactorCode(value)}
              placeholder="Two-factor code"
              placeholderTextColor="#666"
              maxLength={64}
              keyboardType="numeric"
              textContentType="none" />
          </View>
        </View>

        <View style={globalStyles.buttonInputStyle.wrapper}>
          <TouchableHighlight
            style={[globalStyles.buttonInputStyle.button, globalStyles.buttonInputStyle.block]}
            underlayColor="#4585f5"
            onPress={() => handleOnPress()}>
            <Text style={styles.buttonOnLabel}>{isLoading ? strings.components.buttons.descrypting : strings.components.buttons.sign_in}</Text>
          </TouchableHighlight>

          <Text style={[globalStyles.text.link, globalStyles.text.center, globalStyles.text.mt10]} onPress={() => props.navigation.replace('Forgot')}>
            {strings.screens.login_screen.forgot}
          </Text>

          <Text style={[globalStyles.text.center, globalStyles.text.mt10]} onPress={() => props.navigation.replace('Register')}>
            <Text style={globalStyles.text.normal}>{strings.screens.login_screen.no_register},{' '}</Text>
            <Text style={globalStyles.text.link}>{strings.screens.login_screen.register}</Text>
          </Text>
        </View>
      </View>

      <Text style={styles.versionLabel}>Internxt Drive v1.3.9 (1)</Text>
    </KeyboardAvoidingView>
  )
}

const mapStateToProps = (state: any) => {
  return { authenticationState: state.authenticationState };
};

export default connect(mapStateToProps)(Login)

const styles = StyleSheet.create({
  buttonOnLabel: {
    color: '#fff',
    fontFamily: 'NeueEinstellung-Medium',
    fontSize: normalize(15),
    textAlign: 'center'
  },
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    justifyContent: 'center',
    padding: normalize(20)
  },
  containerCentered: {
    alignSelf: 'center',
    height: 600,
    justifyContent: 'center',
    width: '100%'
  },
  containerHeader: {
  },
  flexRow: {
    flexDirection: 'row'
  },
  halfOpacity: {
    opacity: 0.5
  },
  hideInputFieldWrapper: {
    display: 'none'
  },
  input: {
    color: '#000',
    flex: 1,
    fontFamily: 'NeueEinstellung-Medium',
    fontSize: normalize(15),
    letterSpacing: -0.2,
    paddingLeft: normalize(20)
  },
  showInputFieldsWrapper: {
    justifyContent: 'center'
  },
  title: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(30),
    marginTop: normalize(64)
  },
  versionLabel: {
    alignSelf: 'center',
    color: '#999999',
    fontFamily: 'NeueEinstellung-Regular',
    marginBottom: normalize(70),
    marginTop: normalize(30)
  }
});