"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Check, Plus, ShoppingCart, Leaf } from 'lucide-react';
import { ProductType } from '@/types';
import { formatPrice } from '@/utils/formatPrice';
import { slugify } from '@/utils/slugify';
import { useFlyingCart } from './FlyingCartParticle';
import clsx from 'clsx';

interface ShopProductCardProps {
  product: ProductType;
  onAddToCart: (product: ProductType) => void;
  onWishlistToggle: (product: ProductType) => void;
  isWishlisted: boolean;
  className?: string;
}

export const ShopProductCard: React.FC<ShopProductCardProps> = ({
  product,
  onAddToCart,
  onWishlistToggle,
  isWishlisted,
  className,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const router = useRouter();
  const { triggerFly } = useFlyingCart();

  const [isAdded, setIsAdded] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [floatPluses, setFloatPluses] = useState<{ id: number }[]>([]);

  // Bilingual name
  const displayName = currentLang === 'ta' && product.nameTamil ? product.nameTamil : product.name;
  const productSlug = slugify(product.name);

  // Discount & pricing
  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasDiscount && product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Rating fallback
  const ratingValue = product.rating ? Number(product.rating) : 4.9;
  const reviewCount = product.reviewsCount || 121;

  // Handle Add to Cart with animations
  const handleAddClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (product.stock === 0) return;

    // Trigger flying particle from button center
    const rect = e.currentTarget.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    triggerFly(startX, startY, product.images?.[0]);

    // Float +1 particle
    const plusId = Date.now();
    setFloatPluses((prev) => [...prev, { id: plusId }]);
    setTimeout(() => {
      setFloatPluses((prev) => prev.filter((p) => p.id !== plusId));
    }, 900);

    // Button added state
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1400);

    onAddToCart(product);
  };

  // Handle Wishlist Toggle with burst animation
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isWishlisted) {
      setShowHeartBurst(true);
      setTimeout(() => setShowHeartBurst(false), 800);
    }
    onWishlistToggle(product);
  };

  const navigateToProduct = () => {
    router.push(`/shop/${productSlug}`);
  };

  // 8 radial particles for heart burst
  const burstParticles = Array.from({ length: 8 });

  return (
    <div
      onClick={navigateToProduct}
      className={clsx(
        "group relative flex flex-col w-full rounded-2xl sm:rounded-3xl p-3 sm:p-4 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 transition-all duration-300 hover:shadow-xl hover:border-emerald-500/40 cursor-pointer overflow-hidden",
        className
      )}
    >
      {/* 1. Image Container (Light Sand / Grey Container matching reference) */}
      <div className="relative w-full aspect-square sm:aspect-[4/3.8] bg-[#F7F5F0] dark:bg-neutral-800/80 rounded-xl sm:rounded-2xl overflow-hidden flex items-center justify-center p-3 mb-3.5 transition-colors">
        
        {/* Product Image with smooth hover zoom */}
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={product.images?.[0] || '/images/placeholder.svg'}
            alt={displayName}
            fill
            sizes="(max-width: 640px) 180px, (max-width: 1024px) 260px, 320px"
            className="object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-108"
          />
        </div>

        {/* Top-Left Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start pointer-events-none">
          {product.stock === 0 ? (
            <span className="text-[9px] font-black uppercase tracking-wider text-white bg-red-600/90 px-2 py-0.5 rounded-full shadow-xs">
              {currentLang === 'ta' ? 'முடிந்தது' : 'Sold Out'}
            </span>
          ) : (
            <>
              {product.isOrganic && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-200 bg-white/90 dark:bg-emerald-950/80 backdrop-blur-md px-2 py-0.5 rounded-full shadow-2xs border border-emerald-500/20">
                  <Leaf className="w-2.5 h-2.5 text-emerald-600 fill-current" />
                  <span>{currentLang === 'ta' ? 'இயற்கை' : 'Organic'}</span>
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-white bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 rounded-full shadow-2xs">
                  {discountPercent}% OFF
                </span>
              )}
            </>
          )}
        </div>

        {/* Top-Right Wishlist Button with Heart Burst Animation */}
        <div className="absolute top-2.5 right-2.5 z-20">
          <div className="relative">
            <motion.button
              type="button"
              onClick={handleWishlistClick}
              whileTap={{ scale: 0.8 }}
              className={clsx(
                "w-8 h-8 rounded-full shadow-xs flex items-center justify-center cursor-pointer transition-all border backdrop-blur-md",
                isWishlisted
                  ? "bg-red-50 dark:bg-red-950/60 text-red-500 border-red-200 dark:border-red-900 shadow-red-500/20"
                  : "bg-white/90 hover:bg-white dark:bg-neutral-850/90 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-red-500 border-white/80 dark:border-neutral-700"
              )}
              aria-label="Wishlist toggle"
            >
              <Heart
                className={clsx(
                  "w-4 h-4 transition-transform duration-200",
                  isWishlisted ? "fill-current text-red-500 scale-110" : ""
                )}
              />
            </motion.button>

            {/* Exploding particles burst when wishlisted */}
            <AnimatePresence>
              {showHeartBurst && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {burstParticles.map((_, i) => {
                    const angle = (i * 360) / 8;
                    const rad = (angle * Math.PI) / 180;
                    const x = Math.cos(rad) * 24;
                    const y = Math.sin(rad) * 24;

                    return (
                      <motion.span
                        key={i}
                        initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                        animate={{ x, y, scale: [0, 1.2, 0], opacity: [1, 0.8, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.55, ease: "easeOut" }}
                        className="absolute w-1.5 h-1.5 rounded-full bg-rose-500"
                      />
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* 2. Product Details Section (Matching Image 1 reference exactly) */}
      <div className="flex flex-col flex-1 text-left px-0.5">
        
        {/* Row 1: Title (left) & Price (right) */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link
            href={`/shop/${productSlug}`}
            onClick={(e) => e.stopPropagation()}
            className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex-1 min-w-0"
          >
            <h3 className="text-xs sm:text-[13px] font-bold text-neutral-900 dark:text-white line-clamp-1 leading-snug">
              {displayName}
            </h3>
          </Link>

          <div className="flex items-baseline gap-1 shrink-0">
            <span className="text-xs sm:text-[13px] font-black text-neutral-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && product.originalPrice && (
              <span className="text-[10px] text-neutral-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Row 2: Short Benefit Subtitle / Unit */}
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mb-1.5 font-normal">
          {product.description || (product.isOrganic ? '100% Organic certified farm produce' : 'Traditional pure harvest')}
          {product.unit && ` • ${product.unit}`}
        </p>

        {/* Row 3: Rating Stars + Count (★★★★★ 121) */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={clsx(
                  "w-3 h-3 fill-current",
                  i < Math.floor(ratingValue) ? "text-amber-500" : "text-neutral-300 dark:text-neutral-700"
                )}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400">
            ({reviewCount})
          </span>
        </div>

        {/* Row 4: Clean Pill Button "Add to Cart" */}
        <div className="relative mt-auto pt-1">
          {/* Floating +1 particle */}
          <AnimatePresence>
            {floatPluses.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 1, y: 0, scale: 0.8 }}
                animate={{ opacity: 0, y: -36, scale: 1.25 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.75, ease: "easeOut" }}
                className="absolute left-1/2 -translate-x-1/2 -top-2 z-30 pointer-events-none text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shadow-xs border border-emerald-200"
              >
                +1
              </motion.div>
            ))}
          </AnimatePresence>

          {product.stock > 0 ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={handleAddClick}
              className={clsx(
                "w-full py-2 px-3 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border select-none",
                isAdded
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-transparent text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700 hover:bg-[#183F2D] hover:text-white hover:border-[#183F2D] dark:hover:bg-emerald-700 dark:hover:border-emerald-700 shadow-2xs"
              )}
              aria-label="Add to cart"
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  <span>{currentLang === 'ta' ? 'சேர்க்கப்பட்டது' : 'Added to Cart'}</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5 opacity-80" />
                  <span>{currentLang === 'ta' ? 'கூடையில் சேர்' : 'Add to Cart'}</span>
                </>
              )}
            </motion.button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full py-2 px-3 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border border-neutral-200 dark:border-neutral-800 cursor-not-allowed text-center"
            >
              {currentLang === 'ta' ? 'கையிருப்பில் இல்லை' : 'Out of Stock'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
