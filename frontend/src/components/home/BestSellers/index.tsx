"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ProductCard } from '@/components/ui/ProductCard';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { mockProducts } from '@/constants/mockData';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from '@/components/ui/Toast';
import { ProductType } from '@/types';

interface BestSellersProps {
  onQuickView: (product: ProductType) => void;
}

export const BestSellers: React.FC<BestSellersProps> = ({ onQuickView }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const { addItem } = useCart();
  const { toggleItem, hasItem } = useWishlist();

  const [isLoading, setIsLoading] = useState(true);

  // Simulate API fetching to show skeleton loaders
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleAddToCart = (product: ProductType) => {
    addItem(product);
    const displayName = currentLang === 'ta' && product.nameTamil ? product.nameTamil : product.name;
    toast.cart(displayName);
  };

  const handleWishlistToggle = (product: ProductType) => {
    const wasWishlisted = hasItem(product.id);
    toggleItem(product);
    const displayName = currentLang === 'ta' && product.nameTamil ? product.nameTamil : product.name;
    if (!wasWishlisted) {
      toast.success(
        currentLang === 'ta' 
          ? `${displayName} விருப்பப்பட்டியலில் சேர்க்கப்பட்டது!` 
          : `${displayName} added to wishlist!`
      );
    } else {
      toast.info(
        currentLang === 'ta' 
          ? `${displayName} விருப்பப்பட்டியலில் இருந்து நீக்கப்பட்டது` 
          : `${displayName} removed from wishlist`
      );
    }
  };

  // Best Sellers: Sort or select products (show first 8 products)
  const bestSellers = mockProducts.slice(0, 8);

  return (
    <section id="best-sellers" className="w-full py-16 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800/10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8" data-aos="fade-up">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-neutral-900 dark:text-white">
              {t('products.best_sellers', 'Best Sellers')}
            </h2>
            <div className="h-1 w-12 bg-primary-500 rounded-full" />
          </div>
          <Link
            href="/shop?sort=best-selling"
            className="text-sm font-semibold text-primary-500 hover:text-primary-400 hover:underline transition-colors flex items-center gap-1 focus:outline-none"
          >
            {t('products.view_all', 'View All →')}
          </Link>
        </div>

        {/* Products Grid / Skeleton Loader */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <SkeletonLoader key={idx} variant="card" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((product, index) => (
              <div
                key={product.id}
                data-aos="fade-up"
                data-aos-delay={(index % 4) * 100}
              >
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                  onWishlistToggle={handleWishlistToggle}
                  isWishlisted={hasItem(product.id)}
                  onQuickView={onQuickView}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
