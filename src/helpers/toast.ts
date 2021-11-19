import Toast from 'react-native-toast-message';

export interface custumToastParam {
  text: string;
  type: 'error' | 'success' | 'warn';
}

export function notify(params: custumToastParam) {
  Toast.show({
    type: params.type,
    position: 'top',
    text1: params.text,
    visibilityTime: 5000,
    autoHide: true,
    topOffset: 48,
  });
}
