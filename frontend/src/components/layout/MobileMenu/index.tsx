"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileMenuProps } from './MobileMenu.types';
import { useCartStore } from '@/store/cartStore';
import { useWishlist } from '@/hooks/useWishlist';
import { 
  X, 
  ChevronDown, 
  User, 
  Heart, 
  ShoppingBag, 
  Truck, 
  Globe, 
  LogOut, 
  ShieldCheck, 
  MessageSquare,
  Sparkles,
  Zap,
  ArrowRight,
  Search,
  Leaf,
  PhoneCall
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/auth-store';
import { SignOutModal } from '@/components/auth/SignOutModal';

const realCategories = [
  { labelEn: 'Traditional Oils', labelTa: 'பாரம்பரிய எண்ணெய்கள்', path: '/shop?category=traditional-oils', icon: '🫒', count: '4 Products' },
  { labelEn: 'Heritage Ancient Rice', labelTa: 'பாரம்பரிய அரிசி', path: '/shop?category=traditional-rices', icon: '🌾', count: '12 Products' },
  { labelEn: 'Natural Sweeteners & Salts', labelTa: 'இயற்கை இனிப்புகள் & உப்பு', path: '/shop?category=natural-sweeteners', icon: '🍯', count: '7 Products' },
  { labelEn: 'Organic Native Millets', labelTa: 'பாரம்பரிய சிறுதானியங்கள்', path: '/shop?category=organic-millets', icon: '🥣', count: '8 Products' },
  { labelEn: 'Organic Pulses & Dals', labelTa: 'இயற்கை பருப்பு வகைகள்', path: '/shop?category=organic-pulses-dals', icon: '🌱', count: '10 Products' },
  { labelEn: 'Traditional Healthy Snacks', labelTa: 'ஆரோக்கிய தின்பண்டங்கள்', path: '/shop?category=traditional-snacks-sweets', icon: '🍘', count: '26 Products' },
  { labelEn: 'Millet Noodles', labelTa: 'சிறுதானிய நூடுல்ஸ்', path: '/shop?category=millet-noodles', icon: '🍜', count: '6 Products' },
  { labelEn: 'Millet Vermicelli', labelTa: 'சிறுதானிய சேமியா', path: '/shop?category=millet-vermicelli', icon: '🥢', count: '5 Products' },
  { labelEn: 'Millet & Rice Flakes', labelTa: 'சிறுதானிய & அரிசி அவல்', path: '/shop?category=millet-rice-flakes', icon: '🥣', count: '5 Products' },
  { labelEn: 'Stone Ground Grain Flours', labelTa: 'தானிய மாவுகள்', path: '/shop?category=healthy-flours', icon: '🌾', count: '2 Products' },
];

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [shopExpanded, setShopExpanded] = useState(true);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const { user, isLoggedIn, role } = useAuthStore();
  const isAdmin = role === 'admin' || user?.role?.toLowerCase() === 'admin';

  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = useWishlist((state) => state.items.length);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en');
  };

  const navLinks = [
    { label: t('nav.home', 'Home'), path: '/' },
    { label: t('nav.shop', 'All Products Catalog'), path: '/shop' },
    { label: t('footer.about', 'Our Farm Story'), path: '/about' },
    { label: t('nav.track_order', 'Track Order Status'), path: '/track-order' },
    { label: t('nav.contact', 'Contact & Farm Support'), path: '/contact' },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-neutral-950/70 backdrop-blur-xs z-[1040]"
              aria-hidden="true"
            />

            {/* Slide-out Menu Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed top-0 left-0 bottom-0 w-[310px] sm:w-[350px] bg-white dark:bg-neutral-900 z-[1050] shadow-2xl flex flex-col font-sans border-r border-neutral-200 dark:border-neutral-800"
            >
              {/* Header / Brand & User Profile Banner */}
              <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-neutral-900 text-white p-5 flex flex-col gap-3 relative shadow-md">
                <button
                  type="button"
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Brand Seal */}
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0">
                    <Leaf className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black font-heading tracking-tight leading-none">
                      {currentLang === 'ta' ? 'யாத்து ஆரோக்கியகம்' : 'YATHU AROKIYAGAM'}
                    </h3>
                    <p className="text-[9px] uppercase tracking-wider text-emerald-300 font-bold mt-0.5">
                      {currentLang === 'ta' ? 'பாரம்பரிய இயற்கை அங்காடி' : 'Traditional Organic Store'}
                    </p>
                  </div>
                </div>

                {/* User Status Bar */}
                <div className="pt-2 border-t border-white/15 flex items-center justify-between">
                  {isLoggedIn && user ? (
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-emerald-200 font-medium">
                          {t('nav.welcome', 'Welcome')},
                        </span>
                        {isAdmin && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-400 text-neutral-950">
                            Admin
                          </span>
                        )}
                      </div>
                      <Link
                        href={isAdmin ? '/admin' : '/account'}
                        onClick={onClose}
                        className="text-xs font-bold text-white hover:underline truncate block"
                      >
                        {user.name || 'Customer'}
                      </Link>
                    </div>
                  ) : (
                    <Link href="/login" onClick={onClose} className="flex flex-col text-left focus:outline-none">
                      <span className="text-[11px] text-emerald-200 font-medium">
                        {currentLang === 'ta' ? 'வணக்கம் வாடிக்கையாளரே' : 'Welcome to Yathu'}
                      </span>
                      <span className="text-xs font-extrabold text-white hover:text-amber-300 transition-colors">
                        {currentLang === 'ta' ? 'உள்நுழைக / பதிவு செய்க →' : 'Login / Register →'}
                      </span>
                    </Link>
                  )}

                  {/* Language switch button */}
                  <div className="inline-flex items-center bg-black/25 p-0.5 rounded-full border border-white/15">
                    <button
                      type="button"
                      onClick={() => i18n.changeLanguage('en')}
                      className={clsx(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer",
                        i18n.language === 'en' ? "bg-white text-emerald-900 shadow-xs" : "text-white/80"
                      )}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => i18n.changeLanguage('ta')}
                      className={clsx(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer",
                        i18n.language === 'ta' ? "bg-white text-emerald-900 shadow-xs" : "text-white/80"
                      )}
                    >
                      தமிழ்
                    </button>
                  </div>
                </div>
              </div>

              {/* Scrollable Navigation Area */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                
                {/* Categorized Shop Accordion */}
                <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-750 p-3 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setShopExpanded(!shopExpanded)}
                    className="flex items-center justify-between w-full text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{currentLang === 'ta' ? 'அங்காடி வகைகள்' : 'Organic Categories (10)'}</span>
                    </span>
                    <ChevronDown className={clsx("w-4 h-4 transition-transform duration-200", shopExpanded && "rotate-180")} />
                  </button>

                  <AnimatePresence initial={false}>
                    {shopExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden mt-3 space-y-1 border-t border-neutral-200/60 dark:border-neutral-700/60 pt-2"
                      >
                        {realCategories.map((cat, idx) => (
                          <Link
                            key={idx}
                            href={cat.path}
                            onClick={onClose}
                            className="flex items-center justify-between p-2 rounded-xl text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:bg-white dark:hover:bg-neutral-800 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="text-base shrink-0">{cat.icon}</span>
                              <span className="truncate">{currentLang === 'ta' ? cat.labelTa : cat.labelEn}</span>
                            </div>
                            <span className="text-[10px] font-semibold text-neutral-400 shrink-0 ml-2">
                              {cat.count}
                            </span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Primary Nav Links */}
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.path}
                      onClick={onClose}
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                    </Link>
                  ))}
                </nav>

                {/* Direct WhatsApp Farm Help Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-amber-500/10 border border-emerald-500/25 text-xs">
                  <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>{currentLang === 'ta' ? 'நேரடி வாட்ஸ்அப் உதவி' : 'Direct WhatsApp Farm Support'}</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mb-2.5 leading-relaxed">
                    {currentLang === 'ta' ? 'மரச்செக்கு எண்ணெய் ஆர்டர்கள் மற்றும் சந்தேகங்களுக்கு எங்களை அழைக்கவும்.' : 'For bulk custom oils, harvest delivery status, or order inquiries.'}
                  </p>
                  <a
                    href="https://wa.me/918870159766"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 transition-colors"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>WhatsApp: +91 88701 59766</span>
                  </a>
                </div>

                {/* Sign Out Option (if logged in) */}
                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      setShowSignOutModal(true);
                    }}
                    className="flex items-center gap-2 py-2 px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors w-full text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{currentLang === 'ta' ? 'வெளியேறுக' : 'Sign Out'}</span>
                  </button>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
      />
    </>
  );
};
