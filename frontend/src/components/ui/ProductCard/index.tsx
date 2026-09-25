"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ProductCardProps } from './ProductCard.types';
import { formatPrice } from '@/utils/formatPrice';
import { slugify } from '@/utils/slugify';
import { Heart, ShoppingBag, Eye, Leaf, Star } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const ProductCard: React.FC<ProductCardProps> = ({
  className,
  product,
  onAddToCart,
  onWishlistToggle,
  isWishlisted = false,
  onQuickView,
  ...props
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const router = useRouter();

  // Bilingual support for name
  const displayName = currentLang === 'ta' && product.nameTamil ? product.nameTamil : product.name;
  const productSlug = slugify(product.name);

  // Stock & Pricing calculations
  const isSoldOut = product.stock === 0;
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const originalPrice = product.originalPrice || (product.price * 1.25);
  const discountPercent = hasDiscount && product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) onAddToCart(product);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onWishlistToggle) onWishlistToggle(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    } else {
      router.push(`/shop/${productSlug}`);
    }
  };

  return (
    <div
      onClick={handleQuickView}
      className={twMerge(
        clsx(
          // Warm Organic Surface & Compact Proportions
          'group relative flex flex-col w-full rounded-2xl lg:rounded-3xl p-3 sm:p-4 overflow-hidden font-sans cursor-pointer transition-all duration-300',
          // Warm earthy organic styling matching site theme
          'bg-[#F8F6F0] dark:bg-neutral-900',
          'border border-[#ECE6DC] dark:border-neutral-800',
          // Subtle natural shadow
          'shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]',
          // Hover lift with warm glow
          'hover:-translate-y-1.5 hover:shadow-xl hover:border-emerald-500/30 dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.55)]'
        ),
        className
      )}
      {...props}
    >
      {/* Specular Liquid Sheen Light Sweep on Hover */}
      <div 
        className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-30" 
        aria-hidden="true" 
      />

      {/* Image Container */}
      <div className="relative w-full aspect-square bg-white dark:bg-neutral-800 rounded-xl lg:rounded-2xl overflow-hidden flex items-center justify-center mb-3 shadow-2xs">
        
        {/* Product Image with Smooth Scale Zoom */}
        <Image
          src={product.images[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'}
          alt={displayName}
          fill
          sizes="(max-width: 576px) 160px, (max-width: 992px) 240px, 280px"
          className="object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Liquid Glass Badges (Top-Left Absolute) */}
        <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1 items-start pointer-events-none">
          {isSoldOut ? (
            <span className="text-[9px] font-black uppercase tracking-wider text-white bg-red-600/90 backdrop-blur-md px-2 py-0.5 rounded-full shadow-xs">
              {currentLang === 'ta' ? 'விற்றுத்தீர்ந்தது' : 'Sold Out'}
            </span>
          ) : (
            <>
              {product.isOrganic && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-200 bg-white/85 dark:bg-emerald-950/80 backdrop-blur-md px-2 py-0.5 rounded-full shadow-xs border border-white/60 dark:border-emerald-500/20">
                  <Leaf className="w-2.5 h-2.5 text-emerald-600 fill-current" />
                  <span>{currentLang === 'ta' ? 'இயற்கை' : 'Organic'}</span>
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-[9px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-orange-500 to-amber-500 px-1.5 py-0.5 rounded-full shadow-xs">
                  {discountPercent}% OFF
                </span>
              )}
            </>
          )}
        </div>

        {/* Liquid Glass Wishlist Heart (Top-Right Absolute) */}
        <div className="absolute top-2.5 right-2.5 z-20">
          <motion.button
            type="button"
            onClick={handleWishlistToggle}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            animate={{ scale: isWishlisted ? [1, 1.25, 1] : 1 }}
            transition={{ duration: 0.25 }}
            className={twMerge(
              clsx(
                'w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-xs flex items-center justify-center cursor-pointer transition-colors backdrop-blur-md border border-white/70 dark:border-neutral-700',
                isWishlisted
                  ? 'bg-red-50 text-red-500 dark:bg-red-950/40'
                  : 'bg-white/80 hover:bg-white dark:bg-neutral-850/80 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-red-500'
              )
            )}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={clsx('w-3.5 h-3.5', isWishlisted && 'fill-current text-red-500')} />
          </motion.button>
        </div>

        {/* Glassmorphic Quick View Overlay Capsule */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 dark:bg-neutral-900/95 text-neutral-900 dark:text-white font-bold text-[11px] shadow-md border border-white/40 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            <Eye className="w-3.5 h-3.5 text-primary-500" />
            <span>{t('quick_view.title', 'Quick View')}</span>
          </div>
        </div>

      </div>

      {/* Content Section: Compact, Balanced & Elegant */}
      <div className="flex flex-col flex-1 text-left px-0.5">
        
        {/* Top Row: Category + Star Rating Inline (Space-Saving) */}
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider truncate">
            {product.category}
          </span>
          <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-700 dark:text-neutral-300 shrink-0">
            <Star className="w-3 h-3 text-amber-500 fill-current" />
            <span>{product.rating ? Number(product.rating).toFixed(1) : '4.9'}</span>
            <span className="text-[10px] text-neutral-400 font-normal">
              ({product.reviewsCount || 18})
            </span>
          </div>
        </div>

        {/* Product Title */}
        <Link
          href={`/shop/${productSlug}`}
          onClick={(e) => e.stopPropagation()}
          className="line-clamp-1 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
        >
          <h4 className="kinetic-title text-xs sm:text-[13px] font-bold text-neutral-900 dark:text-white leading-tight">
            {displayName}
          </h4>
        </Link>

        {/* Bottom Row: Price & Tactile Liquid Add Button */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-2.5 border-t border-neutral-200/60 dark:border-neutral-800">
          
          {/* Price Stack */}
          <div className="flex flex-col min-w-0">
            {hasDiscount && (
              <span className="text-[10px] text-neutral-400 line-through leading-none mb-0.5 font-medium">
                {formatPrice(originalPrice)}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-[15px] font-black text-emerald-800 dark:text-emerald-400 leading-none">
                {formatPrice(product.price)}
              </span>
              <span className="text-[10px] text-neutral-500 font-medium truncate">
                /{product.unit}
              </span>
            </div>
          </div>

          {/* Compact Add to Cart Pill */}
          {!isSoldOut ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={handleAddToCart}
              className="liquid-btn inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
              aria-label={t('products.add_to_cart', 'Add to cart')}
            >
              <ShoppingBag className="w-3 h-3" />
              <span>{currentLang === 'ta' ? 'சேர்' : 'Add'}</span>
            </motion.button>
          ) : (
            <button
              type="button"
              disabled
              className="px-2.5 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 text-[10px] font-semibold opacity-60 cursor-not-allowed shrink-0"
            >
              {currentLang === 'ta' ? 'முடிந்தது' : 'Sold'}
            </button>
          )}

        </div>

      </div>

    </div>
  );
};

ProductCard.displayName = 'ProductCard';
