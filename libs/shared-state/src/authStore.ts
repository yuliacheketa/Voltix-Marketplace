import type { AuthUser } from "@voltix/api-client";
import { getMeAuth, getAuthToken, setAuthToken } from "@voltix/api-client";
import { createStore } from "zustand/vanilla";

export type AuthState = {
  user: AuthUser | null;
  hydrated: boolean;
  setSession: (user: AuthUser, token: string) => void;
  clearSession: () => void;
  hydrate: () => Promise<void>;
};

export const authStore = createStore<AuthState>()((set) => ({
  user: null,
  hydrated: false,
  setSession: (user, token) => {
    setAuthToken(token);
    set({ user, hydrated: true });
  },
  clearSession: () => {
    setAuthToken(null);
    set({ user: null, hydrated: true });
  },
  hydrate: async () => {
    const token = getAuthToken();
    if (!token) {
      set({ user: null, hydrated: true });
      return;
    }
    try {
      const { user } = await getMeAuth();
      set({ user, hydrated: true });
    } catch {
      setAuthToken(null);
      set({ user: null, hydrated: true });
    }
  },
}));
