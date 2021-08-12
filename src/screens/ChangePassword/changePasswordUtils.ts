import { decryptText, encryptText, encryptTextWithKey, passToHash, getLyticsData } from '../../helpers';
import { getHeaders } from '../../helpers/headers';
import { isJsonString } from '../Register/registerUtils';
import AesUtils from '../../helpers/aesUtils'
interface ChangePasswordParam {
  password: string
  newPassword: string
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
  const privateKeyEncrypted = AesUtils.encrypt(privateKey, params.newPassword);
  // const encSalt = encryptText(hashedCurrentPassword.salt);
  // const mnemonic = await getNewBits()
  // const encMnemonic = encryptTextWithKey(mnemonic, params.password);

  return fetch(`${process.env.REACT_NATIVE_API_URL}/api/user/password`, {
    method: 'PATCH',
    headers: await getHeaders(),
    body: JSON.stringify({
      currentPassword: encCurrentPass,
      newPassword: encNewPass,
      newSalt: encryptedNewSalt,
      mnemonic: encryptedMnemonic,
      privateKey: privateKeyEncrypted
    })
  }).then(async res => {
    if (res.status === 200) {
      return res.json()
    } else {
      const body = await res.text()
      const json = isJsonString(body)

      if (json) {
        throw Error(json.error)
      } else {
        throw Error(body)
      }
    }
  })
}
