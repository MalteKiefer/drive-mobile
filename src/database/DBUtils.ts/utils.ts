import { getRepository } from 'typeorm/browser';
import { Photos } from '../../database/models/photos';
import { Previews } from '../../database/models/previews';
import { deviceStorage } from '../../helpers';
import { PhotoActions } from '../../redux/actions';
import { Albums } from '../models/albums';
import { PhotoAlbums } from '../models/photoAlbums';

export interface Repositories {
  photos: Photos[];
  previews: Previews[];
  albums: Albums[];
  albumsWithPreviews: PhotoAlbums[];
}

export async function getUserId() {
  const xUser = await deviceStorage.getItem('xUser');
  const xUserJson = JSON.parse(xUser || '{}');
  const user = xUserJson.userId;

  return user;
}

export async function getRepositories(): Promise<Repositories> {
  const userId = await getUserId()

  const photosRepository = getRepository(Photos);

  const photos = await photosRepository.find({
    where: { userId: userId }
  })

  const previewsRepository = getRepository(Previews);
  const previews = await previewsRepository.find({
    where: { userId: userId }
  })

  const albumsRepository = getRepository(Albums);
  const albums = await albumsRepository.find(({
    where: { userId: userId }
  }))

  const photoAlbumsRepository = getRepository(PhotoAlbums);
  const albumsWithPreviews = []

  albums.map(async (res) => {
    const photoAlbums = await photoAlbumsRepository.find(({
      where: { albumId: res.id }
    }))

    albumsWithPreviews.push(photoAlbums)

  })

  return { photos, previews, albums, albumsWithPreviews }
}

export async function savePhotosAndPreviews(photo: any, path: string, dispatch: any) {
  dispatch(PhotoActions.viewDB())

  const userId = await getUserId()

  const photosRepository = getRepository(Photos);

  await photosRepository.find({
    where: { userId: userId }
  })

  const newPhoto = new Photos()

  newPhoto.photoId = photo.id
  newPhoto.fileId = photo.fileId
  newPhoto.hash = photo.hash
  newPhoto.name = photo.name
  newPhoto.type = photo.type
  newPhoto.userId = userId

  const existsPhotoFileId = await photosRepository.findOne({
    where: {
      fileId: photo.fileId
    }
  })

  if (existsPhotoFileId === undefined) {
    await photosRepository.save(newPhoto);
  }

  await photosRepository.find({
    where: { userId: userId }
  });

  const previewsRepository = getRepository(Previews);

  await previewsRepository.find({
    where: {
      userId: userId
    }
  })

  const newPreview = new Previews();

  newPreview.fileId = photo.preview.fileId;
  newPreview.hash = photo.hash;
  newPreview.name = photo.preview.name;
  newPreview.type = photo.preview.type;
  newPreview.photoId = photo.preview.photoId;
  newPreview.localUri = path;
  newPreview.userId = userId
  newPreview.isLocal = false,
  newPreview.isUploaded = true

  const existsfileId = await previewsRepository.findOne({
    where: {
      fileId: photo.preview.fileId
    }
  })

  if (existsfileId === undefined) {
    await previewsRepository.save(newPreview);
    dispatch(PhotoActions.startSaveDB())
  }

  await previewsRepository.find({
    where: {
      userId: userId
    }
  })
}

export async function saveAlbums(listPhotos: Previews[], name: string) {
  const userId = await getUserId()

  const albumRepository = getRepository(Albums);

  await albumRepository.find({
    where: { userId: userId }
  })

  const newAlbum = new Albums()

  newAlbum.userId = userId
  newAlbum.name = name

  await albumRepository.save(newAlbum);

  await albumRepository.find({
    where: { userId: userId }
  });

  const albumPhotosRepository = getRepository(PhotoAlbums);

  await albumPhotosRepository.find({})

  const newPhotosAlbum = new PhotoAlbums();

  listPhotos.map((res) => {

    newPhotosAlbum.albumId = newAlbum.id
    newPhotosAlbum.previewId = res.photoId
  })

  await albumPhotosRepository.save(newPhotosAlbum);

  await albumPhotosRepository.find({})
}

export async function deleteAlbum(id: number) {
  const albumsRepository = getRepository(Albums);
  const photoAlbumsRepository = getRepository(PhotoAlbums);
  const userId = getUserId()

  const albums = await albumsRepository.findOne(({
    where: {
      userId: userId,
      id: id
    }
  }))

  const removeAlbum = await albumsRepository.remove(albums)

  await albumsRepository.find({})

  const photosAlbums = await photoAlbumsRepository.find(({
    where: {
      albumId: id
    }
  }))

  const removePhotosAlbums = await photoAlbumsRepository.remove(photosAlbums)

  await photoAlbumsRepository.find({})

  return { removeAlbum, removePhotosAlbums }

}

export async function deletePhotoFromAlbum(albumId: number, photoId: number) {
  const photoAlbumsRepository = getRepository(PhotoAlbums);

  const photosAlbums = await photoAlbumsRepository.findOne(({
    where: {
      albumId: albumId,
      photoId: photoId
    }
  }))

  const removePhoto = await photoAlbumsRepository.remove(photosAlbums)

  await photoAlbumsRepository.find({})

  return removePhoto
}

export async function addPhotoToAlbum(albumId: number, photoId: number) {
  const photoAlbumsRepository = getRepository(PhotoAlbums);

  await photoAlbumsRepository.find(({
    where: {
      albumId: albumId
    }
  }))

  const newPhotoToAlbum = new PhotoAlbums();

  newPhotoToAlbum.albumId = albumId
  newPhotoToAlbum.previewId = photoId

  await photoAlbumsRepository.save(newPhotoToAlbum);

  await photoAlbumsRepository.find({})
}

export async function updateNameAlbum(albumId: number, name: string) {
  const albumsRepository = getRepository(Albums);

  const albums = await albumsRepository.findOne(({
    where: {
      albumId: albumId
    }
  }))

  albums.name = name;
  await albumsRepository.save(albums);

  return albums;
}
