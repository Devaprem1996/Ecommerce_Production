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
import { Search, Heart, ShoppingBag, X, User, LogOut, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuthStore } from '@/store/auth-store';
import { SignOutModal } from '@/components/auth/SignOutModal';

export const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  const cartCount = useCartStore((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));
  const openMiniCart = useCartStore((state) => state.openMiniCart);
  const wishlistCount = useWishlist((state) => state.items.length);
  const { user, isLoggedIn } = useAuthStore();

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  // Close profile dropdown on route change
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [pathname]);

  // Synchronize wishlist from live database when logged in
  useEffect(() => {
    if (isLoggedIn) {
      useWishlist.getState().syncWithDb();
    }
  }, [isLoggedIn]);

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
              Yathu Arokiyagam
              <span className="text-secondary-400">.</span>
            </span>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7">
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
                  className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[15px] text-center"
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
                  className="absolute top-1.5 right-1.5 bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[15px] text-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* Account Icon / Profile Pill (Desktop) */}
            {isLoggedIn ? (
              <div className="hidden md:flex items-center gap-1 relative" ref={userMenuRef}>
                {/* Profile Pill Button */}
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={clsx(
                    "flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full transition-all cursor-pointer border select-none focus:outline-none",
                    isUserMenuOpen
                      ? "bg-primary-50 dark:bg-primary-950/30 border-primary-300 dark:border-primary-700 text-primary-900 dark:text-primary-100"
                      : !shouldRenderTransparent
                        ? "bg-neutral-100/90 hover:bg-neutral-200/70 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-850 dark:text-neutral-100 border-neutral-200 dark:border-neutral-750"
                        : "bg-white/15 hover:bg-white/25 border-white/25 text-white"
                  )}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-6 h-6 rounded-full bg-primary-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {(user?.name ? user.name.split(' ')[0] : user?.firstName || user?.email?.split('@')[0] || 'A').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold max-w-[100px] truncate">
                    {user?.name ? user.name.split(' ')[0] : user?.firstName || user?.email?.split('@')[0] || 'Account'}
                  </span>
                  <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform duration-200", isUserMenuOpen && "rotate-180")} />
                </button>

                {/* Quick Sign Out Icon Button */}
                <button
                  type="button"
                  onClick={() => setShowSignOutModal(true)}
                  className={clsx(
                    "p-2 rounded-full transition-colors focus:outline-none min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer",
                    !shouldRenderTransparent
                      ? "hover:bg-red-50 dark:hover:bg-red-950/20 text-neutral-500 hover:text-red-500"
                      : "text-white/80 hover:text-red-300 hover:bg-white/15"
                  )}
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>

                {/* Profile Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-feature shadow-2xl py-2 z-50 overflow-hidden text-neutral-900 dark:text-neutral-100"
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/30">
                        <p className="text-xs font-bold truncate text-neutral-900 dark:text-white">
                          {user?.name || user?.email?.split('@')[0] || 'Member'}
                        </p>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5 font-medium">
                          {user?.email || user?.mobile || 'Verified Member'}
                        </p>
                      </div>

                      {/* Menu Links */}
                      <div className="py-1">
                        <Link
                          href="/account"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-950/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          <User className="w-3.5 h-3.5" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-950/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>My Orders</span>
                        </Link>
                        <Link
                          href="/account/wishlist"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center justify-between px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-950/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <Heart className="w-3.5 h-3.5" />
                            <span>Wishlist</span>
                          </div>
                          {wishlistCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-[10px] text-white font-bold leading-none">
                              {wishlistCount}
                            </span>
                          )}
                        </Link>
                      </div>

                      {/* Sign Out Action in Dropdown */}
                      <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1 mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setShowSignOutModal(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:flex p-2 rounded-full hover:bg-neutral-100/10 transition-colors focus:outline-none relative min-w-[36px] min-h-[36px] items-center justify-center cursor-pointer"
                aria-label="View Account"
              >
                <User className="w-5 h-5" />
              </Link>
            )}

          </div>
        </div>
      </header>

      {/* Mobile menu drawer */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Sign Out Confirmation Modal */}
      <SignOutModal isOpen={showSignOutModal} onClose={() => setShowSignOutModal(false)} />
    </>
  );
};

Navbar.displayName = 'Navbar';
