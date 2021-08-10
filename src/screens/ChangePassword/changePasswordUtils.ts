import _ from 'lodash'
import { decryptText, encryptText, encryptTextWithKey, passToHash, getLyticsData } from '../../helpers';
import { getHeaders } from '../../helpers/headers';

export function isStrongPassword(pwd: string): boolean {
  return /^(?=.*[a-zA-Z])(?=.*[0-9]).{6,}$/.test(pwd);
}

export function isNullOrEmpty(input: string): boolean {
  return _.isEmpty(input)
}
interface ChangePasswordParam {
  password: string
  newPassword: string
}

export async function getNewBits(): Promise<string> {
  return fetch(`${process.env.REACT_NATIVE_API_URL}/api/bits`)
    .then(res => res.json())
    .then(res => res.bits)
    .then(bits => decryptText(bits))
}

export function IsJsonString(str: string): any {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
}

async function getSalt(email) {
  const response = await fetch(`${process.env.REACT_NATIVE_API_URL}/api/login`, {
    method: 'post',
    headers: await getHeaders(),
    body: JSON.stringify({ email })
  });
  const data = await response.json();
  const salt = decryptText(data.sKey);

  return salt;
}

export async function doChangePassword(params: ChangePasswordParam): Promise<any> {
  const xUser = await getLyticsData()
  const salt = await getSalt(xUser.email);

  if (!salt) {
    throw new Error('Internal serverr error. Please try later.')
  }
  const hashedCurrentPassword = passToHash({ password: params.password, salt }).hash;
  const encCurrentPass = encryptText(hashedCurrentPassword);

  const hashedNewPassword = passToHash({ password: params.newPassword });
  const encNewPass = encryptText(hashedNewPassword.hash)
  const encryptedNewSalt = encryptText(hashedNewPassword.salt)

  const encryptedMnemonic = encryptTextWithKey(xUser.mnemonic, params.newPassword);
  const privateKey = Buffer.from(xUser.privateKey, 'base64').toString();
  const privateKeyEncrypted = 'AesUtils.encrypt(privateKey, newPassword)';
  // const encSalt = encryptText(hashedCurrentPassword.salt);
  // const mnemonic = await getNewBits()
  // const encMnemonic = encryptTextWithKey(mnemonic, params.password);

  return fetch(`${process.env.REACT_NATIVE_API_URL}/api/user/password`, {
    method: 'PATCH',
    headers: await getHeaders(),
    body: JSON.stringify({
      currentPassword: encCurrentPass,
      newPassword: encNewPass,
      encSalt: encryptedNewSalt,
      mnemonic: encryptedMnemonic,
      privateKey: privateKeyEncrypted
    })
  }).then(async res => {
    if (res.status === 200) {
      return res.json()
    } else {
      const body = await res.text()
      const json = IsJsonString(body)

      if (json) {
        throw Error(json.message)
      } else {
        throw Error(body)
      }
    }
  })
}
