import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useCartStore } from "@/store/cartStore";

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
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isAuthenticated: false,
      isLoading: false,
      role: "guest",
      token: null,
      login: (user, token) => {
        if (typeof window !== "undefined") {
          (window as any).__accessToken = token;
          try {
            localStorage.setItem("access_token", token);
            document.cookie = `access_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          } catch (e) {
            console.error("Failed to persist token to storage:", e);
          }
        }

        // If logging into a different account than previously cached user, clear cart, wishlist, orders, and recent items
        const currentUser = get().user;
        if (currentUser && currentUser.id && user?.id && currentUser.id !== user.id) {
          try {
            useCartStore.getState().clearCart();
            if (typeof window !== "undefined") {
              localStorage.removeItem("yathu-cart-storage");
              localStorage.removeItem("yathu-wishlist-storage");
              localStorage.removeItem("user_orders");
              localStorage.removeItem("yathu_recently_viewed_ids");
            }
          } catch (e) {
            console.error("Failed to clear previous user cart and data:", e);
          }
        }

        const roleStr = user?.role || "customer";
        const normalizedRole = (roleStr.toLowerCase() === "admin" ? "admin" : "customer") as "customer" | "admin";
        set({ user, isLoggedIn: true, isAuthenticated: true, role: normalizedRole, token, isLoading: false });
      },
      setAuth: (user, token) => {
        get().login(user, token);
      },
      logout: () => {
        if (typeof window !== "undefined") {
          delete (window as any).__accessToken;
          try {
            localStorage.removeItem("access_token");
            localStorage.removeItem("admin_access_token");
            localStorage.removeItem("admin_logged_in");
            localStorage.removeItem("yathu-cart-storage");
            localStorage.removeItem("yathu-wishlist-storage");
            localStorage.removeItem("user_orders");
            localStorage.removeItem("yathu_recently_viewed_ids");
            document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
            document.cookie = "admin_access_token=; path=/; max-age=0; SameSite=Lax";
            document.cookie = "pending_otp_mobile=; path=/; max-age=0; SameSite=Lax";
            document.cookie = "refresh_token=; path=/api/auth/refresh; max-age=0; SameSite=Strict";
            document.cookie = "refreshToken=; path=/api/v1/auth/refresh; max-age=0; SameSite=Strict";
            document.cookie = "refreshToken=; path=/; max-age=0; SameSite=Strict";
          } catch (e) {
            console.error("Failed to clear storage:", e);
          }
        }

        // Always clean up cart on logout so the next user or guest does not see previous account's items
        try {
          useCartStore.getState().clearCart();
        } catch (e) {
          console.error("Failed to clear cart store:", e);
        }

        // Clean up wishlist on logout
        if (typeof window !== "undefined") {
          import("@/hooks/useWishlist")
            .then(({ useWishlist }) => {
              useWishlist.getState().setItems([]);
            })
            .catch(() => {});
        }

        set({ user: null, isLoggedIn: false, isAuthenticated: false, role: "guest", token: null, isLoading: false });
      },
      clearAuth: () => {
        get().logout();
      },
      updateProfile: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "yathu-auth-storage",
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
