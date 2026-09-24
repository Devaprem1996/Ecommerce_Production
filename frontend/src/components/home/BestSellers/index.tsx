"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/ui/ProductCard';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { mockProducts } from '@/constants/mockData';
import apiClient from '@/lib/apiClient';
import { mapProductToFrontend } from '@/utils/apiMapper';
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

  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/api/v1/cms/products?limit=8')
      .then((res) => {
        if (res?.data?.products && Array.isArray(res.data.products)) {
          setProducts(res.data.products.map(mapProductToFrontend));
        } else {
          setProducts(mockProducts.slice(0, 8));
        }
      })
      .catch((err) => {
        console.error("Failed to load best sellers:", err);
        setProducts(mockProducts.slice(0, 8));
      })
      .finally(() => {
        setIsLoading(false);
      });
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

  return (
    <section id="best-sellers" className="w-full py-12 sm:py-16 bg-white dark:bg-neutral-900/60 font-sans transition-colors duration-normal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Modern Section Header with Eyebrow and "View All" */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4" data-aos="fade-up">
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{currentLang === 'ta' ? 'அதிகம் விரும்பப்பட்டவை' : 'Most Loved by Families'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-neutral-900 dark:text-white tracking-tight">
              {currentLang === 'ta' ? 'சிறந்த பாரம்பரிய உணவுகள்' : 'Best Selling Traditional Foods'}
            </h2>
          </div>

          <Link
            href="/shop?sort=best-selling"
            className="group inline-flex items-center gap-2 text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            <span>{currentLang === 'ta' ? 'அனைத்து தயாரிப்புகள்' : 'View All Products'}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Products Grid / Skeleton Loader */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {Array.from({ length: 8 }).map((_, idx) => (
              <SkeletonLoader key={idx} variant="card" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {products.map((product, index) => (
              <div
                key={product.id}
                data-aos="fade-up"
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
        )}

      </div>
    </section>
  );
};
