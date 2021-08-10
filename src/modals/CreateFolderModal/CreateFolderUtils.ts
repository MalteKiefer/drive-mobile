import { getHeaders } from '../../helpers/headers';

const invalidName = /[\\/]|[. ]$/

interface CreateFolderParam {
  folderName: string
  parentId: number
}

export function IsJsonString(str: string): any {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

export async function createFolder(params: CreateFolderParam): Promise<any> {
  return fetch(`${process.env.REACT_NATIVE_API_URL}/api/storage/folder`, {
    method: 'post',
    headers: await getHeaders(),
    body: JSON.stringify({
      parentFolderId: params.parentId,
      folderName: params.folderName
    })
  }).then(async res => {
    if (res.status === 201) {
      return res.json()
    } else {
      const body = await res.text()
      const json = IsJsonString(body)

      if (json) {
        throw Error(json.error)
      } else {
        throw Error(body)
      }
    }
  })
}
