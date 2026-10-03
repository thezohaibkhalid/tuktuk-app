import { API_BASE_URL } from '@/lib/env';
import { Platform } from 'react-native';
import {
  clearTokens,
  getCachedAccessToken,
  getCachedRefreshToken,
  saveTokens,
} from '@/lib/tokens';

export type ApiErrorEnvelope = {
  code?: string;
  message?: string;
  requestId?: string;
  fields?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;
  path: string;
  code?: string;
  fields?: Record<string, string>;

  constructor(
    status: number,
    path: string,
    envelope?: ApiErrorEnvelope,
  ) {
    super(envelope?.message ?? `API error ${status}: ${path}`);
    this.status = status;
    this.path = path;
    this.code = envelope?.code;
    this.fields = envelope?.fields;
  }
}

type FetchOptions = RequestInit & {
  // Skip Authorization header even if token is present.
  anonymous?: boolean;
  // Skip the on-401 refresh attempt. Set when calling /auth/refresh itself
  // (and from inside the retry) to avoid recursion.
  skipRefresh?: boolean;
};

// Refresh requests are coalesced: if many in-flight calls 401 simultaneously,
// they share one refresh call.
let refreshInFlight: Promise<boolean> | null = null;
// Listener invoked when refresh fails — the auth store wires this up so it can
// reactively bounce the user to the login screen without auth.ts importing the store.
let onUnauthenticated: (() => void) | null = null;
export function setUnauthenticatedHandler(fn: (() => void) | null) {
  onUnauthenticated = fn;
}

async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  const refresh = getCachedRefreshToken();
  if (!refresh) return false;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          // Backend reads refresh_token from cookies; mobile has no cookie
          // jar by default, so we set the header explicitly.
          ...(Platform.OS !== 'web' ? { Cookie: `refresh_token=${refresh}` } : {}),
        },
      });
      if (!res.ok) return false;
      const json = await res.json().catch(() => null);
      const data = json?.data ?? json;
      if (!data?.accessToken || !data?.refreshToken) return false;
      await saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { anonymous, skipRefresh, headers, ...rest } = options;
  const url = `${API_BASE_URL}${path}`;
  const access = !anonymous ? getCachedAccessToken() : null;

  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string> | undefined),
  };
  if (access) baseHeaders.Authorization = `Bearer ${access}`;
  const refresh = !anonymous ? getCachedRefreshToken() : null;
  if (refresh && Platform.OS !== 'web' && path === '/auth/logout') {
    baseHeaders.Cookie = `refresh_token=${refresh}`;
  }

  const res = await fetch(url, { credentials: 'include', ...rest, headers: baseHeaders });

  if (res.status === 401 && !anonymous && !skipRefresh && getCachedRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiFetch<T>(path, { ...options, skipRefresh: true });
    }
    await clearTokens();
    onUnauthenticated?.();
  }

  if (res.status === 204) return null as T;

  if (!res.ok) {
    let envelope: ApiErrorEnvelope | undefined;
    try {
      const json = await res.json();
      envelope = json?.error ?? undefined;
    } catch {
      // body was not JSON — leave envelope undefined
    }
    throw new ApiError(res.status, path, envelope);
  }

  const json = await res.json().catch(() => null);
  return (json?.data ?? json) as T;
}
