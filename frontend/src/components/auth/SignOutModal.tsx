"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { apiClient } from "@/services/api-client";
import { toast } from "@/components/ui/Toast";
import { usePathname, useRouter } from "next/navigation";

interface SignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SignOutModal: React.FC<SignOutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuthStore();

  const handleConfirmLogout = async () => {
    setIsLoading(true);
    try {
      // Call backend to invalidate refresh token session
      await apiClient.post("/auth/logout").catch(() => {});
    } finally {
      // Clean up client storage & cookies
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("admin_access_token");
        document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
      }

      // Reset client store
      logout();
      setIsLoading(false);
      onClose();
      toast.success("You have been signed out successfully.");

      if (onSuccess) {
        onSuccess();
      }

      // If user is inside /account or /admin, redirect to homepage
      if (pathname?.startsWith("/account") || pathname?.startsWith("/admin")) {
        router.replace("/");
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-neutral-900 rounded-feature border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 w-full max-w-sm text-center"
          >
            <div className="w-12 h-12 bg-red-500/10 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-heading font-black text-neutral-900 dark:text-white">
              Sign Out Confirmation
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
              Are you sure you want to sign out of your account? You can sign back in anytime to access your saved wishlist, addresses, and orders.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-2.5 border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs font-bold text-neutral-700 dark:text-neutral-300 rounded-card hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={isLoading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-xs font-bold text-white rounded-card cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isLoading && (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Yes, Sign Out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
