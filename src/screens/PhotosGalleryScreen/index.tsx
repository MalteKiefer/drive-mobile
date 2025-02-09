import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, BackHandler } from 'react-native';
import Portal from '@burstware/react-native-portal';

import globalStyle from '../../styles/global';
import ScreenTitle from '../../components/AppScreenTitle';
import strings from '../../../assets/lang/strings';
import galleryViews from '../../components/gallery-views';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { photosActions, photosSelectors, photosThunks } from '../../store/slices/photos';
import DeletePhotosModal from '../../components/modals/DeletePhotosModal';
import PhotosSyncStatusWidget from '../../components/PhotosSyncStatusWidget';
import AppScreen from '../../components/AppScreen';
import { Trash } from 'phosphor-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTailwind } from 'tailwind-rn';
import useGetColor from '../../hooks/useColor';

function PhotosGalleryScreen(): JSX.Element {
  const tailwind = useTailwind();
  const getColor = useGetColor();
  const dispatch = useAppDispatch();
  const safeAreaInsets = useSafeAreaInsets();
  const isLoading = true;
  const [currentPage, setCurrentPage] = useState(1);
  const { isSelectionModeActivated, viewMode } = useAppSelector((state) => state.photos);
  const hasPhotos = useAppSelector(photosSelectors.hasPhotos);
  const hasPhotosSelected = useAppSelector(photosSelectors.hasPhotosSelected);
  const hasMorePhotos = useAppSelector(photosSelectors.hasMorePhotos);

  const { selection } = useAppSelector((state) => state.photos);
  const [loading, setLoading] = useState(false);
  const [isDeletePhotosModalOpen, setIsDeletePhotosModalOpen] = useState(false);
  const onDeletePhotosModalClosed = () => {
    setIsDeletePhotosModalOpen(false);
    dispatch(photosActions.setIsSelectionModeActivated(false));
  };
  const onSelectButtonPressed = () => {
    dispatch(photosActions.setIsSelectionModeActivated(true));
  };
  const onCancelSelectButtonPressed = () => {
    dispatch(photosActions.setIsSelectionModeActivated(false));
    dispatch(photosActions.deselectAll());
  };
  /* const onSelectAllButtonPressed = () => {
    dispatch(photosThunks.selectAllThunk());
  };
  const onShareSelectionButtonPressed = () => {
    dispatch(uiActions.setIsSharePhotoModalOpen(true));
  };
  const onDownloadSelectionButtonPressed = () => undefined; */
  const onDeleteSelectionButtonPressed = async () => {
    //await dispatch(photosThunks.deletePhotosThunk({ photos: selection }));
    setIsDeletePhotosModalOpen(true);
  };
  const onBackButtonPressed = () => {
    onCancelSelectButtonPressed();

    return false;
  };
  const GalleryView = useMemo(() => galleryViews[viewMode], []);
  /*const groupByMenu = (function () {
    const groupByItems = Object.entries(GalleryViewMode).map(([, value]) => {
      const isActive = value === viewMode;

      return (
        <TouchableWithoutFeedback key={value} onPress={() => dispatch(photosActions.setViewMode(value))}>
          <View style={[tailwind('flex-1 rounded-2xl'), isActive && tailwind('bg-neutral-70')]}>
            <Text style={[tailwind('text-neutral-500 text-center text-base'), isActive && tailwind('text-white')]}>
              {strings.screens.gallery.groupBy[value]}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      );
    });

    return (
      <View style={tailwind('absolute bottom-3 px-5 w-full')}>
        <View style={tailwind('px-1 py-1 flex-row bg-neutral-20 rounded-2xl')}>{groupByItems}</View>
      </View>
    );
  })();*/

  useEffect(() => {
    dispatch(photosThunks.startUsingPhotosThunk())
      .unwrap()
      .then(() => {
        dispatch(photosThunks.loadPhotosThunk({ page: currentPage }));
      });

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackButtonPressed);

    return () => {
      dispatch(photosActions.resetPhotos());
      backHandler.remove();
    };
  }, []);

  async function loadNextPage() {
    if (!loading && hasMorePhotos) {
      setLoading(true);
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);

      dispatch(photosThunks.loadPhotosThunk({ page: nextPage })).unwrap();

      setLoading(false);
    }
  }

  return (
    <>
      {/*   <SharePhotoModal
        isOpen={isSharePhotoModalOpen}
        data={selectedPhotos[0]}
        preview={hasNoPhotosSelected ? '' : getPhotoPreview(selectedPhotos[0])}
        onClosed={onSharePhotoModalClosed}
      /> */}
      <DeletePhotosModal isOpen={isDeletePhotosModalOpen} data={selection} onClosed={onDeletePhotosModalClosed} />

      <AppScreen safeAreaTop style={tailwind('mb-14')}>
        {/* GALLERY TOP BAR */}
        <View style={tailwind('pt-1.5 pb-2')}>
          {isSelectionModeActivated ? (
            <View style={tailwind('h-10 flex-row justify-between items-center')}>
              <View style={tailwind('flex-row items-center justify-between')}>
                <Text style={tailwind('pl-5')}>{strings.formatString(strings.screens.gallery.nPhotosSelected, 0)}</Text>
              </View>

              <View style={tailwind('flex-row pr-5')}>
                {/*<View style={tailwind('flex-row items-center justify-between')}>
                    <TouchableOpacity
                      style={tailwind('bg-blue-10 px-3.5 py-1 rounded-3xl mr-2')}
                      onPress={onSelectAllButtonPressed}
                    >
                      <Text style={[tailwind('text-blue-60'), globalStyle.fontWeight.medium]}>
                        {strings.buttons.selectAll}
                      </Text>
                    </TouchableOpacity>
            </View>*/}
                <View style={tailwind('flex-row items-center justify-between')}>
                  <TouchableOpacity
                    style={tailwind('bg-blue-10 px-3.5 py-1 rounded-3xl')}
                    onPress={onCancelSelectButtonPressed}
                  >
                    <Text style={[tailwind('text-blue-60'), globalStyle.fontWeight.medium]}>
                      {strings.buttons.cancel}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={tailwind('h-10 flex-row justify-between')}>
              <ScreenTitle
                text={strings.screens.gallery.title}
                showBackButton={false}
                containerStyle={tailwind('py-0')}
              />

              {hasPhotos && (
                <View style={tailwind('flex-row items-center justify-between pr-5')}>
                  <TouchableOpacity
                    style={tailwind('bg-blue-10 px-3.5 py-1 rounded-3xl')}
                    onPress={onSelectButtonPressed}
                    disabled={!hasPhotos}
                  >
                    <Text style={[tailwind('text-blue-60'), globalStyle.fontWeight.medium]}>
                      {strings.buttons.select}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <PhotosSyncStatusWidget />
        </View>

        {/* GALLERY VIEW */}
        {hasPhotos ? (
          <GalleryView onLoadNextPage={loadNextPage} />
        ) : (
          <View style={tailwind('flex-1 items-center justify-center')}>
            <Text style={tailwind('text-lg text-neutral-60')}>
              {isLoading ? strings.screens.gallery.loading : strings.screens.gallery.empty}
            </Text>
          </View>
        )}

        {/*  VIEW MODE MENU */}
        {/* groupByMenu */}

        {/* SELECTION MODE ACTIONS */}
        {isSelectionModeActivated && (
          <Portal>
            <View
              style={[
                tailwind('flex-row w-full absolute bottom-0 bg-white px-4 py-2'),
                { marginBottom: safeAreaInsets.bottom },
              ]}
            >
              {/*<TouchableWithoutFeedback
                onPress={onShareSelectionButtonPressed}
                disabled={hasNoPhotosSelected || hasManyPhotosSelected}
              >
                <View style={tailwind('items-center flex-1')}>
                  <Unicons.UilLink
                    color={hasNoPhotosSelected || hasManyPhotosSelected ? getColor('text-neutral-60') : getColor('text-blue-60')}
                    size={24}
                  />
                  <Text
                    numberOfLines={1}
                    style={[
                      hasNoPhotosSelected || hasManyPhotosSelected
                        ? tailwind('text-neutral-60')
                        : tailwind('text-blue-60'),
                      tailwind('text-xs'),
                    ]}
                  >
                    {strings.buttons.share}
                  </Text>
                </View>
                  </TouchableWithoutFeedback>*/}
              {/*<TouchableWithoutFeedback
                style={tailwind('flex-1')}
                onPress={onDownloadSelectionButtonPressed}
                disabled={hasNoPhotosSelected}
              >
                <View style={tailwind('items-center flex-1')}>
                  <Unicons.UilDownloadAlt
                    color={hasNoPhotosSelected ? getColor('text-neutral-60') : getColor('text-blue-60')}
                    size={24}
                  />
                  <Text
                    numberOfLines={1}
                    style={[
                      hasNoPhotosSelected ? tailwind('text-neutral-60') : tailwind('text-blue-60'),
                      tailwind('text-xs'),
                    ]}
                  >
                    {strings.buttons.download}
                  </Text>
                </View>
                  </TouchableWithoutFeedback>*/}
              <TouchableWithoutFeedback
                style={tailwind('flex-1')}
                onPress={onDeleteSelectionButtonPressed}
                disabled={!hasPhotosSelected}
              >
                <View style={tailwind('items-center flex-1')}>
                  <Trash color={!hasPhotosSelected ? getColor('text-neutral-60') : getColor('text-red-60')} size={24} />
                  <Text
                    numberOfLines={1}
                    style={[
                      !hasPhotosSelected ? tailwind('text-neutral-60') : tailwind('text-red-60'),
                      tailwind('text-xs'),
                    ]}
                  >
                    {strings.buttons.moveToThrash}
                  </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </Portal>
        )}
      </AppScreen>
    </>
  );
}

export default PhotosGalleryScreen;
