import { Alert, Platform } from 'react-native';

export interface DialogButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export interface Dialog {
  title: string;
  message: string;
  buttons: DialogButton[];
}

let webListener: ((dialog: Dialog) => void) | null = null;

export function setWebDialogListener(listener: ((dialog: Dialog) => void) | null) {
  webListener = listener;
}

function show(dialog: Dialog) {
  if (Platform.OS !== 'web') {
    Alert.alert(dialog.title, dialog.message, dialog.buttons);
    return;
  }
  if (webListener) {
    webListener(dialog);
    return;
  }
  const text = `${dialog.title}\n\n${dialog.message}`;
  if (dialog.buttons.length > 1) {
    if (globalThis.confirm?.(text)) dialog.buttons[dialog.buttons.length - 1].onPress?.();
  } else {
    globalThis.alert?.(text);
  }
}

export function notify(title: string, message: string) {
  show({ title, message, buttons: [{ text: 'OK' }] });
}

export function confirmAction(title: string, message: string, confirmText: string, onConfirm: () => void) {
  show({
    title,
    message,
    buttons: [
      { text: 'Скасувати', style: 'cancel' },
      { text: confirmText, style: 'destructive', onPress: onConfirm },
    ],
  });
}
