export function isValidEmail(email: string): boolean {
  const re = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

  return re.test(String(email).toLowerCase());
}

export function sendDeactivationsEmail(email: string): Promise<any> {
  return fetch(`${process.env.REACT_NATIVE_API_URL}/api/reset/${email}`, {
  }).then(async res => {
    if (res.status !== 200) {
      throw Error();
    }
  })
}
