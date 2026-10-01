"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/services/api-client";

// Helper to decode JWT and check if expired
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;

  return (
    (window as any).__accessToken ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("admin_access_token") ||
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("access_token=") || row.startsWith("admin_access_token="))
      ?.split("=")[1] ||
    null
  );
}

/**
 * AuthSessionSync
 * Ensures that frontend auth state always matches a valid token.
 * Prevents phantom / ghost profile logins across devices or stale localStorages.
 */
export function AuthSessionSync() {
  const { isLoggedIn, role } = useAuthStore();
  const validatingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = getStoredToken();

    // 1. Ghost Session check: If Zustand thinks user is logged in, but there is no token in storage
    if (isLoggedIn && !token) {
      console.warn("[AuthSessionSync] Ghost profile detected with missing access token. Purging session.");
      useAuthStore.getState().logout();
      return;
    }

    // 2. Token Expiration check
    if (isLoggedIn && token && !validatingRef.current) {
      if (isTokenExpired(token)) {
        validatingRef.current = true;
        console.warn("[AuthSessionSync] Token expired. Attempting refresh...");

        apiClient
          .post("/auth/refresh")
          .then((res: any) => {
            const newToken = res?.data?.accessToken || res?.accessToken;
            if (newToken) {
              localStorage.setItem("access_token", newToken);
              (window as any).__accessToken = newToken;
              document.cookie = `access_token=${newToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
              if (res?.data?.user) {
                useAuthStore.getState().updateProfile(res.data.user);
              }
            } else {
              console.warn("[AuthSessionSync] Refresh failed: no token returned. Logging out.");
              useAuthStore.getState().logout();
            }
          })
          .catch(() => {
            console.warn("[AuthSessionSync] Refresh request rejected. Logging out stale session.");
            useAuthStore.getState().logout();
          })
          .finally(() => {
            validatingRef.current = false;
          });
      } else {
        // Ensure in-memory token is always populated
        (window as any).__accessToken = token;
      }
    }
  }, [isLoggedIn, role]);

  // 3. Multi-tab synchronization via storage events
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent) => {
      // If token removed in another tab
      if ((e.key === "access_token" || e.key === "admin_access_token") && !e.newValue) {
        if (useAuthStore.getState().isLoggedIn) {
          useAuthStore.getState().logout();
        }
      }
      // If user storage cleared
      if (e.key === "yathu-auth-storage" && !e.newValue) {
        if (useAuthStore.getState().isLoggedIn) {
          useAuthStore.getState().logout();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return null;
}
