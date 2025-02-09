import React, { useEffect } from 'react';
import { View, TouchableOpacity, TouchableHighlight, Animated, Easing } from 'react-native';

import { FolderIcon, getFileTypeIcon } from '../../helpers';
import globalStyle from '../../styles/global';
import { useAppSelector } from '../../store/hooks';
import { ArrowCircleUp, DotsThree } from 'phosphor-react-native';
import { items } from '@internxt/lib';
import AppText from '../AppText';

import { DriveItemProps } from '../../types/drive';
import useDriveItem from '../../hooks/useDriveItem';
import { useTailwind } from 'tailwind-rn';
import useGetColor from '../../hooks/useColor';

function DriveItemGrid(props: DriveItemProps): JSX.Element {
  const tailwind = useTailwind();
  const getColor = useGetColor();
  const { selectedItems } = useAppSelector((state) => state.drive);
  const isSelectionMode = selectedItems.length > 0;
  const spinValue = new Animated.Value(1);
  const IconFile = getFileTypeIcon(props.data.type || '');
  const iconSize = 64;
  const { isFolder, isUploading, isDownloading, onItemPressed, onItemLongPressed, onActionsButtonPressed } =
    useDriveItem(props);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 0,
        duration: 800,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  return (
    <TouchableHighlight
      disabled={isUploading || isDownloading}
      underlayColor={getColor('text-neutral-20')}
      onLongPress={onItemLongPressed}
      onPress={onItemPressed}
      style={{ flex: 1 / 3 }}
    >
      <View style={tailwind('py-3.5')}>
        <View style={[tailwind('flex-grow overflow-hidden'), tailwind('flex-col items-center justify-center')]}>
          {/* Icon */}
          <View style={tailwind('w-full mb-1 items-center justify-center')}>
            {isFolder ? (
              <FolderIcon width={iconSize} height={iconSize} style={isUploading && tailwind('opacity-40')} />
            ) : (
              <IconFile width={iconSize} height={iconSize} />
            )}

            {isUploading && (
              <View style={tailwind('absolute top-0 bottom-0 w-full flex-row items-center justify-center')}>
                <View style={tailwind('rounded px-1 py-0.5 bg-blue-60 flex-row')}>
                  <ArrowCircleUp weight="fill" color={getColor('text-white')} size={16} />
                  <AppText style={tailwind('ml-1.5 text-xs text-white')}>
                    {((props.progress || 0) * 100).toFixed(0) + '%'}
                  </AppText>
                </View>
              </View>
            )}
          </View>

          <View style={[tailwind('flex items-start justify-center items-center')]}>
            <AppText
              style={[
                tailwind('text-base text-neutral-500 text-center px-5'),
                isUploading && tailwind('opacity-40'),
                globalStyle.fontWeight.medium,
              ]}
              numberOfLines={2}
              ellipsizeMode={'middle'}
            >
              {items.getItemDisplayName(props.data)}
            </AppText>
          </View>
        </View>

        <TouchableOpacity
          disabled={isUploading || isDownloading}
          style={isSelectionMode && tailwind('hidden')}
          onPress={onActionsButtonPressed}
          onLongPress={onActionsButtonPressed}
        >
          <View style={[isUploading && tailwind('opacity-40'), tailwind('px-5 h-6 items-center justify-center')]}>
            <DotsThree weight="bold" size={22} color={getColor('text-neutral-60')} />
          </View>
        </TouchableOpacity>
      </View>
    </TouchableHighlight>
  );
}

export default DriveItemGrid;
