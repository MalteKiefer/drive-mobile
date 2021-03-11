import React, { useEffect, useState } from 'react';
import { Alert, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { BackButton } from '../../components/BackButton';
import { widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { PhotosState } from '../../redux/reducers/photos.reducer';
import { Dispatch } from 'redux';
import { LayoutState } from '../../redux/reducers/layout.reducer';
import SelectivePhoto from './SelectivePhoto';
import { IPreview } from '../../components/PhotoList';
import { AuthenticationState } from '../../redux/reducers/authentication.reducer';
import { getHeaders } from '../../helpers/headers';
import { getPreviews } from '../Photos/init';
import ImageViewerModal from '../../modals/ImageViewerModal';
import { IImageInfo } from 'react-native-image-zoom-viewer/built/image-viewer.type';
import Loading from '../../components/Loading';

interface CreateAlbumProps {
  navigation: any
  photosState: PhotosState
  dispatch: Dispatch,
  layoutState: LayoutState
  authenticationState: AuthenticationState
}

export interface IAlbum {
  title: string
  createdAt?: string
  updatedAt?: string
  id?: number
  name?: string
  photos: IAlbumPhoto[]
  userId?: string
}

export interface IAlbumPhoto {
  bucketId: string
  fileId: string
  id: number
  userId: number
  createdAt: string
  updatedAt: string
  name: string
  hash: string
  size: number
  type: string
  photosalbums: any
  localUri?: string
}

function CreateAlbum(props: CreateAlbumProps): JSX.Element {
  const [photos, setPhotos] = useState<IPreview[]>([])
  const [albumTitle, setAlbumTitle] = useState('')
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<IImageInfo[]>([])

  useEffect(() => {
    getPreviews().then(res => setPhotos(res)).finally(() => setIsLoading(false))
  }, [])

  const uploadAlbum = async (): Promise<void> => {
    const xToken = props.authenticationState.token
    const mnemonic = props.authenticationState.user.mnemonic
    const headers = await getHeaders(xToken, mnemonic)
    const body = { name: albumTitle, photos: selectedPhotos }

    return fetch(`${process.env.REACT_NATIVE_API_URL}/api/photos/album`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    }).then(res => {
      return res.json()
    })
  }

  const handleSelection = (selectedPhotoId: number) => {
    const currentSelectedPhotos = selectedPhotos
    const isAlreadySelected = currentSelectedPhotos.find(photoId => photoId === selectedPhotoId)

    if (isAlreadySelected) {
      const newSelectedPhotos = currentSelectedPhotos.filter(photoId => photoId === selectedPhotoId ? null : photoId)

      setSelectedPhotos(newSelectedPhotos)

    } else {
      currentSelectedPhotos.push(selectedPhotoId)
      setSelectedPhotos(currentSelectedPhotos)
    }
  }

  const handlePress = () => {
    // reset all selected photos
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleLongPress = (photo: IImageInfo) => {
    const selectedPhoto = [photo]

    setSelectedPhoto(selectedPhoto)
    setIsOpen(true)
  }

  const renderItem = (item: IPreview, index: number) => (<SelectivePhoto photo={item} handleSelection={handleSelection} handleLongPress={handleLongPress} key={index} />)

  return (
    <SafeAreaView style={styles.mainContainer}>
      <ImageViewerModal isOpen={isOpen} photos={selectedPhoto} handleClose={handleClose} />
      <View style={styles.albumHeader}>
        <BackButton navigation={props.navigation} ></BackButton>

        <TextInput
          style={styles.input}
          placeholder='Name your memories'
          onChangeText={value => setAlbumTitle(value)}
          value={albumTitle}
          autoCapitalize='none'
        />

        <TouchableOpacity style={!isCreatingAlbum ? styles.nextBtn : [styles.nextBtn, styles.disabled]}
          disabled={isCreatingAlbum}
          onPress={() => {
            if (albumTitle) {
              if (albumTitle.length > 30) {
                Alert.alert('Maximum album length name is 30 characters')
              } else {
                if (selectedPhotos.length > 0) {
                  setIsCreatingAlbum(true)
                  uploadAlbum().finally(() => setIsCreatingAlbum(false))
                  handlePress()
                } else {
                  Alert.alert('You need to select at least one photo')
                }
              }
            } else {
              Alert.alert('Album name is required')
            }
          }}
        >
          <Text style={styles.nextText}>Done</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>
        Select photos to create album
      </Text>

      {
        !isLoading ?
          !isCreatingAlbum ?
            <FlatList
              data={photos}
              renderItem={({ item, index }) => renderItem(item, index)}
              numColumns={4}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.flatList}
            />
            :
            <Loading message={'Creating album...'} />
          :
          <Loading message={'Loading uploaded photos...'} />
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  albumHeader: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15
  },
  disabled: {
    backgroundColor: '#73bbff'
  },
  flatList: {
    paddingHorizontal: wp('1')
  },
  input: {
    color: '#000000',
    fontFamily: 'Averta-Semibold',
    fontSize: 17,
    textAlign: 'center',
    width: 200
  },
  mainContainer: {
    alignContent: 'center',
    backgroundColor: '#fff',
    flex: 1
  },
  nextBtn: {
    backgroundColor: '#0084ff',
    borderRadius: 23.8,
    paddingHorizontal: 18,
    paddingVertical: 6
  },
  nextText: {
    color: 'white',
    fontFamily: 'Averta-Semibold',
    fontSize: 16
  },
  title: {
    color: 'black',
    fontFamily: 'Averta-Bold',
    fontSize: 18,
    marginLeft: 16,
    marginVertical: 16
  }
});

const mapStateToProps = (state: any) => {
  return { ...state };
};

export default connect(mapStateToProps)(CreateAlbum);