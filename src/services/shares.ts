import { IFile } from '../components/FileList';
import { getHeaders } from '../helpers/headers';

export async function getShareList(): Promise<IFile[]> {
  return fetch(`${process.env.REACT_NATIVE_API_URL}/api/share/list`, {
    method: 'get',
    headers: await getHeaders()
  }).then(res => {
    if (res.status !== 200) { throw Error('Cannot load shares') }
    return res;
  }).then(res => res.json()).then(res => { return res; })
}
