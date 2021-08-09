import { upload } from './lib/upload';
import { download, Logger } from './lib/download';
import { EncryptFilename } from './lib/crypto';
import { logger } from './lib/utils/logger';

import { FileMeta } from './api/FileObjectUpload';
import { BUCKET_ID_NOT_PROVIDED, ENCRYPTION_KEY_NOT_PROVIDED } from './api/constants';
import { ActionState, ActionTypes } from './api/ActionState';
import { FileChunker } from '../lib/chunkUploader';

export type OnlyErrorCallback = (err: Error | null) => void;
export type UploadFinishCallback = (err: Error | null, response: string | null) => void;
export type DownloadFinishedCallback = (err: Error | null) => void;
export type DownloadProgressCallback = (progress: number, downloadedBytes: number | null, totalBytes: number | null) => void;
export type DecryptionProgressCallback = (progress: number, decryptedBytes: number | null, totalBytes: number | null) => void;
export type UploadProgressCallback = (progress: number, uploadedBytes: number | null, totalBytes: number | null) => void;

export interface UploadFileOptions {
  progressCallback: UploadProgressCallback;
  finishedCallback: UploadFinishCallback;
}
export interface ResolveFileOptions {
  progressCallback: DownloadProgressCallback;
  finishedCallback: OnlyErrorCallback;
  overwritte?: boolean;
}

export interface DownloadFileOptions {
  progressCallback: DownloadProgressCallback;
  decryptionProgressCallback?: DecryptionProgressCallback;
  finishedCallback: DownloadFinishedCallback;
}

interface UploadFileParams {
  filename: string;
  fileSize: number;
  fileContent: FileChunker;
  progressCallback: UploadProgressCallback;
  finishedCallback: UploadFinishCallback;
}

function createLogger(): Logger {
  return {
    // eslint-disable-next-line no-console
    info: console.log,
    // eslint-disable-next-line no-console
    debug: console.debug,
    // eslint-disable-next-line no-console
    warn: console.warn,
    // eslint-disable-next-line no-console
    error: console.error
  }
}

export class Environment {
  protected config: EnvironmentConfig;

  constructor(config: EnvironmentConfig) {
    this.config = config;
  }

  setEncryptionKey(newEncryptionKey: string): void {
    this.config.encryptionKey = newEncryptionKey;
  }

  downloadFile(bucketId: string, fileId: string, options: DownloadFileOptions): ActionState {
    const downloadState = new ActionState(ActionTypes.Download);

    if (!this.config.encryptionKey) {
      options.finishedCallback(Error(ENCRYPTION_KEY_NOT_PROVIDED));
      return downloadState;
    }

    if (!bucketId) {
      options.finishedCallback(Error(BUCKET_ID_NOT_PROVIDED));
      return downloadState;
    }

    download(this.config, bucketId, fileId, options.progressCallback, createLogger(), downloadState).then(() => {
      options.finishedCallback(null);
    }).catch((err) => {
      options.finishedCallback(err);
    });

    return downloadState;
  }

  /**
   * Uploads a file from a web browser
   * @param bucketId Bucket id where file is going to be stored
   * @param params Upload file params
   */
  uploadFile(bucketId: string, params: UploadFileParams): ActionState {
    const uploadState = new ActionState(ActionTypes.Upload);

    if (!this.config.encryptionKey) {
      params.finishedCallback(Error('Mnemonic was not provided, please, provide a mnemonic'), null);
      return;
    }

    if (!bucketId) {
      params.finishedCallback(Error('Bucket id was not provided'), null);
      return;
    }

    if (!params.filename) {
      params.finishedCallback(Error('Filename was not provided'), null);
      return;
    }

    if (params.fileSize === 0) {
      params.finishedCallback(Error('Can not upload a file with size 0'), null);
      return;
    }

    const { filename, fileSize: size, fileContent } = params;

    EncryptFilename(this.config.encryptionKey, bucketId, filename)
      .then((name: string) => {
        logger.debug(`Filename ${filename} encrypted is ${name}`);

        const fileToUpload: FileMeta = { content: fileContent, name, size };

        upload(this.config, bucketId, fileToUpload, params, uploadState);
      })
      .catch((err: Error) => {
        logger.error(`Error encrypting filename due to ${err.message}`);
        logger.error(err);

        params.finishedCallback(err, null);
      });

    return uploadState;
  }

  /**
   * Cancels the upload
   * @param state Upload file state at the moment
   */
  uploadFileCancel(state: ActionState): void {
    state.stop();
  }
}

export interface EnvironmentConfig {
  bridgeUrl?: string;
  bridgeUser: string;
  bridgePass: string;
  encryptionKey?: string;
  logLevel?: number;
  webProxy?: string;
  useProxy?: boolean;
  config?: {
    shardRetry: number
  };
}
