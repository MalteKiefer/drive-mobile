import React from 'react';
import { Text, TouchableHighlight, View } from 'react-native';

import strings from '../../../../assets/lang/strings';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { driveActions } from '../../../store/slices/drive';
import { uiActions } from '../../../store/slices/ui';
import BottomModal from '../BottomModal';
import { tailwind, getColor } from '../../../helpers/designSystem';
import globalStyle from '../../../styles';
import AppText from '../../AppText';
import { SortDirection, SortType } from '../../../types/drive';

function SortModalItem(props: { direction: SortDirection; type: SortType; text: string; advice: string }) {
  const dispatch = useAppDispatch();
  const { sortType, sortDirection } = useAppSelector((state) => state.drive);
  const isSelected = sortType === props.type && sortDirection === props.direction;
  const onPress = () => {
    dispatch(driveActions.setSortType(props.type));
    dispatch(driveActions.setSortDirection(props.direction));
    dispatch(uiActions.setShowSortModal(false));
  };

  return (
    <TouchableHighlight underlayColor={getColor('neutral-30')} style={tailwind('rounded-lg')} onPress={onPress}>
      <View style={[tailwind('items-center flex-row rounded-lg px-4 py-2.5'), isSelected && tailwind('bg-blue-10')]}>
        <AppText
          style={[
            tailwind('text-lg text-neutral-500 mr-2'),
            globalStyle.fontWeight.semibold,
            isSelected && tailwind('text-blue-60'),
          ]}
        >
          {props.text}
        </AppText>
        <AppText
          style={[
            { textAlignVertical: 'center' },
            tailwind('text-neutral-500 opacity-50'),
            isSelected && tailwind('text-blue-60'),
          ]}
        >
          {props.advice}
        </AppText>
      </View>
    </TouchableHighlight>
  );
}

function SortModal(): JSX.Element {
  const dispatch = useAppDispatch();
  const { showSortModal } = useAppSelector((state) => state.ui);
  const onClosed = () => {
    dispatch(uiActions.setShowSortModal(false));
  };
  const header = (
    <View>
      <Text
        numberOfLines={1}
        ellipsizeMode="middle"
        style={[tailwind('text-base text-neutral-500'), globalStyle.fontWeight.medium]}
      >
        {strings.screens.drive.sortBy}
      </Text>
    </View>
  );

  return (
    <BottomModal isOpen={showSortModal} onClosed={onClosed} header={header} containerStyle={tailwind('pb-3 px-5')}>
      <SortModalItem
        direction={SortDirection.Asc}
        type={SortType.Name}
        text={strings.components.app_menu.filter.name}
        advice={strings.screens.drive.aToZ}
      />
      <SortModalItem
        direction={SortDirection.Desc}
        type={SortType.Name}
        text={strings.components.app_menu.filter.name}
        advice={strings.screens.drive.zToA}
      />
      <SortModalItem
        direction={SortDirection.Asc}
        type={SortType.Size}
        text={strings.components.app_menu.filter.size}
        advice={strings.screens.drive.ascending}
      />
      <SortModalItem
        direction={SortDirection.Desc}
        type={SortType.Size}
        text={strings.components.app_menu.filter.size}
        advice={strings.screens.drive.descending}
      />
      <SortModalItem
        direction={SortDirection.Asc}
        type={SortType.UpdatedAt}
        text={strings.components.app_menu.filter.date}
        advice={strings.screens.drive.newerFirst}
      />
      <SortModalItem
        direction={SortDirection.Desc}
        type={SortType.UpdatedAt}
        text={strings.components.app_menu.filter.date}
        advice={strings.screens.drive.olderFirst}
      />
    </BottomModal>
  );
}

export default SortModal;
