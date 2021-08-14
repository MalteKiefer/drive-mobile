import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import { Platform } from 'react-native';

import { AndroidFileSystemReference, directories as androidDirs } from './android';
import { IOSFileSystemReference, directories as iosDirs } from './ios';

enum AcceptedEncodings {
  Utf8 = 'utf8',
  Ascii = 'ascii',
  Base64 = 'base64'
}

export enum Directory {
  Downloads = 'downloads',
  Documents = 'documents',
  Temporary = 'temporary',
  Cache = 'cache'
}

export type DirectoryPath = string;
export type DirectoriesPaths = Map<Directory, DirectoryPath>;
type OSDirectories = Map<typeof Platform.OS, DirectoriesPaths>;

export const osDirectories: OSDirectories = new Map();
osDirectories.set('android', androidDirs);
osDirectories.set('ios', iosDirs);

export function moveFile(source: string, target: string): Promise<void> {
  return RNFS.moveFile(source, target);
}

export function readFileStream(): void {
  throw new Error('Not implemented yet');
}

export function readFile(uri: string, length?: number, position?: number): Promise<Buffer> {
  return RNFS.read(uri, length, position, 'base64').then((res) => {
    return Buffer.from(res, 'base64');
  });
}

export function exists(uri: string): Promise<boolean> {
  return RNFS.exists(uri);
}

export function createFile(path: string, content: string, encoding: AcceptedEncodings): Promise<void> {
  return RNFetchBlob.fs.createFile(path, content, encoding);
}

export function createEmptyFile(path: string): Promise<void> {
  return createFile(path, '', AcceptedEncodings.Utf8);
}

export function unlink(uri: string): Promise<void> {
  return RNFS.unlink(uri);
}

export function writeFileStream(uri: string): Promise<FileWriter> {
  return RNFetchBlob.fs.writeStream(uri, 'base64').then((writeStream) => {
    return {
      write: (content: string) => writeStream.write(content),
      close: () => writeStream.close()
    }
  });
}

export function writeFile(): void {
  throw new Error('Not implemented yet');
}

export function stat(fileUri: string): Promise<RNFS.StatResult> {
  return RNFS.stat(fileUri);
}

interface FileWriter {
  write(content: string): Promise<void>;
  close(): void;
}

interface FileIterator {
  next(): Promise<Buffer>;
}

export class FileManager {
  private fileUri: string;
  private fileStat: RNFS.StatResult;

  constructor(uri: string) {
    this.fileUri = uri;
  }

  getStat(): Promise<RNFS.StatResult> {
    return stat(this.fileUri).then((stat) => {
      this.fileStat = stat;

      return stat;
    })
  }

  exists(): Promise<boolean> {
    return exists(this.fileUri);
  }

  stream(): void {
    throw new Error('Not implemented yet');
  }

  iterator(chunkSize: number): FileIterator {
    let pos = 0;

    return {
      next: () => {
        pos += chunkSize;

        return readFile(this.fileUri, chunkSize, pos - chunkSize);
      }
    }
  }

  writer(): Promise<FileWriter> {
    return writeFileStream(this.fileUri);
  }

  read(length?: number, position?: number): Promise<Buffer> {
    return readFile(this.fileUri, length, position);
  }

  destroy(): Promise<void> {
    return unlink(this.fileUri);
  }
}

export class FileSystemReference {
  protected uri: string;

  constructor(uri: string) {
    this.uri = uri;
  }

  exists(): Promise<boolean> {
    return exists(this.uri);
  }

  stat(): Promise<any> {
    return stat(this.uri);
  }

  read(offset: number, bytesToRead: number): Promise<Buffer> {
    return readFile(this.uri, bytesToRead, offset);
  }

  unlink(): Promise<void> {
    return unlink(this.uri);
  }

  writeStream(): Promise<FileWriter> {
    return writeFileStream(this.uri);
  }
}

type FileSystemReferences = Map<typeof Platform.OS, typeof FileSystemReference>;

const supportedFileSystemReferences: FileSystemReferences = new Map();

supportedFileSystemReferences.set('ios', IOSFileSystemReference);
supportedFileSystemReferences.set('android', AndroidFileSystemReference);

export function createFileSystemReference(uri: string): FileSystemReference {
  if (!supportedFileSystemReferences.has(Platform.OS)) {
    throw new Error('File system not supported yet');
  }

  const FileSystemReferenceClass = supportedFileSystemReferences.get(Platform.OS);

  return new FileSystemReferenceClass(uri);
}

const osDirectory = osDirectories.get(Platform.OS);

export const dirs = {
  Documents: osDirectory.get(Directory.Documents),
  Downloads: osDirectory.get(Directory.Downloads),
  Temporary: osDirectory.get(Directory.Temporary),
  Cache: osDirectory.get(Directory.Cache)
}

function removeExtension(uri: string) {
  return uri.substring(0, uri.length - (getExtension(uri).length + 1));
}

function getExtension(uri: string) {
  const regex = /^(.*:\/{0,2})\/?(.*)$/gm;
  const fileUri = uri.replace(regex, '$2');

  return fileUri.split('.').pop();
}

export const utils = {
  removeExtension,
  getExtension
}
