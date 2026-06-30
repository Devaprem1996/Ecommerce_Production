"use client";

import React from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ProductCardProps } from './ProductCard.types';
import { Badge } from '../Badge';
import { StarRating } from '../StarRating';
import { Button } from '../Button';
import { formatPrice } from '@/utils/formatPrice';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
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

  // Bilingual support for name
  const displayName = currentLang === 'ta' && product.nameTamil ? product.nameTamil : product.name;

  // Determine badge to show
  const isSoldOut = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const hasDiscount = true; // For premium display, let's assume all have a discount or mock it
  const originalPrice = product.price * 1.25;

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
    if (onQuickView) onQuickView(product);
  };

  return (
    <div
      className={twMerge(
        clsx(
          'group relative flex flex-col w-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-card p-4 overflow-hidden transition-all duration-normal hover:-translate-y-2 hover:shadow-card-hover font-sans cursor-pointer'
        ),
        className
      )}
      {...props}
    >
      {/* Badge List (Top-Left Absolute) */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-1.5 items-start pointer-events-none">
        {isSoldOut ? (
          <Badge variant="sold-out" />
        ) : (
          <>
            {product.isOrganic && <Badge variant="organic" />}
            {product.rating >= 4.7 && <Badge variant="hot" />}
          </>
        )}
      </div>

      {/* Wishlist Button (Top-Right Absolute) */}
      <div className="absolute top-6 right-6 z-20">
        <motion.button
          type="button"
          onClick={handleWishlistToggle}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          animate={{ scale: isWishlisted ? [1, 1.25, 1] : 1 }}
          transition={{ duration: 0.3 }}
          className={twMerge(
            clsx(
              'p-2 rounded-full shadow-md bg-white/90 hover:bg-white dark:bg-neutral-800/90 dark:hover:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer transition-colors',
              isWishlisted ? 'text-red-500' : 'text-neutral-600 hover:text-red-500'
            )
          )}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={clsx('w-5 h-5', isWishlisted && 'fill-current')} />
        </motion.button>
      </div>

      {/* Image Section with Quick View Overlay */}
      <div className="relative w-full aspect-square bg-neutral-100 dark:bg-neutral-800 rounded-feature overflow-hidden flex items-center justify-center mb-4">
        <Image
          src={product.images[0] || '/placeholder.png'}
          alt={displayName}
          fill
          sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 25vw"
          className="object-cover transition-transform duration-slow group-hover:scale-105"
        />

        {/* Hover Quick View Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-normal flex items-center justify-center z-10">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleQuickView}
            leftIcon={<Eye className="w-4 h-4" />}
            className="shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-normal"
          >
            {t('hero.cta.explore', 'Quick View')}
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1">
        {/* Category Tag */}
        <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-1">
          {product.category}
        </span>

        {/* Product Name */}
        <h4 className="text-base font-semibold text-neutral-900 dark:text-white line-clamp-1 mb-1 group-hover:text-primary-500 transition-colors">
          {displayName}
        </h4>

        {/* Ratings display */}
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={product.rating} size="sm" />
          <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
            ({product.reviewsCount})
          </span>
        </div>

        {/* Price & Cart row */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-xs text-neutral-600 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="text-lg font-bold text-primary-700 dark:text-primary-400 leading-tight">
              {formatPrice(product.price)}
              <span className="text-xs text-neutral-600 font-normal ml-1">/ {product.unit}</span>
            </span>
          </div>

          <Button
            variant={isSoldOut ? 'ghost' : 'primary'}
            size="sm"
            disabled={isSoldOut}
            onClick={handleAddToCart}
            leftIcon={<ShoppingBag className="w-4 h-4" />}
            className={twMerge(
              clsx(
                'min-w-[40px] px-3 font-semibold h-9 rounded-card',
                isSoldOut && 'bg-neutral-100 text-neutral-600 border-none'
              )
            )}
          >
            {isSoldOut ? t('products.out_of_stock', 'Sold Out') : t('products.add_to_cart', 'Add')}
          </Button>
        </div>
      </div>
    </div>
  );
};

ProductCard.displayName = 'ProductCard';
