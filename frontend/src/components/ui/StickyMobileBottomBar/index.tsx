"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Zap, Check } from 'lucide-react';
import { ProductType, ProductVariantType } from '@/types';
import clsx from 'clsx';

interface StickyMobileBottomBarProps {
  product: ProductType;
  selectedVariant: ProductVariantType | null;
  activePrice: number;
  originalPrice?: number;
  activeStock: number;
  displayName: string;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

export const StickyMobileBottomBar: React.FC<StickyMobileBottomBarProps> = ({
  product,
  selectedVariant,
  activePrice,
  originalPrice,
  activeStock,
  displayName,
  onAddToCart,
  onBuyNow,
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const [isVisible, setIsVisible] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when user scrolls past 380px (past hero images/titles)
      if (window.scrollY > 380) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddClick = () => {
    onAddToCart();
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const discountPercent = originalPrice && originalPrice > activePrice
    ? Math.round(((originalPrice - activePrice) / originalPrice) * 100)
    : 0;

  const packName = selectedVariant?.name || product.unit || '1 unit';
  const thumbnail = product.images && product.images[0] ? product.images[0] : '/images/placeholder.svg';

  return (
    <div
      className={clsx(
        "fixed bottom-0 left-0 right-0 z-50 lg:hidden transition-all duration-300 transform",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
      )}
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-2 mb-1 p-2.5 sm:p-3 rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200/90 dark:border-neutral-800 shadow-[0_-8px_30px_rgba(0,0,0,0.15)] flex items-center justify-between gap-3 font-sans">
        
        {/* Left Side: Product Thumbnail, Title & Price */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shrink-0">
            <Image
              src={thumbnail}
              alt={displayName}
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                {displayName}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                ₹{activePrice}
              </span>
              {originalPrice && originalPrice > activePrice && (
                <span className="text-[10px] text-neutral-400 line-through">
                  ₹{originalPrice}
                </span>
              )}
              <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.2 rounded">
                {packName}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {activeStock > 0 ? (
            <>
              {/* Add to Cart button */}
              <button
                type="button"
                onClick={handleAddClick}
                className={clsx(
                  "h-10 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer",
                  justAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white border border-neutral-300 dark:border-neutral-700"
                )}
                aria-label="Add to cart"
              >
                {justAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>{currentLang === 'ta' ? 'சேர்க்கப்பட்டது' : 'Added'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{currentLang === 'ta' ? 'கார்ட்' : 'Cart'}</span>
                  </>
                )}
              </button>

              {/* Buy Now button */}
              <button
                type="button"
                onClick={onBuyNow}
                className="h-10 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-98 transition-all cursor-pointer"
                aria-label="Buy now"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>{currentLang === 'ta' ? 'வாங்க' : 'Buy Now'}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled
              className="h-10 px-4 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-400 text-xs font-bold cursor-not-allowed opacity-75"
            >
              {currentLang === 'ta' ? 'விற்றுத்தீர்ந்தது' : 'Sold Out'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
