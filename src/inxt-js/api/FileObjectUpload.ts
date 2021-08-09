import { Transform } from 'readable-stream';
import { randomBytes } from 'react-native-crypto';

import { EnvironmentConfig, UploadProgressCallback } from '..';

import EncryptStream from '../lib/encryptStream';
import { GenerateFileKey, sha512HmacBuffer } from '../lib/crypto';
import { getShardMeta, ShardMeta } from '../lib/shardMeta';
import { ContractNegotiated } from '../lib/contracts';
import { logger } from '../lib/utils/logger';

import { ExchangeReport } from './reports';
import { Shard } from './shard';
import { FunnelStream } from '../lib/funnelStream';
import { determineConcurrency, determineShardSize } from '../lib/utils';
import { Bridge, CreateEntryFromFrameBody, CreateEntryFromFrameResponse, FrameStaging, InxtApiI, SendShardToNodeResponse } from '../services/api';
import { EventEmitter } from '../lib/utils/eventEmitter';
import { INXTRequest } from '../lib';
import { wrap } from 'lodash';
import { UploaderQueue } from '../lib/upload/uploader';
import { ShardObject } from './ShardObject';
import { UPLOAD_CANCELLED } from './constants';
import { FileChunker } from '../../lib/chunkUploader';
import { createCipheriv } from 'react-native-crypto';

export interface FileMeta {
  size: number;
  name: string;
  content: FileChunker;
}

export class FileObjectUpload extends EventEmitter {
  private config: EnvironmentConfig;
  private fileMeta: FileMeta;
  private requests: INXTRequest[] = [];
  private api: InxtApiI;
  private id = '';
  private aborted = false;

  shardMetas: ShardMeta[] = [];
  bucketId: string;
  frameId: string;
  index: Buffer;
  encrypted = false;

  cipher: EncryptStream;
  funnel: FunnelStream;
  fileEncryptionKey: Buffer;

  constructor(config: EnvironmentConfig, fileMeta: FileMeta, bucketId: string, api?: InxtApiI) {
    super();

    this.config = config;
    this.index = Buffer.alloc(0);
    this.fileMeta = fileMeta;
    this.bucketId = bucketId;
    this.frameId = '';
    this.funnel = new FunnelStream(determineShardSize(fileMeta.size));
    this.cipher = new EncryptStream(randomBytes(32), randomBytes(16));
    this.fileEncryptionKey = randomBytes(32);
    this.api = api ?? new Bridge(this.config);
  }

  getSize(): number {
    return this.fileMeta.size;
  }

  getId(): string {
    return this.id;
  }

  getFileChunker(): FileChunker {
    return this.fileMeta.content;
  }

  getEncryptionKey(): Buffer {
    return this.fileEncryptionKey;
  }

  getIndex(): Buffer {
    return this.index.slice(0, 16);
  }

  checkIfIsAborted(): void {
    if (this.isAborted()) {
      throw new Error('Upload aborted');
    }
  }

  async init(): Promise<FileObjectUpload> {
    this.index = randomBytes(32);
    this.fileEncryptionKey = await GenerateFileKey(this.config.encryptionKey || '', this.bucketId, this.index);

    this.cipher = new EncryptStream(this.fileEncryptionKey, this.index.slice(0, 16));

    return this;
  }

  checkBucketExistence(): Promise<boolean> {
    this.checkIfIsAborted();

    const req = this.api.getBucketById(this.bucketId);

    this.requests.push(req);

    return req.start().then(() => {
      logger.info(`Bucket ${this.bucketId} exists`);

      return true;
    }).catch((err) => {
      throw wrap('Bucket existence check error', err);
    });
  }

  stage(): Promise<void> {
    this.checkIfIsAborted();

    const req = this.api.createFrame();

    this.requests.push(req);

    return req.start<FrameStaging>().then((frame) => {
      if (!frame || !frame.id) {
        throw new Error('Frame response is empty');
      }

      this.frameId = frame.id;

      logger.info(`Stage a file with frame ${this.frameId}`);
    }).catch((err) => {
      throw wrap('Bridge frame creation error', err);
    });
  }

  SaveFileInNetwork(bucketEntry: CreateEntryFromFrameBody): Promise<void | CreateEntryFromFrameResponse> {
    this.checkIfIsAborted();

    const req = this.api.createEntryFromFrame(this.bucketId, bucketEntry);

    this.requests.push(req);

    return req.start<CreateEntryFromFrameResponse>()
      .catch((err) => {
        throw wrap('Saving file in network error', err);
      });
  }

  NegotiateContract(frameId: string, shardMeta: ShardMeta): Promise<void | ContractNegotiated> {
    this.checkIfIsAborted();

    const req = this.api.addShardToFrame(frameId, shardMeta);

    this.requests.push(req);

    return req.start<ContractNegotiated>()
      .catch((err) => {
        throw wrap('Contract negotiation error', err);
      });
  }

  GenerateHmac(shardMetas: ShardMeta[]): string {
    const shardMetasCopy = [...shardMetas].sort((sA, sB) => sA.index - sB.index);
    const hmac = sha512HmacBuffer(this.fileEncryptionKey);

    for (const shardMeta of shardMetasCopy) {
      hmac.update(Buffer.from(shardMeta.hash, 'hex'));
    }

    return hmac.digest().toString('hex');
  }

  encrypt(): EncryptStream {
    this.encrypted = true;

    return this.cipher;
  }

