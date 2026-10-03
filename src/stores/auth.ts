import { create } from 'zustand';

import { clearTokens, loadTokens, saveTokens } from '@/lib/tokens';
import { setUnauthenticatedHandler } from '@/services/api';
import * as authApi from '@/services/auth';
import { type CurrentUser } from '@/services/auth';

import { useCartStore } from './cart';

type AuthState = {
  user: CurrentUser | null;
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string> | null;

  hydrate: () => Promise<void>;
  refreshMe: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  hydrated: false,
  loading: false,
  error: null,
  fieldErrors: null,

  hydrate: async () => {
    try {
      const pair = await loadTokens();
      if (!pair) {
        set({ hydrated: true });
        return;
      }
      const user = await authApi.getMe();
      set({ user, hydrated: true });
    } catch {
      // Token may have expired and refresh failed — clear and stay logged out.
      await clearTokens().catch(() => undefined);
      set({ user: null, hydrated: true });
    }
  },

  refreshMe: async () => {
    try {
      const user = await authApi.getMe();
      set({ user });
    } catch {
      // Leave existing state; the 401-handling path will clear if needed.
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null, fieldErrors: null });
    try {
      const tokens = await authApi.login(email, password);
      await saveTokens(tokens);
      const user = await authApi.getMe();
      set({ user, loading: false });
      return true;
    } catch (e) {
      const err = e as { message?: string; fields?: Record<string, string> };
      set({
        loading: false,
        error: err.message ?? 'Login failed',
        fieldErrors: err.fields ?? null,
      });
      return false;
    }
  },

  register: async (input) => {
    set({ loading: true, error: null, fieldErrors: null });
    try {
      const res = await authApi.register(input);
      await saveTokens({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      });
      const user = await authApi.getMe();
      set({ user, loading: false });
      return true;
    } catch (e) {
      const err = e as { message?: string; fields?: Record<string, string> };
      set({
        loading: false,
        error: err.message ?? 'Registration failed',
        fieldErrors: err.fields ?? null,
      });
      return false;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore — proceed to local clear regardless
    }
    await clearTokens();
    // Cart is intentionally cleared on logout so the next user doesn't inherit.
    useCartStore.getState().clear();
    set({ user: null });
  },
}));

// Wire the API client's 401 fallback to clear local user state. Doing this here
// (rather than in api.ts) keeps api.ts free of store imports.
setUnauthenticatedHandler(() => {
  useAuthStore.setState({ user: null });
});

export const selectIsAuthenticated = (s: AuthState) => !!s.user;
