import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';

enum AcceptedEncodings {
  Utf8 = 'utf8',
  Ascii = 'ascii',
  Base64 = 'base64'
}

export function getDocumentsDir(): string {
  return RNFS.DocumentDirectoryPath;
}

export function getDownloadsDir(): string {
  // MainBundlePath is only available on iOS
  return Platform.OS === 'ios' ? RNFS.MainBundlePath : RNFS.DownloadDirectoryPath;
}

export function moveFile(source: string, target: string): Promise<void> {
  return RNFS.moveFile(source, target);
}

export function copyFile(source: string, target: string): Promise<void> {
  return RNFS.copyFile(source, target);
}

export function getTemporaryDir(): string {
  return RNFS.TemporaryDirectoryPath;
}

export async function clearTempDir(): Promise<void> {
  const items = await RNFS.readDir(getTemporaryDir());

  items.forEach(async (item) => {
    await unlink(item.path);
  });
}

export function getCacheDir(): string {
  return RNFS.CachesDirectoryPath;
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

export function stat(fileUri: string): Promise<any> {
  // return RNFS.stat(fileUri);
  return RNFetchBlob.fs.stat(fileUri);
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