import { decryptText, decryptTextWithKey, deviceStorage, encryptText, passToHash } from '../../helpers';
import { getHeaders } from '../../helpers/headers';
import analytics, { getLyticsData } from '../../helpers/lytics';

export const userService = {
  signin,
  signout,
  payment
};

function signin(email: string, password: string, sKey: string, twoFactorCode: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const salt = decryptText(sKey);
    const hashObj = passToHash({ password, salt });
    const encPass = encryptText(hashObj.hash);

    fetch(`${process.env.REACT_NATIVE_API_URL}/api/access`, {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        email,
        password: encPass,
        tfa: twoFactorCode
      })
    }).then(async response => {
      return { response, data: await response.json() };
    }).then(async response => {

      const body = response.data;

      if (response.response.status === 200) {
        // Manage successfull login
        const user = body.user;

        user.email = email;
        user.mnemonic = user.mnemonic ? decryptTextWithKey(user.mnemonic, password) : null

        if (!user.root_folder_id) {
          const initializeData = await initializeUser(email, user.mnemonic, body.token)

          // eslint-disable-next-line camelcase
          user.root_folder_id = initializeData.user.root_folder_id
          user.bucket = initializeData.user.bucket
        }

        // Store login data
        await deviceStorage.saveItem('xToken', body.token);
        await deviceStorage.saveItem('xUser', JSON.stringify(user));

        resolve({ token: body.token, user });
      } else {
        throw body.error ? body.error : 'Unkown error';
      }
    }).catch(err => {
      reject(err);
    });
  });
}

async function initializeUser(email: string, mnemonic: string, token: string) {
  return fetch(`${process.env.REACT_NATIVE_API_URL}/api/initialize`, {
    method: 'POST',
    headers: await getHeaders(token, mnemonic),
    body: JSON.stringify({
      email: email,
      mnemonic: mnemonic
    })
  }).then(res => {
    if (res.status !== 200) {
      throw Error(res.statusText)
    }
    return res.json()
  })
}

async function signout(): Promise<void> {
  try {
    const userData = await getLyticsData()

    analytics.track('user-signout', { userId: userData.uuid, email: userData.email, platform: 'mobile' }).catch(() => { })
    // Delete login data
    await Promise.all([
      deviceStorage.deleteItem('xToken'),
      deviceStorage.deleteItem('xUser'),
      deviceStorage.deleteItem('xBiometric')
    ]);
  } catch (error) {
  }
}

function payment(token: string, stripePlan: string): Promise<any> {
  return new Promise((resolve, reject) => {
    fetch(`${process.env.REACT_APP_API_URL}/api/buy`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        token: JSON.stringify(token),
        plan: stripePlan
      })
    }).then(async response => {
      const body = await response.json();

      resolve(body.message);
    }).catch(error => {
      reject(error);
    });
  });
}
