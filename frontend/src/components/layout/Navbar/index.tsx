"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { NavbarProps } from './Navbar.types';
import { MobileMenu } from '../MobileMenu';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useCartStore } from '@/store/cartStore';
import { Search, Heart, ShoppingBag, X, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuthStore } from '@/store/auth-store';

export const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));
  const openMiniCart = useCartStore((state) => state.openMiniCart);
  const wishlistCount = useWishlist((state) => state.items.length);
  const { isLoggedIn } = useAuthStore();


  // Monitor scroll height
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t('nav.home', 'Home'), path: '/' },
    { label: t('nav.shop', 'Shop'), path: '/shop' },
    { label: t('footer.about', 'About'), path: '/about' },
    { label: t('nav.blog', 'Blog'), path: '/blog' },
    { label: t('nav.faq', 'FAQs'), path: '/faq' },
    { label: t('nav.contact', 'Contact'), path: '/contact' },
  ];

  // Hamburger line variants
  const line1Variants = {
    closed: { rotate: 0, y: 0 },
    open: { rotate: 45, y: 6 },
  };

  const line2Variants = {
    closed: { opacity: 1 },
    open: { opacity: 0 },
  };

  const line3Variants = {
    closed: { rotate: 0, y: 0 },
    open: { rotate: -45, y: -6 },
  };

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const shouldRenderTransparent = pathname === '/' && !isScrolled;

  return (
    <>
      <header
        className={twMerge(
          clsx(
            'sticky top-0 w-full transition-all duration-normal z-[1020]',
            !shouldRenderTransparent
              ? 'bg-white dark:bg-neutral-900 shadow-md py-3 text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800/10'
              : 'bg-transparent py-5 text-white'
          ),
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Mobile hamburger menu trigger */}
          <div className="flex sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={clsx(
                'flex flex-col items-center justify-center w-9 h-9 gap-1 rounded-full cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary-500',
                !shouldRenderTransparent ? 'text-neutral-950 dark:text-white' : 'text-white'
              )}
              aria-label="Toggle main menu"
            >
              <motion.span
                animate={isMobileMenuOpen ? 'open' : 'closed'}
                variants={line1Variants}
                className={clsx('w-5 h-0.5 rounded-full block transition-transform', !shouldRenderTransparent ? 'bg-neutral-950 dark:bg-white' : 'bg-white')}
              />
              <motion.span
                animate={isMobileMenuOpen ? 'open' : 'closed'}
                variants={line2Variants}
                className={clsx('w-5 h-0.5 rounded-full block', !shouldRenderTransparent ? 'bg-neutral-950 dark:bg-white' : 'bg-white')}
              />
              <motion.span
                animate={isMobileMenuOpen ? 'open' : 'closed'}
                variants={line3Variants}
                className={clsx('w-5 h-0.5 rounded-full block transition-transform', !shouldRenderTransparent ? 'bg-neutral-950 dark:bg-white' : 'bg-white')}
              />
            </button>
          </div>

          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-1.5 focus:outline-none">
            <span
              className={clsx(
                'text-2xl font-bold font-heading tracking-wide transition-colors',
                !shouldRenderTransparent ? 'text-primary-700 dark:text-primary-400' : 'text-white'
              )}
            >
              Aether
              <span className="text-secondary-400">.</span>
            </span>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden sm:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.label}
                  href={link.path}
                  className={twMerge(
                    clsx(
                      'relative py-1 text-sm font-semibold tracking-wide hover:text-secondary-400 transition-colors focus:outline-none',
                      isActive
                        ? !shouldRenderTransparent
                          ? 'text-primary-700 dark:text-primary-400'
                          : 'text-secondary-400'
                        : !shouldRenderTransparent
                        ? 'text-neutral-700 dark:text-neutral-300'
                        : 'text-white/90'
                    )
                  )}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-secondary-400 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Icons Toolbar (Right) */}
          <div className="flex items-center gap-2.5 sm:gap-4 text-inherit">
            {/* Expandable Search Input (Desktop) */}
            <div className="relative hidden md:flex items-center">
              <AnimatePresence>
                {isSearchExpanded && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="overflow-hidden mr-2"
                  >
                    <input
                      type="text"
                      placeholder={t('nav.search', 'Search Products...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim().length >= 1) {
                          router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                          setIsSearchExpanded(false);
                        }
                      }}
                      className={clsx(
                        'w-full h-8 text-xs px-3 rounded-full border bg-white dark:bg-neutral-800 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-neutral-900 dark:text-white',
                        !shouldRenderTransparent ? 'border-neutral-300' : 'border-white/20'
                      )}
                      autoFocus
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                type="button"
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                className="p-2 rounded-full hover:bg-neutral-100/10 transition-colors cursor-pointer focus:outline-none min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Expand search"
              >
                {isSearchExpanded ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>
            </div>

            {/* Wishlist Icon */}
            <Link
              href="/wishlist"
              className="p-2 rounded-full hover:bg-neutral-100/10 transition-colors focus:outline-none relative min-w-[36px] min-h-[36px] flex items-center justify-center"
              aria-label={`View Wishlist (${wishlistCount} items)`}
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={`wish-badge-${wishlistCount}`}
                  className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[15px] text-center"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </Link>

            {/* Cart Icon */}
            <button
              onClick={(e) => { e.preventDefault(); openMiniCart(); }}
              className="p-2 rounded-full hover:bg-neutral-100/10 transition-colors focus:outline-none relative min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
              aria-label={`View Cart (${cartCount} items)`}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  key={`cart-badge-${cartCount}`}
                  className="absolute top-1.5 right-1.5 bg-primary-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[15px] text-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* Account Icon (Desktop) */}
            <Link
              href={isLoggedIn ? "/account" : "/login"}
              className="hidden md:flex p-2 rounded-full hover:bg-neutral-100/10 transition-colors focus:outline-none relative min-w-[36px] min-h-[36px] items-center justify-center"
              aria-label="View Account"
            >
              <User className={`w-5 h-5 ${isLoggedIn ? 'text-primary-500' : ''}`} />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile menu drawer */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
};

Navbar.displayName = 'Navbar';
