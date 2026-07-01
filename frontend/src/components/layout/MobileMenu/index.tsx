"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileMenuProps } from './MobileMenu.types';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { X, ChevronDown, User, Heart, ShoppingBag, Truck, Globe } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuthStore } from '@/store/auth-store';

const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const [shopExpanded, setShopExpanded] = useState(false);
  const { user, isLoggedIn } = useAuthStore();

  const cartCount = useCart((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));
  const wishlistCount = useWishlist((state) => state.items.length);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en');
  };

  const navLinks = [
    { label: t('nav.home', 'Home'), path: '/' },
    { label: t('nav.shop', 'Shop'), path: '/shop', hasSubItems: true },
    { label: t('footer.about', 'About'), path: '/about' },
    { label: t('nav.blog', 'Blog'), path: '/blog' },
    { label: t('nav.faq', 'FAQs'), path: '/faq' },
    { label: t('nav.contact', 'Contact'), path: '/contact' },
  ];

  const subItems = [
    { label: t('category.vegetables', 'Fresh Vegetables'), path: '/shop?category=vegetables' },
    { label: t('category.fruits', 'Organic Fruits'), path: '/shop?category=fruits' },
    { label: t('category.groceries', 'Spices & Groceries'), path: '/shop?category=groceries' },
    { label: t('category.dairy', 'Farm Dairy Products'), path: '/shop?category=dairy' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 backdrop-blur-[3px] z-40"
            aria-hidden="true"
          />

          {/* Slide-out Menu */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed top-0 left-0 bottom-0 w-[290px] sm:w-[320px] bg-white dark:bg-neutral-900 z-50 shadow-2xl flex flex-col font-sans"
          >
            {/* Header / User Greeting */}
            <div className="bg-primary-700 text-white p-5 flex flex-col gap-4 relative">
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mt-2">
                <div className="bg-white/10 p-2.5 rounded-full text-white">
                  <User className="w-6 h-6" />
                </div>
                {isLoggedIn && user ? (
                  <Link href="/account" onClick={onClose} className="flex flex-col text-left focus:outline-none">
                    <span className="text-sm text-primary-200 leading-tight font-medium">
                      {t('nav.welcome', 'Welcome')},
                    </span>
                    <span className="text-base font-bold leading-tight hover:text-primary-205 transition-colors">
                      {user.name}
                    </span>
                  </Link>
                ) : (
                  <Link href="/login" onClick={onClose} className="flex flex-col text-left focus:outline-none">
                    <span className="text-sm text-primary-200 leading-tight font-medium">
                      {t('nav.welcome_guest', 'Welcome Guest')}
                    </span>
                    <span className="text-base font-bold leading-tight hover:text-primary-205 transition-colors">
                      {t('nav.login_signup', 'Login / Signup')}
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* Scrollable Navigation Area */}
            <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => {
                  if (link.hasSubItems) {
                    return (
                      <div key={link.label} className="flex flex-col">
                        <button
                          onClick={() => setShopExpanded(!shopExpanded)}
                          className="flex items-center justify-between py-3 text-base font-medium text-neutral-800 dark:text-neutral-200 hover:text-primary-500 transition-colors w-full cursor-pointer text-left focus:outline-none"
                        >
                          <span>{link.label}</span>
                          <motion.div
                            animate={{ rotate: shopExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-5 h-5 text-neutral-600" />
                          </motion.div>
                        </button>

                        <AnimatePresence initial={false}>
                          {shopExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden pl-4 border-l border-neutral-200 dark:border-neutral-800 flex flex-col gap-1.5"
                            >
                              {subItems.map((sub) => (
                                <Link
                                  key={sub.label}
                                  href={sub.path}
                                  onClick={onClose}
                                  className="py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary-500 transition-colors block"
                                >
                                  {sub.label}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={link.label}
                      href={link.path}
                      onClick={onClose}
                      className="py-3 text-base font-medium text-neutral-800 dark:text-neutral-200 hover:text-primary-500 transition-colors block border-b border-neutral-100 dark:border-neutral-800/20"
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Utility shortcuts */}
              <div className="flex flex-col gap-4 border-t border-neutral-100 dark:border-neutral-850 pt-5">
                <Link
                  href="/track-order"
                  onClick={onClose}
                  className="flex items-center gap-3 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-500 transition-colors"
                >
                  <Truck className="w-4 h-4" />
                  <span>{t('nav.track_order', 'Track Order')}</span>
                </Link>

                <Link
                  href="/wishlist"
                  onClick={onClose}
                  className="flex items-center justify-between text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-500 transition-colors w-full"
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4" />
                    <span>{t('nav.wishlist', 'Wishlist')}</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-none">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex items-center justify-between text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-primary-500 transition-colors w-full"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t('nav.cart', 'Shopping Cart')}</span>
                  </div>
                  {cartCount > 0 && (
                    <span className="bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-none">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Footer / Settings Section */}
            <div className="p-5 border-t border-neutral-150 dark:border-neutral-850 flex flex-col gap-4 bg-neutral-50 dark:bg-neutral-900/50">
              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center justify-between w-full text-xs font-semibold text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 rounded-card p-2.5 bg-white dark:bg-neutral-900 hover:border-primary-500 hover:text-primary-500 cursor-pointer transition-colors focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Language / மொழி</span>
                </div>
                <span className="text-primary-500 font-bold">
                  {i18n.language === 'en' ? 'தமிழ்' : 'English'}
                </span>
              </button>

              {/* Social icons */}
              <div className="flex items-center justify-center gap-5 mt-2">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-600 hover:text-primary-500 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-600 hover:text-primary-500 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-600 hover:text-primary-500 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

MobileMenu.displayName = 'MobileMenu';
