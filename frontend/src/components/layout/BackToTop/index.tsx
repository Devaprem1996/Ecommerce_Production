"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { BackToTopProps } from './BackToTop.types';
import { ChevronUp } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const BackToTop: React.FC<BackToTopProps> = ({ threshold = 300, className }) => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={twMerge(
            clsx(
              'fixed z-[990] w-10 sm:w-12 h-10 sm:h-12 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white rounded-full shadow-lg border border-neutral-100 dark:border-neutral-700 flex items-center justify-center cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-700 focus:outline-none',
              // Stacked safely above WhatsApp float: WhatsApp is bottom-24/bottom-8, BackToTop is bottom-38/bottom-24
              'bottom-38 sm:bottom-24 right-5 sm:right-9'
            ),
            className
          )}
          aria-label={t('contact.back_to_top', 'Back to top')}
        >
          <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

BackToTop.displayName = 'BackToTop';
