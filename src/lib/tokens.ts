import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const ACCESS_KEY = 'tuktuk_access_token';
const REFRESH_KEY = 'tuktuk_refresh_token';

export type TokenPair = { accessToken: string; refreshToken: string };

let cached: { access?: string | null; refresh?: string | null } = {};

export async function loadTokens(): Promise<TokenPair | null> {
  // SecureStore is native-only. Web credentials stay in memory, never localStorage.
  if (Platform.OS === 'web') {
    return cached.access && cached.refresh
      ? { accessToken: cached.access, refreshToken: cached.refresh }
      : null;
  }
  const [access, refresh] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_KEY),
    SecureStore.getItemAsync(REFRESH_KEY),
  ]);
  cached = { access, refresh };
  if (access && refresh) return { accessToken: access, refreshToken: refresh };
  return null;
}

export function getCachedAccessToken(): string | null {
  return cached.access ?? null;
}

export function getCachedRefreshToken(): string | null {
  return cached.refresh ?? null;
}

export async function saveTokens(pair: TokenPair): Promise<void> {
  if (Platform.OS !== 'web') {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_KEY, pair.accessToken),
      SecureStore.setItemAsync(REFRESH_KEY, pair.refreshToken),
    ]);
  }
  cached = { access: pair.accessToken, refresh: pair.refreshToken };
}

export async function clearTokens(): Promise<void> {
  cached = { access: null, refresh: null };
  if (Platform.OS === 'web') return;
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
  ]);
}
