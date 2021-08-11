import { MIN_SHARD_SIZE, SHARD_MULTIPLE_BACK, MAX_SHARD_SIZE } from '../../api/constants';

/**
 * Determines the best concurrency number of chunks in memory to fit
 * desired ram usage
 * @param desiredRamUsage Desired ram usage in bytes
 * @param fileSize Size of the file to work with
 * @returns Concurrency number
 */
export function determineConcurrency(desiredRamUsage: number, fileSize: number): number {
  const shardSize = determineShardSize(fileSize);

  return Math.max(Math.floor(desiredRamUsage / shardSize), 1);
}

function shardSize(hops: number): number {
  return MIN_SHARD_SIZE * Math.pow(2, hops);
}

export function _determineShardSize(fileSize: number, accumulator = 0): number {
  if (fileSize < 0) { return 0; }

  let hops = ((accumulator - SHARD_MULTIPLE_BACK) < 0) ? 0 : accumulator - SHARD_MULTIPLE_BACK;

  const byteMultiple = shardSize(accumulator);

  const check = fileSize / byteMultiple;

  if (check > 0 && check <= 1) {
    while (hops > 0 && shardSize(hops) > MAX_SHARD_SIZE) {
      hops = hops - 1 <= 0 ? 0 : hops - 1;
    }

    return shardSize(hops);
  }

  if (accumulator > 41) {
    return 0;
  }

  return _determineShardSize(fileSize, ++accumulator);
}

export function determineParityShards(totalShards: number): number {
  return Math.ceil(totalShards * 2 / 3);
}

/**
 * Determines the best shard size for a provided file size
 * @param fileSize Size of the file to be sharded
 * @returns Shard size
 */
export function determineShardSize(fileSize: number): number {
  return 4095 * 600;
}

export function determineTick(fileSize: number): number {
  const oneMb = 1024 * 1024;
  const oneHundredMb = 100 * oneMb;
  const twoHundredMb = 200 * oneMb;

  if (fileSize < oneHundredMb) {
    return 50;
  }

  if (fileSize < twoHundredMb) {
    return 200;
  }

  return 1000;
}
