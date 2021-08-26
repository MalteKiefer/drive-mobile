import Toast from 'react-native-toast-message'

export interface custumToastParam {
  text: string,
  type: 'error' | 'success' | 'warn',
  visibilityTime?: number
}

export function notify(params: custumToastParam) {
  Toast.show({
    type: params.type,
    position: 'bottom',
    text1: params.text,
    visibilityTime: params.visibilityTime ? params.visibilityTime : 5000,
    autoHide: true,
    bottomOffset: 100
  })
}