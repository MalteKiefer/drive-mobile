import { Environment } from '../inxt-js';
import { createHash } from 'react-native-crypto';

import { getUser } from '../database/DBUtils.ts/utils';
import RNFetchBlob from 'rn-fetch-blob';
import { FileChunker } from './chunkUploader';
import { determineShardSize } from '../inxt-js/lib/utils';

type ProgressCallback = (progress: number, uploadedBytes: number | null, totalBytes: number | null) => void;

interface IUploadParams {
  filesize: number,
  filepath: string,
  filecontent: FileChunker,
  progressCallback: ProgressCallback;
}

interface IMobileUploadParams {
  filepath: string;
  fileUri: string;
  progressCallback: ProgressCallback;
}

interface IDownloadParams {
  progressCallback: ProgressCallback;
}

interface EnvironmentConfig {
  bridgeUser: string,
  bridgePass: string,
  encryptionKey: string,
  bucketId: string
}

export class Network {
    private environment: Environment;
    private bridgeUrl = 'https://api.internxt.com';

    constructor(bridgeUser: string, bridgePass: string, encryptionKey: string) {
      if (!bridgeUser) {
        throw new Error('Bridge user not provided');
      }

      if (!bridgePass) {
        throw new Error('Bridge pass not provided');
      }

      if (!encryptionKey) {
        throw new Error('Mnemonic not provided');
      }

      this.environment = new Environment({ bridgePass, bridgeUser, encryptionKey, bridgeUrl: this.bridgeUrl });
    }

    async uploadFile(bucketId: string, params: IMobileUploadParams): Promise<string> {
      const fileChunker = new FileChunker(params.fileUri, determineShardSize(0));

      const stat = await RNFetchBlob.fs.stat(params.fileUri);

      return this._uploadFile(bucketId, {
        filepath: params.filepath,
        filecontent: fileChunker,
        filesize: parseInt(stat.size),
        progressCallback: params.progressCallback
      });
    }

    /**
     * Uploads a file to the Internxt Network
     * @param bucketId Bucket where file is going to be uploaded
     * @param params Required params for uploading a file
     * @returns Id of the created file
     */
    private _uploadFile(bucketId: string, params: IUploadParams): Promise<string> {
      if (!bucketId) {
        throw new Error('Bucket id not provided');
      }

      const hashName = createHash('ripemd160').update(params.filepath).digest('hex');

      return new Promise((resolve: (fileId: string) => void, reject) => {
        this.environment.uploadFile(bucketId, {
          filename: hashName,
          fileSize: params.filesize,
          fileContent: params.filecontent,
          progressCallback: params.progressCallback,
          finishedCallback: (err, fileId) => {
            if (err) {
              return reject(err);
            }

            resolve(fileId);
          }
        });
      });
    }

    /**
     * Downloads a file from the Internxt Network
     * @param bucketId Bucket where file is uploaded
     * @param fileId Id of the file to be downloaded
     * @param params Required params for downloading a file
     * @returns
     */
    downloadFile(bucketId: string, fileId: string, params: IDownloadParams): Promise<void> {
      if (!bucketId) {
        throw new Error('Bucket id not provided');
      }

      if (!fileId) {
        throw new Error('File id not provided');
      }

      return new Promise((resolve, reject) => {
        this.environment.downloadFile(bucketId, fileId, {
          progressCallback: params.progressCallback,
          finishedCallback: (err: Error | null) => {
            if (err) {
              return reject(err);
            }
            resolve();
          }
        });
      });
    }
}

/**
 * Returns required config to upload files to the Internxt Network
 * @returns
 */
export function getEnvironmentConfig(): Promise<EnvironmentConfig> {
  return getUser().then((user) => ({
    bridgeUser: user.email,
    bridgePass: user.userId,
    encryptionKey: user.mnemonic,
    bucketId: user.bucket
  }));
}