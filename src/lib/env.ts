import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Override per-environment by editing app.json's `extra.apiUrl`,
// or by setting EXPO_PUBLIC_API_URL in a .env file (Expo auto-injects).
//
// Note on `localhost`:
//   - iOS simulator: localhost works.
//   - Android emulator: use 10.0.2.2 instead.
//   - Physical device: use your machine's LAN IP (e.g. http://192.168.1.42:8080/v1).
const fromConfig =
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;
const fromEnv = process.env.EXPO_PUBLIC_API_URL;

const defaultHost =
  Platform.OS === 'android' ? 'http://10.0.2.2:8080/v1' : 'http://localhost:8080/v1';

export const API_BASE_URL: string = fromEnv ?? fromConfig ?? defaultHost;
