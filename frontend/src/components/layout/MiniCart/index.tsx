"use client";

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Lock } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';

export const MiniCart: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const router = useRouter();

  const {
    items,
    isMiniCartOpen,
    closeMiniCart,
    updateQuantity,
    removeItem,
    getTotal,
    getItemCount
  } = useCartStore();

  const subtotal = getTotal();
  const itemCount = getItemCount();
  const freeShippingThreshold = 499;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  // Close sidebar on pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMiniCart();
      }
    };
    if (isMiniCartOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMiniCartOpen, closeMiniCart]);

  const handleNavigate = (path: string) => {
    closeMiniCart();
    router.push(path);
  };

  return (
    <AnimatePresence>
      {isMiniCartOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={closeMiniCart}
            className="fixed inset-0 bg-black z-[1050]"
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 240 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:max-w-md bg-white dark:bg-neutral-900 shadow-2xl z-[1060] flex flex-col font-sans border-l border-neutral-100 dark:border-neutral-800"
          >
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-850/40">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                  {t('cart.title', 'Shopping Cart')}
                </h3>
                <span className="text-xs bg-primary-500/10 text-primary-500 font-bold px-2 py-0.5 rounded-full">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              <button
                onClick={closeMiniCart}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-primary-500"
                aria-label="Close cart sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Progress bar */}
            {itemCount > 0 && (
              <div className="px-5 py-3.5 bg-primary-500/5 border-b border-neutral-100 dark:border-neutral-800 text-xs text-neutral-750 dark:text-neutral-350">
                {remainingForFreeShipping > 0 ? (
                  <p className="font-medium text-neutral-700 dark:text-neutral-300">
                    Add <span className="font-bold text-primary-500">₹{remainingForFreeShipping}</span> more for <span className="font-bold">Free Delivery</span>!
                  </p>
                ) : (
                  <p className="font-bold text-[#2D6A4F] dark:text-[#52B788] flex items-center gap-1">
                    🎉 You qualify for Free Delivery!
                  </p>
                )}
                <div className="mt-2 w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${progressToFreeShipping}%` }}
                    className="h-full bg-primary-500 rounded-full transition-all duration-normal"
                  />
                </div>
              </div>
            )}

            {/* Scrollable Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {items.length === 0 ? (
                /* Empty State */
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5">
                  <div className="w-24 h-24 text-neutral-300 dark:text-neutral-700">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-neutral-900 dark:text-white">
                      {t('cart.empty', 'Your Cart is Empty')}
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-[240px] mx-auto">
                      {t('cart.empty_desc', 'Fill it with direct-farm-sourced organic goodness!')}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={closeMiniCart}
                    className="font-bold text-xs"
                  >
                    {t('cart.shop_now', 'Start Shopping')}
                  </Button>
                </div>
              ) : (
                items.map(({ product, quantity }) => {
                  const displayName = currentLang === 'ta' && product.nameTamil ? product.nameTamil : product.name;
                  return (
                    <div
                      key={`${product.id}-${product.unit}`}
                      className="flex gap-4 p-3 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-card shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
                    >
                      {/* Product Thumbnail */}
                      <div className="relative aspect-square w-16 bg-neutral-50 dark:bg-neutral-800 rounded-card overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img src={product.images[0]} alt={displayName} className="object-cover w-full h-full" />
                      </div>

                      {/* Info & Quantity controls */}
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-xs text-neutral-900 dark:text-white line-clamp-2 leading-tight group-hover:text-primary-500 transition-colors">
                              {displayName}
                            </h4>
                            <button
                              onClick={() => removeItem(product.id)}
                              className="text-neutral-600 hover:text-red-500 dark:hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-[10px] text-neutral-600 dark:text-neutral-500 font-semibold bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full inline-block mt-1">
                            {product.unit}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4 mt-2">
                          <div className="flex items-center border border-neutral-200 dark:border-neutral-850 rounded-card bg-neutral-50 dark:bg-neutral-850">
                            <button
                              onClick={() => quantity > 1 ? updateQuantity(product.id, quantity - 1) : removeItem(product.id)}
                              className="p-1.5 hover:text-primary-500 text-neutral-600 dark:text-neutral-400 transition-colors focus:outline-none cursor-pointer min-w-[26px] flex items-center justify-center"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold px-2 text-neutral-900 dark:text-white select-none w-5 text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              className="p-1.5 hover:text-primary-500 text-neutral-650 dark:text-neutral-400 transition-colors focus:outline-none cursor-pointer min-w-[26px] flex items-center justify-center"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <div className="text-right font-black text-sm text-neutral-900 dark:text-white">
                            ₹{product.price * quantity}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer Summary */}
            {items.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-neutral-100 dark:border-neutral-850 bg-neutral-50 dark:bg-neutral-850/30 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                    <span>Delivery</span>
                    {remainingForFreeShipping === 0 ? (
                      <span className="text-success">Free</span>
                    ) : (
                      <span>₹50</span>
                    )}
                  </div>
                  <div className="flex justify-between text-base font-black text-neutral-900 dark:text-white pt-2 border-t border-neutral-200 dark:border-neutral-800">
                    <span>Estimated Total</span>
                    <span>₹{subtotal + (remainingForFreeShipping === 0 ? 0 : 50)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    variant="cta"
                    size="lg"
                    onClick={() => handleNavigate('/checkout')}
                    className="w-full font-bold text-sm bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow-md"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Proceed to Checkout
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => handleNavigate('/cart')}
                    className="w-full font-bold text-xs border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    {t('cart.view_bag', 'View Cart Page')}
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-neutral-600 dark:text-neutral-450 uppercase tracking-widest pt-1">
                  <Lock className="w-3.5 h-3.5 text-primary-500" />
                  <span>Secure checkout certified</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
