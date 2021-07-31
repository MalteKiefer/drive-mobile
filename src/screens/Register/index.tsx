import React, { useEffect, useState } from 'react'
import { KeyboardAvoidingView, StyleSheet, TextInput, TouchableOpacity, View, Text, Alert } from 'react-native';
import CheckBox from '../../components/CheckBox'
import { connect } from 'react-redux';
import strings from '../../../assets/lang/strings';
import { deviceStorage, normalize } from '../../helpers';
import { userActions } from '../../redux/actions';
import { AuthenticationState } from '../../redux/reducers/authentication.reducer';
import Intro from '../Intro'
import { apiLogin, validateEmail } from '../Login/access';
import { doRegister, isNullOrEmpty, isStrongPassword } from './registerUtils';
import InternxtLogo from '../../../assets/logo.svg'
import globalStyles from '../../styles/global.style';
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import analytics from '../../helpers/lytics';
import EnvelopeIcon from '../../../assets/icons/figma-icons/envelope.svg'
import EyeIcon from '../../../assets/icons/figma-icons/eye.svg'
import UserIcon from '../../../assets/icons/figma-icons/user.svg'
import { tailwind } from '../../helpers/designSystem';

interface RegisterProps {
  authenticationState: AuthenticationState
  navigation: any
  dispatch: any
}

