import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 4001;

function devMachineHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  return hostUri ? hostUri.split(':')[0] : null;
}

function defaultUrl(): string {
  if (Platform.OS === 'web') return `http://localhost:${API_PORT}/`;
  const host = devMachineHost();
  if (host) return `http://${host}:${API_PORT}/`;
  return `http://10.0.2.2:${API_PORT}/`;
}

export const GRAPHQL_URL = process.env.EXPO_PUBLIC_GRAPHQL_URL || defaultUrl();
