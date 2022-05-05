import { createHash } from 'crypto';
import axios from 'axios';

import { DriveFileMetadataPayload, DriveItemData, SortDirection, SortType } from '../types/drive';
import { getHeaders } from '../helpers/headers';
import { constants } from './app';
import { FetchFolderContentResponse } from '@internxt/sdk/dist/drive/storage/types';

export function getNameFromUri(uri: string): string {
  const regex = /^(.*:\/{0,2})\/?(.*)$/gm;
  const fileUri = uri.replace(regex, '$2');

  return fileUri.split('/').pop() || '';
}

export function getExtensionFromUri(uri: string): string | undefined {
  const regex = /^(.*:\/{0,2})\/?(.*)$/gm;
  const fileUri = uri.replace(regex, '$2');

  return fileUri.split('.').pop();
}

export function removeExtension(filename: string): string {
  const filenameSplitted = filename.split('.');
  const extension = filenameSplitted && filenameSplitted.length > 1 ? (filenameSplitted.pop() as string) : '';

  if (extension === '') {
    return filename;
  }

  return filename.substring(0, filename.length - (extension.length + 1));
}

export function renameIfAlreadyExists(
  items: { type: string; name: string }[],
  filename: string,
  type: string,
): [boolean, number, string] {
  const FILENAME_INCREMENT_REGEX = /( \([0-9]+\))$/i;
  const INCREMENT_INDEX_REGEX = /\(([^)]+)\)/;
  const infoFilenames: { cleanName: string; type: string; incrementIndex: number }[] = items
    .map((item) => {
      const cleanName = item.name.replace(FILENAME_INCREMENT_REGEX, '');
      const incrementString = item.name.match(FILENAME_INCREMENT_REGEX)?.pop()?.match(INCREMENT_INDEX_REGEX)?.pop();
      const incrementIndex = parseInt(incrementString || '0');

      return {
        cleanName,
        type: item.type,
        incrementIndex,
      };
    })
    .filter((item) => item.cleanName === filename && item.type === type)
    .sort((a, b) => b.incrementIndex - a.incrementIndex);
  const filenameExists = infoFilenames.length > 0;
  const filenameIndex = infoFilenames[0] ? infoFilenames[0].incrementIndex + 1 : 0;
  const finalFilename = filenameIndex > 0 ? getNextNewName(filename, filenameIndex) : filename;

  return [filenameExists, filenameIndex, finalFilename];
}

export function getNextNewName(filename: string, i: number): string {
  return `${filename} (${i})`;
}

async function getFolderContent(folderId: number): Promise<FetchFolderContentResponse> {
  const headers = await getHeaders();
  const headersMap: Record<string, string> = {};

  headers.forEach((value: string, key: string) => {
    headersMap[key] = value;
  });

  const response = await axios.get<FetchFolderContentResponse>(
    `${constants.REACT_NATIVE_DRIVE_API_URL}/api/storage/v2/folder/${folderId}`,
    {
      headers: headersMap,
    },
  );

  return response.data;
}

async function updateMetaData(
  fileId: string,
  metadata: DriveFileMetadataPayload,
  bucketId: string,
  relativePath: string,
): Promise<void> {
  const hashedRelativePath = createHash('ripemd160').update(relativePath).digest('hex');
  const headers = await getHeaders();
  const headersMap: Record<string, string> = {};

  headers.forEach((value: string, key: string) => {
    headersMap[key] = value;
  });

  return axios
    .post(
      `${constants.REACT_NATIVE_DRIVE_API_URL}/api/storage/file/${fileId}/meta`,
      {
        metadata,
        bucketId,
        relativePath: hashedRelativePath,
      },
      { headers: headersMap },
    )
    .then(() => undefined);
}

async function moveFile(fileId: string, destination: number): Promise<number> {
  const headers = await getHeaders();
  const data = JSON.stringify({ fileId, destination });

  const res = await fetch(`${constants.REACT_NATIVE_DRIVE_API_URL}/api/storage/moveFile`, {
    method: 'POST',
    headers,
    body: data,
  });

  if (res.status === 200) {
    return 1;
  } else {
    const data = await res.json();

    return data.message;
  }
}

async function deleteItems(items: any[]): Promise<void> {
  const fetchArray: any[] = [];

  for (const item of items) {
    const isFolder = !item.fileId;
    const headers = await getHeaders();
    const url = isFolder
      ? `${constants.REACT_NATIVE_DRIVE_API_URL}/api/storage/folder/${item.id}`
      : `${constants.REACT_NATIVE_DRIVE_API_URL}/api/storage/bucket/${item.bucket}/file/${item.fileId}`;

    const fetchObj = fetch(url, {
      method: 'DELETE',
      headers,
    });

    fetchArray.push(fetchObj);
  }

  return Promise.all(fetchArray).then(() => undefined);
}

export type ArraySortFunction = (a: DriveItemData, b: DriveItemData) => number;

function getSortFunction({
  type,
  direction,
}: {
  type: SortType;
  direction: SortDirection;
}): ArraySortFunction | undefined {
  let sortFunction: ArraySortFunction | undefined;

  switch (type) {
    case SortType.Name:
      sortFunction =
        direction === SortDirection.Asc
          ? (a: DriveItemData, b: DriveItemData) => {
              const aName = a.name.toLowerCase();
              const bName = b.name.toLowerCase();

              return aName < bName ? -1 : aName > bName ? 1 : 0;
            }
          : (a: DriveItemData, b: DriveItemData) => {
              const aName = a.name.toLowerCase();
              const bName = b.name.toLowerCase();

              return aName < bName ? 1 : aName > bName ? -1 : 0;
            };
      break;
    case SortType.Size:
      sortFunction =
        direction === SortDirection.Asc
          ? (a: DriveItemData, b: DriveItemData) => {
              return a.size > b.size ? 1 : -1;
            }
          : (a: DriveItemData, b: DriveItemData) => {
              return a.size < b.size ? 1 : -1;
            };
      break;
    case SortType.UpdatedAt:
      sortFunction =
        direction === SortDirection.Asc
          ? (a: DriveItemData, b: DriveItemData) => {
              const aTime = new Date(a.updatedAt).getTime();
              const bTime = new Date(b.updatedAt).getTime();

              return aTime < bTime ? 1 : -1;
            }
          : (a: DriveItemData, b: DriveItemData) => {
              const aTime = new Date(a.updatedAt).getTime();
              const bTime = new Date(b.updatedAt).getTime();

              return aTime > bTime ? 1 : -1;
            };
      break;
  }

  return sortFunction;
}

async function renameFileInNetwork(fileId: string, bucketId: string, relativePath: string): Promise<void> {
  const hashedRelativePath = createHash('ripemd160').update(relativePath).digest('hex');
  const headers = await getHeaders();
  const headersMap: Record<string, string> = {};

  headers.forEach((value: string, key: string) => {
    headersMap[key] = value;
  });

  await axios.post<{ message: string }>(
    `${constants.REACT_NATIVE_DRIVE_API_URL}/api/storage/rename-file-in-network`,
    {
      fileId,
      bucketId,
      relativePath: hashedRelativePath,
    },
    { headers: headersMap },
  );
}

const fileService = {
  getFolderContent,
  getSortFunction,
  moveFile,
  deleteItems,
  updateMetaData,
  renameFileInNetwork,
};

export default fileService;
