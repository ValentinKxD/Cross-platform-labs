import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'postproject-token';

let token: string | null = null;

export function getToken(): string | null {
  return token;
}

export async function loadToken(): Promise<string | null> {
  try {
    token = await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    token = null;
  }
  return token;
}

export async function saveToken(value: string, remember: boolean) {
  token = value;
  try {
    if (remember) await AsyncStorage.setItem(TOKEN_KEY, value);
    else await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {
    return;
  }
}

export async function clearToken() {
  token = null;
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch {
    return;
  }
}