function Register(props: RegisterProps): JSX.Element {
  const [showIntro, setShowIntro] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const twoFactorCode = '';

  // Register form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptPolicy, setAcceptPolicy] = useState(false);

  const isValidEmail = validateEmail(email);
  const isValidFirstName = !isNullOrEmpty(firstName)
  const isValidLastName = !isNullOrEmpty(lastName)
  const isValidPassword = isStrongPassword(password);
  const passwordConfirmed = password === confirmPassword;

  const isValidForm = isValidEmail
    && isValidFirstName
    && isValidLastName
    && isValidPassword
    && passwordConfirmed;

  const [registerButtonClicked, setRegisterButtonClicked] = useState(false);

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
        }
      })()
    }
  }, [props.authenticationState.loggedIn, props.authenticationState.token])

  if (showIntro) {
    return <Intro onFinish={() => setShowIntro(false)} />;
  }

  const handleOnPress = async () => {
    if (!isValidPassword) { return Alert.alert('', 'Please make sure your password contains at least six characters, a number, and a letter') }
    if (password !== confirmPassword) { return Alert.alert('', 'Please make sure your passwords match') }
    if (registerButtonClicked || isLoading) { return }

    setRegisterButtonClicked(true)
    setIsLoading(true)

    try {
      const userData = await doRegister({ firstName: firstName, lastName: lastName, email: email, password: password })

      await Promise.all([
        analytics.identify(userData.uuid, { email: email }),
        analytics.track('user-signup', {
          properties: {
            userId: userData.uuid,
            email: email,
            platform: 'mobile'
          }
        })
      ])

      const userLoginData = await apiLogin(email)

      await props.dispatch(userActions.signin(email, password, userLoginData.sKey, twoFactorCode))

    } catch (err) {
      await analytics.track('user-signin-attempted', {
        status: 'error',
        message: err.message
      })
      setIsLoading(false)
      setRegisterButtonClicked(false)

      Alert.alert('Error while registering', err.message)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={styles.container}>
      <ScrollView style={globalStyles.container.pn20}>
        <View style={styles.containerCentered}>
          <View style={[styles.containerHeader, globalStyles.container.pv40]}>
            <View style={globalStyles.image.center}>
              <InternxtLogo />
            </View>
            <View>
              <Text style={[globalStyles.text.normal, globalStyles.text.center]}>{strings.screens.register_screen.create_account_title}</Text>
            </View>
          </View>

          <View style={styles.showInputFieldsWrapper}>
            <View style={globalStyles.textInputStyle.wrapper}>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={value => setFirstName(value)}
                placeholder={strings.components.inputs.first_name}
                placeholderTextColor="#666"
                maxLength={64}
                autoCapitalize='words'
                autoCompleteType='off'
                key='name'
                autoCorrect={false}
              />
              <UserIcon style={globalStyles.textInputStyle.icon} />
            </View>

            <View style={globalStyles.textInputStyle.wrapper}>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={value => setLastName(value)}
                placeholder={strings.components.inputs.last_name}
                placeholderTextColor="#666"
                maxLength={64}
                autoCapitalize='words'
                autoCompleteType='off'
                key='lastname'
                autoCorrect={false}
              />
              <UserIcon style={globalStyles.textInputStyle.icon} />
            </View>

            <View style={globalStyles.textInputStyle.wrapper}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={value => setEmail(value)}
                placeholder={strings.components.inputs.email}
                placeholderTextColor="#666"
                maxLength={64}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCompleteType="off"
                autoCorrect={false}
                key='mailaddress'
                textContentType="emailAddress"
              />
              <EnvelopeIcon style={globalStyles.textInputStyle.icon} />
            </View>
          </View>

          <View style={styles.showInputFieldsWrapper}>
            <View style={[globalStyles.textInputStyle.wrapper, !isValidPassword && globalStyles.textInputStyle.error]}>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder={strings.components.inputs.password}
                placeholderTextColor="#666"
                textContentType="password"
                autoCapitalize="none"
                autoCompleteType="password"
                autoCorrect={false}
                secureTextEntry={true}
                key='password'
              />
              <EyeIcon
                style={globalStyles.textInputStyle.icon}
                fill={isValidPassword ? '#7A869A' : '#f00'}
              />
            </View>

            <View style={[globalStyles.textInputStyle.wrapper, password !== confirmPassword && globalStyles.textInputStyle.error]}>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={value => setConfirmPassword(value)}
                placeholder={strings.components.inputs.confirm_password}
                placeholderTextColor="#666"
                secureTextEntry={true}
                textContentType="password"
                key='confirmPassword'
              />
              <EyeIcon
                style={globalStyles.textInputStyle.icon}
                fill={password === confirmPassword ? '#7A869A' : '#f00'}
              />
            </View>
          </View>
        </View>

        <View style={tailwind('mt-5 mb-5')}>
          <Text style={tailwind('text-sm')}>{strings.screens.register_screen.security_subtitle}</Text>
        </View>

        <View style={tailwind('p-5')}>
          <CheckBox
            text="Accept terms, conditions and privacy policy"
            value={acceptPolicy}
            onChange={(value) => setAcceptPolicy(value)}
          ></CheckBox>
        </View>

        <View>
          <View style={[styles.containerCentered, isLoading ? styles.halfOpacity : {}]}>
            <View style={styles.buttonFooterWrapper}>
              <View style={globalStyles.buttonInputStyle.wrapper}>
                <TouchableOpacity
                  disabled={!isValidForm}
                  style={[globalStyles.buttonInputStyle.button, globalStyles.buttonInputStyle.block]}
                  onPress={() => handleOnPress()}
                >
                  <Text style={styles.buttonOnLabel}>{registerButtonClicked ? strings.components.buttons.creating_button : strings.components.buttons.create}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <TouchableWithoutFeedback
            style={tailwind('m-5')}
            onPress={() => props.navigation.replace('Login')}
          >
            <Text style={[globalStyles.text.link, globalStyles.text.center]}>Login in Internxt</Text>
          </TouchableWithoutFeedback>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  buttonFooterWrapper: {
    marginTop: normalize(20)
  },
  buttonOnLabel: {
    color: '#fff',
    fontFamily: 'NeueEinstellung-Medium',
    fontSize: normalize(15),
    textAlign: 'center'
  },
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    justifyContent: 'center'
  },
  containerCentered: {
    alignSelf: 'center',
    justifyContent: 'center',
    width: '100%'
  },
  containerHeader: {
    borderWidth: 0
  },
  halfOpacity: {
    opacity: 0.5
  },
  input: {
    color: '#000',
    flex: 1,
    fontFamily: 'NeueEinstellung-Regular',
    fontSize: normalize(15),
    letterSpacing: -0.2,
    paddingLeft: 20
  },
  showInputFieldsWrapper: {
    justifyContent: 'center'
  }
});

const mapStateToProps = (state: any) => {
  return { authenticationState: state.authenticationState };
};

export default connect(mapStateToProps)(Register)