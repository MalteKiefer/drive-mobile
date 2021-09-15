import { getHeaders } from '../../helpers/headers'
import { isJsonString } from '../Register/registerUtils'

interface LoginResponse {
  tfa: string
  sKey: string
}

export async function apiLogin(email: string): Promise<LoginResponse> {
  return fetch(`${process.env.REACT_NATIVE_API_URL}/api/login`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({ email: email })
  }).then(async res => {
    const data = await res.text()
    const json = isJsonString(data)

    if (res.status === 200) {
      return json
    } else {
      if (json) {
        throw Error(json.error)
      } else {
        throw Error(data)
      }
    }
  })
}

export function validateEmail(email: string): boolean {
  const emailPattern = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

  return emailPattern.test(email);
}

export function validate2FA(code: string): boolean {
  return /^[0-9]{6}$/.test(code);
}

export function checkPasswordStrength(password: string): boolean {
  return password.length >= 5;
}