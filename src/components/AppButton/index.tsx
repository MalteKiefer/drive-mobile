import React from 'react';
import { StyleProp, TouchableHighlight, View, ViewStyle } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import useGetColor from '../../hooks/useColor';
import AppText from '../AppText';
import LoadingSpinner from '../LoadingSpinner';

interface AppButtonProps {
  testID?: string;
  title: string | JSX.Element;
  type: 'accept' | 'accept-2' | 'cancel' | 'cancel-2' | 'delete';
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

const AppButton = (props: AppButtonProps): JSX.Element => {
  const tailwind = useTailwind();
  const getColor = useGetColor();
  const isTitleString = typeof props.title === 'string';
  const typeBgStyle = {
    accept: props.disabled
      ? props.loading
        ? tailwind('bg-primary-dark')
        : tailwind('bg-gray-40')
      : tailwind('bg-blue-60'),
    'accept-2': props.disabled ? tailwind('bg-gray-40') : tailwind('bg-primary/10'),
    cancel: tailwind('bg-gray-5'),
    'cancel-2': tailwind('bg-blue-10'),
    delete: props.disabled ? tailwind('bg-gray-40') : tailwind('bg-red-'),
  }[props.type];
  const typeTextStyle = {
    accept: tailwind('text-white'),
    'accept-2': props.disabled ? tailwind('text-white') : tailwind('text-primary'),
    cancel: props.disabled ? tailwind('text-gray-40') : tailwind('text-gray-80'),
    'cancel-2': tailwind('text-blue-60'),
    delete: tailwind('text-white'),
  }[props.type];
  const typeUnderlayColor = {
    accept: getColor('text-blue-70'),
    'accept-2': getColor('text-primary/20'),
    cancel: getColor('text-neutral-30'),
    'cancel-2': getColor('text-neutral-30'),
    delete: getColor('text-red-dark'),
  }[props.type];

  const renderContent = () => {
    const title = isTitleString ? (
      <AppText medium numberOfLines={1} style={[tailwind('text-lg'), typeTextStyle]}>
        {props.title}
      </AppText>
    ) : (
      props.title
    );

    return (
      <View style={tailwind('flex-row')}>
        {title}
        {props.loading && (
          <View style={tailwind('ml-2 items-center justify-center')}>
            <LoadingSpinner color={getColor('text-white')} size={16} />
          </View>
        )}
      </View>
    );
  };

  return (
    <TouchableHighlight
      testID={props.testID}
      underlayColor={typeUnderlayColor}
      style={[tailwind('rounded-lg px-4 py-3 items-center justify-center'), typeBgStyle, props.style]}
      onPress={props.onPress}
      disabled={!!props.disabled || !!props.loading}
    >
      {renderContent()}
    </TouchableHighlight>
  );
};

export default AppButton;
