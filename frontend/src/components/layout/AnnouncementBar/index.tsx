"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { AnnouncementBarProps } from './AnnouncementBar.types';
import { X, Phone, Globe } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ className }) => {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem('announcement-dismissed');
    if (isDismissed !== 'true') {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('announcement-dismissed', 'true');
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ta' : 'en';
    i18n.changeLanguage(nextLang);
  };

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: 'auto',
            opacity: 1,
          }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className={twMerge(
            clsx(
              'w-full bg-primary-700 text-white flex items-center justify-between px-4 sm:px-6 relative overflow-hidden font-sans border-b border-primary-500/10 z-50 select-none',
              // h-8 (32px) on mobile, h-9 (36px) on desktop
              'h-8 sm:h-9'
            ),
            className
          )}
        >
          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center sm:justify-between text-xs sm:text-sm font-medium tracking-wide">
            {/* Offer Text */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[10px] sm:text-xs bg-primary-500 text-white px-2 py-0.5 rounded-full uppercase leading-none">
                {t('badge.new', 'Offer')}
              </span>
              <span className="truncate max-w-[260px] sm:max-w-none">
                {t('announcement.text', 'Free Delivery on ₹499+')}
              </span>
            </div>

            {/* Right Side: Phone & Language */}
            <div className="hidden sm:flex items-center gap-6">
              <a
                href="tel:+919876543210"
                className="flex items-center gap-1.5 hover:text-primary-300 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>+91-98765-43210</span>
              </a>

              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 hover:text-primary-300 transition-colors cursor-pointer"
                aria-label="Toggle language"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="font-semibold text-xs tracking-wider">
                  {i18n.language === 'en' ? 'தமிழ்' : 'ENGLISH'}
                </span>
              </button>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="text-white/80 hover:text-white p-1 ml-3 hover:bg-white/10 rounded-full transition-colors cursor-pointer min-w-[24px] min-h-[24px] flex items-center justify-center"
            aria-label="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

AnnouncementBar.displayName = 'AnnouncementBar';
