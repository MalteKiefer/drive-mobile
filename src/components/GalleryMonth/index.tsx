import React from 'react';
import { View, Text, TouchableWithoutFeedback, ImageBackground } from 'react-native';
import moment from 'moment';

import { LinearGradient } from 'expo-linear-gradient';
import { GalleryViewMode } from '../../types/photos';
import { photosActions } from '../../store/slices/photos';
import { useAppDispatch } from '../../store/hooks';
import { useTailwind } from 'tailwind-rn';
interface GalleryMonthProps {
  month: number;
  preview: string;
}

const GalleryMonth = ({ month, preview }: GalleryMonthProps): JSX.Element => {
  const tailwind = useTailwind();
  const dispatch = useAppDispatch();
  const monthName = moment.months(month - 1);
  const onMonthPressed = () => {
    dispatch(photosActions.setViewMode(GalleryViewMode.Days));
    // TODO: go to month gallery view
  };

  return (
    <TouchableWithoutFeedback onPress={onMonthPressed}>
      <View style={[tailwind('mb-5 w-full rounded-lg bg-neutral-30'), { aspectRatio: 2 / 1 }]}>
        <ImageBackground
          source={{ uri: preview }}
          resizeMode="cover"
          style={tailwind('w-full h-full')}
          imageStyle={tailwind('rounded-lg')}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0)', 'transparent']}
            style={tailwind('rounded-lg h-full w-full')}
          >
            <Text style={tailwind('p-5 text-white text-2xl font-semibold')}>{monthName}</Text>
          </LinearGradient>
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default GalleryMonth;
