"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Sparkles, Clock } from 'lucide-react';
import { ProductType } from '@/types';
import { ShopProductCard } from './ShopProductCard';

interface RecentlyViewedSectionProps {
  allProducts: ProductType[];
  onAddToCart: (product: ProductType) => void;
  onWishlistToggle: (product: ProductType) => void;
  isWishlisted: (id: string) => boolean;
}

export const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({
  allProducts,
  onAddToCart,
  onWishlistToggle,
  isWishlisted,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const [recentlyViewed, setRecentlyViewed] = useState<ProductType[]>([]);

  // Load recently viewed from localStorage or fallback
  useEffect(() => {
    try {
      const stored = localStorage.getItem('yathu_recently_viewed_ids');
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        const matched = ids
          .map((id) => allProducts.find((p) => p.id === id))
          .filter((p): p is ProductType => Boolean(p));

        if (matched.length > 0) {
          setRecentlyViewed(matched.slice(0, 4));
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Default fallback to 4 products from middle of catalog
    if (allProducts.length > 4) {
      setRecentlyViewed(allProducts.slice(4, 8));
    }
  }, [allProducts]);

  // Similar items recommendation (4 items)
  const similarItems = allProducts.slice(0, 4);

  if (allProducts.length === 0) return null;

  return (
    <div className="w-full my-16 space-y-16 border-t border-neutral-200/60 dark:border-neutral-800 pt-12">
      
      {/* 1. Similar Items You Might Like (Matching Image 2 Top Section) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{currentLang === 'ta' ? 'உங்களுக்கான பரிந்துரை' : 'Handpicked For You'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-heading text-neutral-900 dark:text-white tracking-tight">
              {currentLang === 'ta' ? 'உங்களுக்குப் பிடித்த பிற விளைச்சல்கள்' : 'Similar Items You Might Like'}
            </h2>
          </div>
        </div>

        {/* 4-Card Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {similarItems.map((prod) => (
            <ShopProductCard
              key={`similar-${prod.id}`}
              product={prod}
              onAddToCart={onAddToCart}
              onWishlistToggle={onWishlistToggle}
              isWishlisted={isWishlisted(prod.id)}
            />
          ))}
        </div>
      </section>

      {/* 2. Recently Viewed (Matching Image 2 Bottom Section) */}
      {recentlyViewed.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentLang === 'ta' ? 'உங்கள் வரலாறு' : 'Browsing History'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-heading text-neutral-900 dark:text-white tracking-tight">
                {currentLang === 'ta' ? 'சமீபத்தில் பார்த்தவை' : 'Recently Viewed'}
              </h2>
            </div>
          </div>

          {/* 4-Card Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {recentlyViewed.map((prod) => (
              <ShopProductCard
                key={`recent-${prod.id}`}
                product={prod}
                onAddToCart={onAddToCart}
                onWishlistToggle={onWishlistToggle}
                isWishlisted={isWishlisted(prod.id)}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
