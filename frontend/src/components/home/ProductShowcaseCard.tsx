"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { ProductType } from '@/types';
import { formatPrice } from '@/utils/formatPrice';
import { slugify } from '@/utils/slugify';

export interface ProductShowcaseCardProps {
  product: ProductType;
  badgeText: string;
  badgeTamilText?: string;
  onQuickView: (product: ProductType) => void;
  onAddToCart: (product: ProductType) => void;
  onWishlistToggle: (product: ProductType) => void;
  isWishlisted: boolean;
}

export const ProductShowcaseCard: React.FC<ProductShowcaseCardProps> = ({
  product,
  badgeText,
  badgeTamilText,
  onQuickView,
  onAddToCart,
  onWishlistToggle,
  isWishlisted,
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const [isAdded, setIsAdded] = useState(false);

  const displayName =
    currentLang === 'ta' && product.nameTamil ? product.nameTamil : product.name;
  const displayBadge =
    currentLang === 'ta' && badgeTamilText ? badgeTamilText : badgeText;

  const activePrice = product.price;
  const originalPrice =
    product.originalPrice && product.originalPrice > activePrice
      ? product.originalPrice
      : Math.round(activePrice * 1.25);

  const handleCardClick = () => {
    onQuickView(product);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onWishlistToggle(product);
  };

  const handleCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1200);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between rounded-[22px] bg-[#F1F1F3] dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 p-4 sm:p-5 transition-all duration-300 hover:shadow-lg select-none cursor-pointer h-full"
    >
      {/* Top Badge: Golden Yellow Pill on top right */}
      <div className="absolute top-3.5 right-3.5 z-10 pointer-events-none">
        <span className="inline-block bg-[#F1BA14] text-neutral-900 text-[11px] sm:text-xs font-semibold px-3 py-1 rounded-full shadow-2xs tracking-tight">
          {displayBadge}
        </span>
      </div>

      {/* Product Image Area */}
      <div className="relative w-full aspect-square flex items-center justify-center my-2 sm:my-3 overflow-hidden">
        <Image
          src={product.images[0] || '/images/placeholder.svg'}
          alt={displayName}
          fill
          sizes="(max-width: 640px) 75vw, (max-width: 1024px) 33vw, 25vw"
          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300 ease-out"
        />
      </div>

      {/* Bottom Information Row */}
      <div className="flex items-end justify-between gap-2 pt-2">
        {/* Product Details (Left Column) */}
        <div className="flex flex-col min-w-0 pr-1">
          <Link
            href={`/shop/${product.slug || slugify(product.name)}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <h3 className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-white truncate leading-snug">
              {displayName}
            </h3>
          </Link>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-500 line-through font-normal">
              {formatPrice(originalPrice)}
            </span>
            <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white">
              {formatPrice(activePrice)}
            </span>
          </div>
        </div>

        {/* Action Buttons (Right Column) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label={`Add ${displayName} to wishlist`}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200/90 dark:border-neutral-700 shadow-2xs flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer text-neutral-700 dark:text-neutral-200"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted
                  ? 'fill-rose-500 text-rose-500'
                  : 'text-neutral-600 dark:text-neutral-300'
              }`}
            />
          </button>

          {/* Add to Bag / Cart Button */}
          <button
            type="button"
            onClick={handleCartClick}
            aria-label={`Add ${displayName} to cart`}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200/90 dark:border-neutral-700 shadow-2xs flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer text-neutral-700 dark:text-neutral-200"
          >
            {isAdded ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
            ) : (
              <ShoppingBag className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
