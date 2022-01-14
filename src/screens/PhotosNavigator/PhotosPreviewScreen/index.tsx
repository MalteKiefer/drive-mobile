import React, { useEffect, useState } from 'react';
import RNFS from 'react-native-fs';
import { View, Text, Image, SafeAreaView, TouchableOpacity } from 'react-native';
import { TapGestureHandler } from 'react-native-gesture-handler';
import tailwind, { getColor } from 'tailwind-rn';
import * as Unicons from '@iconscout/react-native-unicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NavigationStackProp } from 'react-navigation-stack';
import { Photo } from '@internxt/sdk/dist/photos';

import PhotosPreviewOptionsModal from '../../../components/modals/PhotosPreviewOptionsModal';
import DeletePhotosModal from '../../../components/modals/DeletePhotosModal';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { layoutActions } from '../../../store/slices/layout';
import strings from '../../../../assets/lang/strings';
import SharePhotoModal from '../../../components/modals/SharePhotoModal';
import { getDocumentsDir } from '../../../lib/fs';
import PhotosPreviewInfoModal from '../../../components/modals/PhotosPreviewInfoModal';
import { photosThunks } from '../../../store/slices/photos';
import imageService from '../../../services/image';
import LoadingSpinner from '../../../components/LoadingSpinner';

interface PreviewProps {
  route: {
    params: {
      data: Photo;
      preview: string;
    };
  };
}

function PhotosPreviewScreen(props: PreviewProps): JSX.Element {
  const photo = props.route.params.data;
  const photoPath = getDocumentsDir() + '/' + photo.fileId;

  const dispatch = useAppDispatch();
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [uri, setUri] = useState(imageService.BASE64_PREFIX + props.route.params.preview);
  const [isFullSizeLoaded, setIsFullSizeLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const { isDeletePhotosModalOpen, isSharePhotoModalOpen, isPhotosPreviewInfoModalOpen } = useAppSelector(
    (state) => state.layout,
  );
  const navigation = useNavigation<NavigationStackProp>();
  const onBackButtonPressed = () => navigation.goBack();
  const onShareButtonPressed = () => dispatch(layoutActions.setIsSharePhotoModalOpen(true));
  const onDownloadButtonPressed = () => {
    console.log('onDownloadButtonPressed!');
  };
  const onMoveToTrashButtonPressed = () => {
    dispatch(layoutActions.setIsDeletePhotosModalOpen(true));
  };
  const onPhotoMovedToTrash = () => {
    navigation.goBack();
  };
  const onSharePhotoModalClosed = () => dispatch(layoutActions.setIsSharePhotoModalOpen(false));
  const onPhotosPreviewOptionsModalClosed = () => {
    setIsOptionsModalOpen(false);
  };
  const onPhotosPreviewInfoModalClosed = () => {
    dispatch(layoutActions.setIsPhotosPreviewInfoModalOpen(false));
    setIsOptionsModalOpen(true);
  };
  const isPhotoAlreadyDownloaded = () => RNFS.exists(photoPath);
  const loadImage = () => {
    dispatch(
      photosThunks.downloadPhotoThunk({
        fileId: props.route.params.data.fileId,
        options: {
          toPath: photoPath,
          downloadProgressCallback: (progress) => {
            setProgress(progress);
          },
          decryptionProgressCallback: (progress) => {
            // TODO
          },
        },
      }),
    )
      .unwrap()
      .then((fileUri: string) => {
        setUri(imageService.BASE64_PREFIX + fileUri);
        setIsFullSizeLoaded(true);
      })
      .catch(() => undefined);
  };

  useEffect(() => {
    isPhotoAlreadyDownloaded().then((isDownloaded) => {
      if (isDownloaded) {
        setUri(photoPath);
        setIsFullSizeLoaded(true);
      } else {
        loadImage();
      }
    });
  }, []);

  return (
    <>
      {/* MODALS */}
      <PhotosPreviewOptionsModal
        isOpen={isOptionsModalOpen}
        onClosed={onPhotosPreviewOptionsModalClosed}
        data={props.route.params.data}
      />
      <PhotosPreviewInfoModal
        isOpen={isPhotosPreviewInfoModalOpen}
        onClosed={onPhotosPreviewInfoModalClosed}
        data={props.route.params.data}
      />
      <DeletePhotosModal
        isOpen={isDeletePhotosModalOpen}
        onClosed={() => dispatch(layoutActions.setIsDeletePhotosModalOpen(false))}
        onPhotosDeleted={onPhotoMovedToTrash}
        data={[props.route.params.data]}
      />
      <SharePhotoModal
        isOpen={isSharePhotoModalOpen}
        data={props.route.params.data}
        onClosed={onSharePhotoModalClosed}
      />
      <View style={tailwind('h-full')}>
        {/* PHOTO */}
        <TapGestureHandler numberOfTaps={1} enabled={true}>
          <Image resizeMode={'contain'} style={tailwind('bg-black w-full h-full absolute')} source={{ uri }} />
        </TapGestureHandler>

        {/* LOADING */}
        {!isFullSizeLoaded && (
          <View style={tailwind('absolute top-0 bottom-0 right-0 left-0 items-center justify-center')}>
            <LoadingSpinner size={32} color={getColor('white')} />
            <Text style={tailwind('text-white')}>{(progress * 100).toFixed(0) + '%'}</Text>
          </View>
        )}

        <SafeAreaView style={tailwind('flex-col justify-between h-full')}>
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.24)', 'transparent']}
            style={tailwind('absolute w-full')}
          >
            <View style={tailwind('flex-row justify-between p-5')}>
              {/* BACK BUTTON */}
              <TouchableOpacity style={tailwind('z-10')} onPress={onBackButtonPressed}>
                <Unicons.UilAngleLeft color={getColor('white')} size={32} />
              </TouchableOpacity>

              {/* OPTIONS BUTTON */}
              <TouchableOpacity style={tailwind('z-10')} onPress={() => setIsOptionsModalOpen(true)}>
                <Unicons.UilEllipsisH color={getColor('white')} size={32} />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.24)', 'rgba(0,0,0,0.6)']}
            style={tailwind('flex-row justify-around p-3 absolute bottom-0 w-full')}
          >
            <TouchableOpacity style={tailwind('items-center')} onPress={onShareButtonPressed}>
              <Unicons.UilLink color="white" size={26} />
              <Text style={tailwind('text-white text-xs')}>{strings.components.buttons.shareWithLink}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={!isFullSizeLoaded}
              style={tailwind('items-center')}
              onPress={onDownloadButtonPressed}
            >
              <Unicons.UilImport color="white" size={26} />
              <Text style={tailwind('text-white text-xs')}>{strings.components.buttons.download}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tailwind('items-center')} onPress={onMoveToTrashButtonPressed}>
              <Unicons.UilTrash color="white" size={26} />
              <Text style={tailwind('text-white text-xs')}>{strings.components.buttons.moveToThrash}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </SafeAreaView>
      </View>
    </>
  );
}

export default PhotosPreviewScreen;