  private parallelUpload(callback: UploadProgressCallback): Promise<ShardMeta[]> {
    const nShards = Math.ceil(this.fileMeta.size / determineShardSize(this.fileMeta.size));
    const fileChunker = this.fileMeta.content;
    const uploads = [];

    let progress = 0;

    const cipher = createCipheriv('aes-256-ctr', this.fileEncryptionKey, this.index.slice(0, 16));

    return new Promise((resolve, reject) => {
      fileChunker.on('chunk-error', reject);

      fileChunker.on('chunk-end', async (chunkPointers) => {
        console.log('chunking finished. Uploading and removing chunks');

        for (const chunkPointer of chunkPointers) {
          console.log('Handling chunk: ', chunkPointer.index);

          const chunkStream = await fileChunker.getChunk(chunkPointer);

          chunkStream.open();

          let chunkSlices: Buffer[] = [];

          chunkStream.onData((chunk: string) => {
            chunkSlices.push(Buffer.from(chunk, FileChunker.defaultEncoding));
          });

          chunkStream.onError((err) => {
            console.log('chunkStream Error', err.message);
            reject(err);
          });

          await new Promise((forResolve, forReject) => {
            chunkStream.onEnd(() => {
              cipher.write(Buffer.concat(chunkSlices));

              const encryptedChunk = cipher.read();

              this.uploadShard(encryptedChunk, encryptedChunk.length, this.frameId, chunkPointer.index, 3, false)
                .then((shardMeta) => {
                  progress += (encryptedChunk.length / this.fileMeta.size);
                  callback(progress, encryptedChunk.length, this.fileMeta.size);
                  this.shardMetas.push(shardMeta);
                }).catch((err) => {
                  forReject(err);
                }).finally(() => {
                  uploads.push(fileChunker.destroyChunk(chunkPointer));
                  chunkSlices = [];

                  forResolve(null);
                });
            });
          });
        }
      })

      const uploadFinishedCheckerInterval = setInterval(() => {
        if (uploads.length === nShards) {
          Promise.all(uploads).then(() => {
            clearInterval(uploadFinishedCheckerInterval);
            resolve(this.shardMetas);
          }).catch((err) => {
            clearInterval(uploadFinishedCheckerInterval);
            reject(err);
          });
        }
      }, 500);

      fileChunker.start(nShards);
    });
  }

  upload(callback: UploadProgressCallback): Promise<ShardMeta[]> {
    this.checkIfIsAborted();

    if (!this.encrypted) {
      throw new Error('Tried to upload a file not encrypted. Call encrypt() before upload()');
    }

    return this.parallelUpload(callback);
  }

  async uploadShard(encryptedShard: Buffer, shardSize: number, frameId: string, index: number, attemps: number, parity: boolean): Promise<ShardMeta> {
    const shardMeta: ShardMeta = getShardMeta(encryptedShard, shardSize, index, parity);

    logger.info(`Uploading shard ${shardMeta.hash} index ${shardMeta.index} size ${shardMeta.index} parity ${parity}`);

    const shardObject = new ShardObject(this.api, frameId, shardMeta);

    shardObject.once(ShardObject.Events.NodeTransferFinished, ({ success, nodeID, hash }) => {
      const exchangeReport = new ExchangeReport(this.config);

      exchangeReport.params.dataHash = hash;
      exchangeReport.params.farmerId = nodeID;
      exchangeReport.params.exchangeEnd = new Date();

      if (success) {
        logger.debug(`Node ${nodeID} accepted shard ${hash}`);
        exchangeReport.UploadOk();
      } else {
        exchangeReport.UploadError();
      }

      exchangeReport.sendReport().catch(() => {
        // no op
      });
    });

    let retries = attemps;

    do {
      try {
        await shardObject.upload(encryptedShard);

        logger.info(`Shard ${shardMeta.hash} uploaded succesfully`);

        retries = 0;
      } catch (err) {
        logger.error(`Upload for shard ${shardMeta.hash} failed. Reason: ${err.message}. Retrying ...`);

        retries--;
      }
    } while (retries > 0);

    encryptedShard = null;

    return shardMeta;
  }

  createBucketEntry(shardMetas: ShardMeta[]): Promise<void> {
    return this.SaveFileInNetwork(generateBucketEntry(this, this.fileMeta, shardMetas, false))
      .then((bucketEntry) => {
        if (!bucketEntry) {
          throw new Error('Can not save the file in the network');
        }
        this.id = bucketEntry.id;
      })
      .catch((err) => {
        throw wrap('Bucket entry creation error', err);
      });
  }

  abort(): void {
    logger.warn('Aborting file upload');

    this.aborted = true;
  }

  isAborted(): boolean {
    return this.aborted;
  }
}

function updateProgress(totalBytes: number, currentBytesUploaded: number, newBytesUploaded: number, progress: UploadProgressCallback): number {
  const newCurrentBytes = currentBytesUploaded + newBytesUploaded;
  const progressCounter = newCurrentBytes / totalBytes;

  progress(progressCounter, newCurrentBytes, totalBytes);

  return newCurrentBytes;
}

export function generateBucketEntry(fileObject: FileObjectUpload, fileMeta: FileMeta, shardMetas: ShardMeta[], rs: boolean): CreateEntryFromFrameBody {
  const bucketEntry: CreateEntryFromFrameBody = {
    frame: fileObject.frameId,
    filename: fileMeta.name,
    index: fileObject.index.toString('hex'),
    hmac: { type: 'sha512', value: fileObject.GenerateHmac(shardMetas) }
  };

  if (rs) {
    bucketEntry.erasure = { type: 'reedsolomon' };
  }

  return bucketEntry;
}
