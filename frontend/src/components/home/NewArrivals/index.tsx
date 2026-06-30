"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import useEmblaCarousel from 'embla-carousel-react';
import { ProductCard } from '@/components/ui/ProductCard';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { mockProducts } from '@/constants/mockData';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from '@/components/ui/Toast';
import { ProductType } from '@/types';

interface NewArrivalsProps {
  onQuickView: (product: ProductType) => void;
}

export const NewArrivals: React.FC<NewArrivalsProps> = ({ onQuickView }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const { addItem } = useCart();
  const { toggleItem, hasItem } = useWishlist();

  const [isLoading, setIsLoading] = useState(true);
  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

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

  // Reverse list for New Arrivals demonstration
  const newArrivals = [...mockProducts].reverse().slice(0, 8);

  return (
    <section id="new-arrivals" className="w-full py-16 bg-white dark:bg-neutral-905 border-b border-neutral-100 dark:border-neutral-800/10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8" data-aos="fade-up">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-neutral-900 dark:text-white">
              {t('products.new_arrivals', 'New Arrivals')}
            </h2>
            <div className="h-1 w-12 bg-primary-500 rounded-full" />
          </div>
          <Link
            href="/shop?sort=newest"
            className="text-sm font-semibold text-primary-500 hover:text-primary-400 hover:underline transition-colors flex items-center gap-1 focus:outline-none"
          >
            {t('products.view_all', 'View All →')}
          </Link>
        </div>

        {/* Loading skeletons */}
        {isLoading ? (
          <div>
            {/* Desktop skeleton */}
            <div className="hidden md:grid md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, idx) => (
                <SkeletonLoader key={idx} variant="card" />
              ))}
            </div>
            {/* Mobile skeleton */}
            <div className="md:hidden flex gap-4 overflow-hidden">
              {Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} className="flex-none w-[75%]">
                  <SkeletonLoader variant="card" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            {/* Mobile view: Swipeable Carousel */}
            <div className="md:hidden overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4 pb-4">
                {newArrivals.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="flex-none w-[75%] sm:w-[50%]"
                    data-aos="fade-left"
                    data-aos-delay={(index % 4) * 80}
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
            </div>

            {/* Desktop view: 4 Columns Grid */}
            <div className="hidden md:grid md:grid-cols-4 gap-6">
              {newArrivals.map((product, index) => (
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
          </div>
        )}
      </div>
    </section>
  );
};
