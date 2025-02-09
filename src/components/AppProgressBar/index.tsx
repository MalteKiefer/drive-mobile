import React, { useEffect, useState } from 'react';
import { Animated, Easing, StyleProp, View, ViewStyle } from 'react-native';
import { useTailwind } from 'tailwind-rn';

interface AppProgressBarProps {
  currentValue: number;
  totalValue: number;
  style?: StyleProp<ViewStyle>;
  progressStyle?: StyleProp<ViewStyle>;
  animateWidth?: boolean;
}

export default function AppProgressBar(props: AppProgressBarProps): JSX.Element {
  const tailwind = useTailwind();
  const { totalValue, progressStyle } = props;
  const [width] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(width, {
      toValue: props.currentValue,
      duration: 100,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [props.currentValue]);

  return (
    <View style={[tailwind('rounded-2xl h-2 bg-neutral-30 overflow-hidden'), props.style]}>
      <Animated.View
        style={[
          tailwind('bg-blue-60 h-full'),
          progressStyle,
          {
            width: props.animateWidth
              ? width.interpolate({
                  inputRange: [0, props.totalValue || 1],
                  outputRange: ['0%', '100%'],
                })
              : (props.currentValue / totalValue) * 100 + '%',
          },
        ]}
      />
    </View>
  );
}
