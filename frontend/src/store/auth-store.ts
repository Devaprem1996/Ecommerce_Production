import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id: string;
  name?: string;
  mobile?: string;
  email: string | null;
  avatar?: string | null;
  role: "customer" | "admin" | "CUSTOMER" | "ADMIN";
  language?: "en" | "ta";
  isVerified?: boolean;
  createdAt?: string;
  firstName?: string; // Legacy support
  lastName?: string;  // Legacy support
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isAuthenticated: boolean; // Backward compatibility
  isLoading: boolean;
  role: "guest" | "customer" | "admin";
  token: string | null; // In-memory access token (not persisted)
  login: (user: User, token: string) => void;
  setAuth: (user: User, token: string) => void; // Backward compatibility
  logout: () => void;
  clearAuth: () => void; // Backward compatibility
  updateProfile: (updates: Partial<Omit<User, "id" | "role" | "createdAt">>) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      isAuthenticated: false,
      isLoading: false,
      role: "guest",
      token: null,
      login: (user, token) => {
        // Expose token in-memory or on window for standard interceptors
        if (typeof window !== "undefined") {
          (window as any).__accessToken = token;
        }
        const normalizedRole = (user.role.toLowerCase() === 'admin' ? 'admin' : 'customer') as 'customer' | 'admin';
        set({ user, isLoggedIn: true, isAuthenticated: true, role: normalizedRole, token, isLoading: false });
      },
      setAuth: (user, token) => {
        if (typeof window !== "undefined") {
          (window as any).__accessToken = token;
        }
        const normalizedRole = (user.role.toLowerCase() === 'admin' ? 'admin' : 'customer') as 'customer' | 'admin';
        set({ user, isLoggedIn: true, isAuthenticated: true, role: normalizedRole, token, isLoading: false });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          delete (window as any).__accessToken;
        }
        set({ user: null, isLoggedIn: false, isAuthenticated: false, role: "guest", token: null, isLoading: false });
      },
      clearAuth: () => {
        if (typeof window !== "undefined") {
          delete (window as any).__accessToken;
        }
        set({ user: null, isLoggedIn: false, isAuthenticated: false, role: "guest", token: null, isLoading: false });
      },
      updateProfile: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "aether-auth-storage",
      storage: createJSONStorage(() => localStorage),
      // Partialize to only save safe user meta, never the raw access token
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
      }),
    }
  )
);
