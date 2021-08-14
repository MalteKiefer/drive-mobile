import RNFS from 'react-native-fs';

import { Directory, DirectoriesPaths, FileSystemReference } from './';

function adaptUri(rawUri: string): string {
  return rawUri;
}

export class IOSFileSystemReference extends FileSystemReference {
  constructor(uri: string) {
    super(adaptUri(uri));
  }

  copyFile(destination: string) {
    return RNFS.copyFile(this.uri, adaptUri(destination));
  }
}

export const directories: DirectoriesPaths = new Map();
directories.set(Directory.Downloads, RNFS.MainBundlePath);
directories.set(Directory.Documents, RNFS.DocumentDirectoryPath);
directories.set(Directory.Temporary, RNFS.TemporaryDirectoryPath);
directories.set(Directory.Cache, RNFS.CachesDirectoryPath);