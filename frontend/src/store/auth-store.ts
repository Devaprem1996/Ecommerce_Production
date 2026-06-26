import { create } from "zustand";

export interface UserState {
  id: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  firstName?: string;
  lastName?: string;
}

interface AuthStore {
  user: UserState | null;
  isAuthenticated: boolean;
  setAuth: (user: UserState, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  setAuth: (user, token) => {
    // Keep access token in browser window memory to prevent storage leakage
    if (typeof window !== "undefined") {
      (window as any).__accessToken = token;
    }
    set({ user, isAuthenticated: true });
  },
  clearAuth: () => {
    if (typeof window !== "undefined") {
      delete (window as any).__accessToken;
    }
    set({ user: null, isAuthenticated: false });
  },
}));
