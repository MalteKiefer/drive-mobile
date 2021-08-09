import React from 'react'
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ProgressBarProps {
  usedValue: number
  totalValue: number
  styleProgress: any
}

export default function ProgressBar(props: ProgressBarProps): JSX.Element {
  const { totalValue, styleProgress } = props;
  let usedValue = props.usedValue;

  if (usedValue > totalValue) { usedValue = totalValue; }

  const usedValueStyle = {
    size: {
      width: (usedValue * 100 / totalValue) + '%'
    }
  };

  return <View style={styles.container}>
    <LinearGradient
      colors={['#0443E7', '#0443E7']}
      start={[0.5, 0]}
      style={[
        styles.inner,
        usedValueStyle.size,
        styleProgress
      ]}
    />
  </View>

}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#D0E2FF',
    borderRadius: 3,
    height: 7,
    position: 'relative'
  },
  inner: {
    borderRadius: 3,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    height: 10,
    left: 0,
    position: 'absolute',
    top: 0
  }
});
