"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { AlertTriangle, RefreshCw, Home, Phone, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundaryPage({ error, reset }: ErrorProps) {
  const { t } = useTranslation();

  useEffect(() => {
    // Log the error to console or any error monitoring service (e.g. Sentry)
    console.error("Unhandled runtime error captured by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-between font-sans transition-colors duration-normal">
      
      {/* Minimal Header (Logo only to prevent render crash loop if components crash) */}
      <header className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-4 shadow-sm select-none">
        <div className="max-w-7xl mx-auto px-4 flex justify-center sm:justify-start">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-xl font-bold font-heading tracking-wide text-primary-700 dark:text-primary-400">
              Aether Organic<span className="text-secondary-400">.</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content Card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-feature p-8 sm:p-10 shadow-md text-center space-y-6">
          
          {/* Error Icon */}
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <AlertTriangle className="w-8 h-8" />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black font-heading text-neutral-905 dark:text-white uppercase tracking-tight">
              {t("error.title", "Something went wrong 😔")}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-neutral-500 leading-relaxed">
              {t(
                "error.description",
                "Our servers are taking a short break. We're working to fix this quickly!"
              )}
            </p>
            {error.digest && (
              <p className="text-[10px] text-neutral-400 font-bold select-all">
                Digest Code: {error.digest}
              </p>
            )}
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest pt-1 select-none">
              Error Code: 500
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="primary"
              onClick={reset}
              className="flex-1 font-bold text-xs py-3"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              {t("error.try_again", "Try Again")}
            </Button>
            <Link href="/" className="flex-1">
              <Button
                variant="secondary"
                className="w-full font-bold text-xs py-3 bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-750"
                leftIcon={<Home className="w-4 h-4" />}
              >
                {t("error.go_home", "Go to Home")}
              </Button>
            </Link>
          </div>

          {/* Customer support help */}
          <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-card border border-neutral-100 dark:border-neutral-850 space-y-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 text-left">
            <p className="font-bold text-neutral-800 dark:text-neutral-350 flex items-center gap-1.5 mb-1.5 select-none">
              <HelpCircle className="w-4.5 h-4.5 text-primary-500" />
              If the problem persists:
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-neutral-400" />
              <span>Call: +91-98765-43210</span>
            </p>
            <p className="flex items-center gap-2">
              {/* WhatsApp icon helper */}
              <svg className="w-4 h-4 fill-neutral-400" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.464L0 24zm6.066-4.747c1.658.985 3.284 1.487 4.965 1.488 5.485 0 9.948-4.461 9.95-9.95.002-2.66-1.033-5.161-2.909-7.039C16.248 1.874 13.748 1.83 11.08 1.83c-5.49 0-9.953 4.462-9.955 9.952-.001 1.84.503 3.635 1.47 5.257L1.584 21.09l4.539-1.837z" />
              </svg>
              <span>WhatsApp: +91-98765-43210</span>
            </p>
          </div>

        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full py-4 text-center text-[10px] text-neutral-400 border-t border-neutral-100 dark:border-neutral-850 select-none bg-white dark:bg-neutral-900">
        &copy; {new Date().getFullYear()} Aether Organic. All rights reserved.
      </footer>

    </div>
  );
}
