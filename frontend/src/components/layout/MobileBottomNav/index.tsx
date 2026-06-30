"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MobileBottomNavProps } from './MobileBottomNav.types';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { Home, ShoppingBag, Search, Heart, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ className }) => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const wishlistCount = useWishlist((state) => state.items.length);
  const cartCount = useCart((state) => state.items.reduce((acc, item) => acc + item.quantity, 0));

  const navItems = [
    {
      label: t('nav.home', 'Home'),
      icon: Home,
      path: '/',
    },
    {
      label: t('nav.shop', 'Shop'),
      icon: ShoppingBag,
      path: '/shop',
    },
    {
      label: t('nav.search_tab', 'Search'),
      icon: Search,
      path: '/search',
    },
    {
      label: t('nav.wishlist', 'Wishlist'),
      icon: Heart,
      path: '/wishlist',
      badge: wishlistCount,
    },
    {
      label: t('nav.account', 'Account'),
      icon: User,
      path: '/account',
    },
  ];

  return (
    <div
      className={twMerge(
        clsx(
          'sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 z-[1010] shadow-[0_-4px_12px_rgba(0,0,0,0.05)] select-none',
          // 64px height + bottom safe area
          'h-16 pb-[env(safe-area-inset-bottom)]'
        ),
        className
      )}
    >
      <div className="h-full max-w-md mx-auto grid grid-cols-5 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.label}
              href={item.path}
              className="flex flex-col items-center justify-center h-full relative text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 focus:outline-none"
            >
              <div className="relative p-1">
                <Icon
                  className={twMerge(
                    clsx(
                      'w-5 h-5 transition-colors duration-normal',
                      isActive ? 'text-primary-500 fill-primary-500/10' : 'text-neutral-600 dark:text-neutral-400'
                    )
                  )}
                />
                
                {/* Badge (e.g. on Wishlist) */}
                {item.badge !== undefined && item.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full leading-none min-w-[14px] text-center"
                  >
                    {item.badge}
                  </motion.span>
                )}
              </div>
              
              <span
                className={twMerge(
                  clsx(
                    'mt-0.5 transition-colors duration-normal',
                    isActive ? 'text-primary-500 font-bold' : 'text-neutral-600 dark:text-neutral-400'
                  )
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

MobileBottomNav.displayName = 'MobileBottomNav';
