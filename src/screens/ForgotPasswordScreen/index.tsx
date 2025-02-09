import { View, Text, StyleSheet, Alert, TouchableHighlight, TouchableWithoutFeedback } from 'react-native';
import React, { useEffect, useState } from 'react';

import { normalize } from '../../helpers';
import strings from '../../../assets/lang/strings';
import InternxtLogo from '../../../assets/logo.svg';
import validationService from '../../services/ValidationService';
import authService from '../../services/AuthService';
import AppScreen from '../../components/AppScreen';
import { RootStackScreenProps } from '../../types/navigation';
import { useTailwind } from 'tailwind-rn';
import AppText from '../../components/AppText';
import AppButton from '../../components/AppButton';
import AppTextInput from '../../components/AppTextInput';

function ForgotPasswordScreen({ navigation }: RootStackScreenProps<'ForgotPassword'>): JSX.Element {
  const tailwind = useTailwind();
  const [currentContainer, setCurrentCointainer] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setIsEmail] = useState('');
  const isValidEmailField = validationService.validateEmail(email);

  useEffect(() => {
    // do something after isLoading has updated
    if (isLoading === true) {
      if (!isValidEmailField) {
        setIsLoading(false);
        return Alert.alert('Warning', 'Enter a valid e-mail address');
      }
    }
  }, [isLoading]);

  const onDeleteAccountButtonPressed = () => {
    if (!isLoading) {
      setIsLoading(true);
      authService
        .reset(email)
        .then(() => {
          setIsLoading(false);
          setCurrentCointainer(2);
        })
        .catch(() => {
          setIsLoading(false);
          return Alert.alert('Error', 'Connection to server failed');
        });
    }
  };

  if (currentContainer === 1) {
    return (
      <AppScreen safeAreaTop style={tailwind('p-5 h-full justify-center')}>
        <View style={tailwind('p-6 py-0 bg-white')}>
          <View style={isLoading ? tailwind('opacity-50') : tailwind('opacity-100')}>
            <View>
              <View style={tailwind('items-center')}>
                <InternxtLogo />
                <Text style={tailwind('text-base text-sm mt-3 text-gray-60')}>{strings.generic.security}</Text>
              </View>
              <Text style={tailwind('text-sm text-center py-5')}>
                {strings.screens.forgot_password.subtitle_1}

                <Text style={tailwind('font-bold')}>{strings.screens.forgot_password.bold}</Text>

                {strings.screens.forgot_password.subtitle_2}
              </Text>

              <AppTextInput
                value={email}
                onChangeText={(value) => setIsEmail(value)}
                placeholder={strings.inputs.email}
                maxLength={64}
                keyboardType="email-address"
                textContentType="emailAddress"
              />

              <AppButton
                type="delete"
                style={tailwind('mt-3')}
                onPress={onDeleteAccountButtonPressed}
                title={strings.buttons.deleteAccount}
                disabled={!isValidEmailField}
              />
              <View style={tailwind('py-5')}>
                <TouchableWithoutFeedback style={tailwind('m-5')} onPress={() => navigation.navigate('SignIn')}>
                  <AppText style={tailwind('text-sm text-primary text-center')}>
                    {strings.screens.SignInScreen.back}
                  </AppText>
                </TouchableWithoutFeedback>
              </View>
            </View>
          </View>
        </View>
      </AppScreen>
    );
  }

  if (currentContainer === 2) {
    return (
      <AppScreen safeAreaTop style={tailwind('p-5 h-full justify-center')}>
        <View style={tailwind('py-0 bg-white')}>
          <View style={[tailwind(''), isLoading ? tailwind('opacity-50') : {}]}>
            <View>
              <View style={tailwind('items-center pb-10')}>
                <InternxtLogo />
                <AppText style={tailwind('text-sm mt-3 text-gray-60')}>{strings.generic.security}</AppText>
              </View>
              <AppText style={tailwind('text-sm text-center')}>
                {strings.screens.deactivation_screen.subtitle_1} {strings.screens.deactivation_screen.subtitle_2}
              </AppText>

              <View style={styles.buttonWrapper}>
                <TouchableHighlight
                  style={[styles.button, styles.buttonOn]}
                  underlayColor="#00aaff"
                  onPress={onDeleteAccountButtonPressed}
                >
                  <Text style={styles.buttonOnLabel}>{strings.buttons.deactivation}</Text>
                </TouchableHighlight>
              </View>

              <View style={tailwind('py-5')}>
                <TouchableWithoutFeedback style={tailwind('m-5')} onPress={() => navigation.replace('SignIn')}>
                  <Text style={[]}> {strings.screens.SignInScreen.back}</Text>
                </TouchableWithoutFeedback>
              </View>
            </View>
          </View>
        </View>
      </AppScreen>
    );
  }
  return <></>;
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 10,
    height: normalize(55),
    justifyContent: 'center',
    marginTop: normalize(10),
    width: '45%',
  },
  buttonOn: {
    backgroundColor: '#4585f5',
    flex: 1,
  },
  buttonOnLabel: {
    color: '#fff',
    fontFamily: 'NeueEinstellung-Medium',
    fontSize: normalize(15),
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  buttonWrapper: {
    flexDirection: 'row',
    marginTop: normalize(15),
  },
});

export default ForgotPasswordScreen;
