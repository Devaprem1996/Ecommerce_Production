"use client";

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { WhatsAppFloatProps } from './WhatsAppFloat.types';
import { MessageSquare } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const WhatsAppFloat: React.FC<WhatsAppFloatProps> = ({
  phoneNumber = '919876543210',
  message = 'Hi Aether! I want to know more about organic farm products.',
  className,
}) => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [showTooltip, setShowTooltip] = useState(false);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const encodedMsg = encodeURIComponent(message);
  const waUrl = `https://wa.me/${phoneNumber}?text=${encodedMsg}`;

  return (
    <div
      className={twMerge(
        clsx(
          'fixed z-[990] flex items-center justify-end pointer-events-none',
          // Adjust vertical space for MobileBottomNav
          'bottom-24 sm:bottom-8 right-4 sm:right-8'
        ),
        className
      )}
    >
      <div className="relative flex items-center justify-end pointer-events-auto">
        {/* Tooltip Popup */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.85, x: 10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-16 bg-neutral-900 text-white text-xs font-semibold px-3.5 py-2 rounded-card shadow-xl whitespace-nowrap hidden sm:block pointer-events-none select-none border border-neutral-800"
            >
              {t('contact.chat_with_us', 'Chat with us')}
              <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-neutral-900 rotate-45 border-r border-t border-neutral-800" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse Background Ring */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 bg-[#25D366] rounded-full"
        />

        {/* Floating Button */}
        <motion.a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="relative w-12 sm:w-14 h-12 sm:h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-colors border border-[#25D366]/20 focus:outline-none"
          aria-label="Contact us on WhatsApp"
        >
          {/* Custom SVG WhatsApp Logo or Lucide fallback */}
          <svg
            className="w-6 sm:w-7 h-6 sm:h-7 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 11.968.01c3.182.001 6.176 1.24 8.426 3.493 2.25 2.253 3.486 5.251 3.484 8.437-.004 6.62-5.34 11.958-11.91 11.958-2.004-.001-3.973-.507-5.729-1.472L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.435-.002 9.851-4.417 9.854-9.853.002-2.634-1.02-5.11-2.881-6.974-1.86-1.863-4.329-2.887-6.969-2.889-5.438 0-9.854 4.417-9.857 9.856-.001 1.516.398 2.996 1.157 4.3l.254.438-1.01 3.682 3.766-.988.427.253zM16.57 13.66c-.269-.135-1.595-.788-1.844-.878-.25-.09-.431-.136-.613.135-.18.272-.7.879-.858 1.06-.16.182-.318.204-.587.069-.27-.136-1.135-.418-2.16-1.334-.798-.713-1.338-1.594-1.495-1.867-.158-.272-.017-.42.119-.555.122-.121.27-.317.405-.476.136-.159.18-.272.271-.454.09-.182.046-.341-.022-.477-.068-.136-.613-1.477-.84-2.022-.22-.53-.443-.457-.613-.466-.16-.008-.34-.01-.52-.01-.18 0-.477.067-.726.34-.25.272-.953.931-.953 2.27 0 1.338.975 2.628 1.11 2.81 1.132 1.503 2.186 2.314 3.719 2.894 1.252.474 2.133.407 2.937.287.896-.135 1.595-.552 1.815-1.058.22-.507.22-.942.155-1.033-.065-.09-.239-.136-.508-.272z" />
          </svg>
        </motion.a>
      </div>
    </div>
  );
};

WhatsAppFloat.displayName = 'WhatsAppFloat';
