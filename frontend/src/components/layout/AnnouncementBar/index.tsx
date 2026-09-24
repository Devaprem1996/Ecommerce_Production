"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { AnnouncementBarProps } from './AnnouncementBar.types';
import { X, Phone, Globe, Sparkles, Truck, ShieldCheck, Zap } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const announcementMessages = [
  {
    icon: Truck,
    badgeEn: 'Free Delivery',
    badgeTa: 'இலவச விநியோகம்',
    badgeColor: 'bg-emerald-500',
    textEn: 'Free Express Farm Delivery across South India on all orders above ₹499',
    textTa: '₹499க்கு மேல் தமிழ்நாடெங்கும் அதிவிரைவு இலவச டெலிவரி',
  },
  {
    icon: ShieldCheck,
    badgeEn: '100% Pure',
    badgeTa: '100% தூய்மை',
    badgeColor: 'bg-amber-500',
    textEn: 'Traditional Vaagai Wood-Pressed Oils • 0% Chemicals • Lab Tested',
    textTa: 'மரச்செக்கு நல்லெண்ணெய், தேங்காய் & கடலை எண்ணெய் • ரசாயனமற்றது',
  },
  {
    icon: Zap,
    badgeEn: 'Direct Farm',
    badgeTa: 'நேரடி பண்ணை',
    badgeColor: 'bg-teal-500',
    textEn: 'Fresh Harvest Dispatched within 24 Hours from Pollachi & Erode',
    textTa: 'பொள்ளாச்சி & ஈரோடு பண்ணையிலிருந்து 24 மணி நேரத்தில் நேரடி விநியோகம்',
  },
];

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ className }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('announcement-dismissed');
    if (isDismissed !== 'true') {
      setIsVisible(true);
    }
  }, []);

  // Auto-cycle announcements every 5 seconds
  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % announcementMessages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isVisible]);

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

  const activeMsg = announcementMessages[currentIdx];
  const IconComponent = activeMsg.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className={twMerge(
            clsx(
              'w-full bg-gradient-to-r from-emerald-950 via-neutral-900 to-teal-950 text-white flex items-center justify-between px-3 sm:px-6 relative overflow-hidden font-sans border-b border-white/10 z-[1030] select-none text-[11px] sm:text-xs py-1.5',
            ),
            className
          )}
        >
          {/* Ambient micro-glow line */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent pointer-events-none animate-pulse" />

          {/* Left: Farm Purity Badge */}
          <div className="hidden lg:flex items-center gap-2 text-emerald-300 font-semibold shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{currentLang === 'ta' ? '100% தூய மரச்செக்கு & இயற்கை உணவு' : '100% Traditional Vaagai Wood-Pressed • Lab Tested'}</span>
          </div>

          {/* Center: Dynamic Animated Rotating Ticker */}
          <div className="flex-1 flex items-center justify-center overflow-hidden px-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 text-center font-medium"
              >
                <span className={clsx("inline-flex items-center gap-1 font-black text-[9px] sm:text-[10px] text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs shrink-0", activeMsg.badgeColor)}>
                  <IconComponent className="w-3 h-3" />
                  <span>{currentLang === 'ta' ? activeMsg.badgeTa : activeMsg.badgeEn}</span>
                </span>
                <span className="text-neutral-200 text-xs truncate max-w-[280px] sm:max-w-md lg:max-w-xl">
                  {currentLang === 'ta' ? activeMsg.textTa : activeMsg.textEn}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Phone Hotline, Direct Language Switcher & Dismiss */}
          <div className="flex items-center gap-3 sm:gap-4 text-neutral-300 shrink-0">
            <a
              href="tel:+918870159766"
              className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold hover:text-amber-300 transition-colors"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>+91 88701 59766</span>
            </a>

            {/* Language Pill Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-all cursor-pointer border border-white/15"
              aria-label="Toggle language"
            >
              <Globe className="w-3 h-3 text-amber-400" />
              <span>{i18n.language === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="text-white/70 hover:text-white p-0.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              aria-label="Dismiss announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

AnnouncementBar.displayName = 'AnnouncementBar';
