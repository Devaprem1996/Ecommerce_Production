"use client";

import React from 'react';
import { toast as sonnerToast, Toaster as SonnerToaster } from 'sonner';
import { ToastType, ToastOptions } from './Toast.types';
import { CheckCircle2, AlertTriangle, XCircle, Info, ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Wrapper object for toast helpers
export const toast = {
  success: (message: string, options?: ToastOptions) => {
    sonnerToast.custom(
      (tId) => (
        <div className="flex items-start gap-3 w-full max-w-sm bg-white dark:bg-neutral-900 border border-success/20 shadow-2xl p-4 rounded-feature font-sans text-neutral-900 dark:text-neutral-100">
          <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col gap-0.5">
            <span className="font-semibold text-sm leading-tight">{message}</span>
            {options?.description && (
              <span className="text-xs text-neutral-600 dark:text-neutral-400">{options.description}</span>
            )}
          </div>
        </div>
      ),
      { duration: options?.duration || 3000 }
    );
  },

  error: (message: string, options?: ToastOptions) => {
    sonnerToast.custom(
      (tId) => (
        <div className="flex items-start gap-3 w-full max-w-sm bg-white dark:bg-neutral-900 border border-error/20 shadow-2xl p-4 rounded-feature font-sans text-neutral-900 dark:text-neutral-100 animate-shake">
          <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col gap-0.5">
            <span className="font-semibold text-sm leading-tight">{message}</span>
            {options?.description && (
              <span className="text-xs text-neutral-600 dark:text-neutral-400">{options.description}</span>
            )}
          </div>
        </div>
      ),
      { duration: options?.duration || 4000 }
    );
  },

  warning: (message: string, options?: ToastOptions) => {
    sonnerToast.custom(
      (tId) => (
        <div className="flex items-start gap-3 w-full max-w-sm bg-white dark:bg-neutral-900 border border-warning/20 shadow-2xl p-4 rounded-feature font-sans text-neutral-900 dark:text-neutral-100">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col gap-0.5">
            <span className="font-semibold text-sm leading-tight">{message}</span>
            {options?.description && (
              <span className="text-xs text-neutral-600 dark:text-neutral-400">{options.description}</span>
            )}
          </div>
        </div>
      ),
      { duration: options?.duration || 3000 }
    );
  },

  info: (message: string, options?: ToastOptions) => {
    sonnerToast.custom(
      (tId) => (
        <div className="flex items-start gap-3 w-full max-w-sm bg-white dark:bg-neutral-900 border border-info/20 shadow-2xl p-4 rounded-feature font-sans text-neutral-900 dark:text-neutral-100">
          <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col gap-0.5">
            <span className="font-semibold text-sm leading-tight">{message}</span>
            {options?.description && (
              <span className="text-xs text-neutral-600 dark:text-neutral-400">{options.description}</span>
            )}
          </div>
        </div>
      ),
      { duration: options?.duration || 3000 }
    );
  },

  // Cart Add notification with product details and localization
  cart: (productName: string, options?: ToastOptions) => {
    sonnerToast.custom(
      (tId) => (
        <div className="flex items-start gap-3.5 w-full max-w-sm bg-white dark:bg-neutral-900 border border-primary-500/20 shadow-2xl p-4 rounded-feature font-sans text-neutral-900 dark:text-neutral-100">
          <div className="bg-primary-500/10 p-2 rounded-card text-primary-500 flex-shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="flex-1 flex flex-col gap-0.5">
            <span className="font-semibold text-sm leading-tight text-primary-700 dark:text-primary-400">
              Added to Cart!
            </span>
            <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium line-clamp-1">
              {productName}
            </span>
            {options?.description && (
              <span className="text-xs text-neutral-600 dark:text-neutral-400">{options.description}</span>
            )}
          </div>
        </div>
      ),
      { duration: options?.duration || 3000 }
    );
  },
};

// Re-export the Toaster component pre-configured
export const Toaster: React.FC = () => {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        unstyled: true,
      }}
    />
  );
};
