"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Plus, Check } from 'lucide-react';
import { ProductType } from '@/types';
import { useCart } from '@/hooks/useCart';
import { toast } from '@/components/ui/Toast';
import apiClient from '@/lib/apiClient';
import { mapProductToFrontend } from '@/utils/apiMapper';
import { mockProducts } from '@/constants/mockData';

interface BestSellersProps {
  onQuickView: (product: ProductType) => void;
}

// Static fallback data used only when the backend is unreachable
const fallbackBestsellers: ProductType[] = [
  {
    id: 'clean-prod-oil',
    name: 'Pure Cold-Pressed Sesame Oil',
    nameTamil: 'தூய மரச்செக்கு நல்லெண்ணெய்',
    description: 'Traditional wood-pressed golden sesame oil extracted from native heirloom sesame seeds. 100% natural, unrefined, zero chemical solvents.',
    descriptionTamil: 'வாகை மரச்செக்கில் பிழியப்பட்ட பாரம்பரிய நல்லெண்ணெய்.',
    price: 8.99,
    originalPrice: 10.99,
    images: ['/images/bestseller-sesame-oil.jpg'],
    category: 'Cold-Pressed Oils',
    stock: 40,
    rating: 5.0,
    reviewsCount: 240,
    isOrganic: true,
    isLabTested: true,
    unit: '500ml Glass Bottle',
  },
  {
    id: 'clean-prod-honey',
    name: 'Raw Wild Mountain Honey',
    nameTamil: 'தூய காட்டுத் தேன்',
    description: '100% pure raw mountain honey collected from wild deep forest hives. Naturally crystallized, rich in enzymes and antioxidants.',
    descriptionTamil: 'ஆழ்காட்டு மலை தேன்கூடுகளிலிருந்து சேகரிக்கப்பட்ட 100% தூய காட்டுத் தேன்.',
    price: 9.49,
    originalPrice: 12.00,
    images: ['/images/bestseller-raw-honey.jpg'],
    category: 'Raw Honey',
    stock: 30,
    rating: 4.9,
    reviewsCount: 195,
    isOrganic: true,
    isLabTested: true,
    unit: '450g Glass Jar',
  },
  {
    id: 'clean-prod-mango',
    name: 'Mango Bliss Juice',
    nameTamil: 'மாம்பழ அமிர்த பானம்',
    description: 'Refreshing & energizing cold-pressed pure ripe mango & citrus juice with zero preservatives, zero added sugar, and high natural vitamin C.',
    descriptionTamil: 'தூய இயற்கை மாம்பழ சாறு, சர்க்கரை மற்றும் ரசாயனம் அற்றது.',
    price: 4.99,
    originalPrice: 6.49,
    images: ['/images/bestseller-mango-juice.jpg'],
    category: 'Cold-Pressed Juices',
    stock: 28,
    rating: 4.9,
    reviewsCount: 182,
    isOrganic: true,
    isLabTested: true,
    unit: '300ml Glass Bottle',
  },
  {
    id: 'clean-prod-cookies',
    name: 'Artisanal Oatmeal Cookies',
    nameTamil: 'ஓட்ஸ் பேக்கரி குக்கீஸ்',
    description: 'Healthy & delicious. Golden-crisp oatmeal cookies baked with organic whole oats, raw country jaggery, and unbleached grain flours.',
    descriptionTamil: 'முழு ஓட்ஸ் மற்றும் நாட்டுச்சர்க்கரையால் சுடப்பட்ட ஆரோக்கியமான குக்கீஸ்.',
    price: 5.49,
    originalPrice: 6.99,
    images: ['/images/bestseller-oatmeal-cookies.jpg'],
    category: 'Bakes & Snacks',
    stock: 45,
    rating: 5.0,
    reviewsCount: 210,
    isOrganic: true,
    isLabTested: true,
    unit: '250g Glass Jar',
  },
];

export const BestSellers: React.FC<BestSellersProps> = ({ onQuickView }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const { addItem } = useCart();
  const [addedIds, setAddedIds] = useState<{ [key: string]: boolean }>({});
  const [products, setProducts] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real bestseller products from the backend API
  useEffect(() => {
    apiClient.get('/api/v1/cms/products?limit=4&sortBy=createdAt&sortOrder=desc')
      .then((res) => {
        if (res?.data?.products && Array.isArray(res.data.products) && res.data.products.length > 0) {
          setProducts(res.data.products.map(mapProductToFrontend));
        } else {
          // API returned but no products – use fallback
          console.warn("No bestseller products from API, using fallback data.");
          setProducts(fallbackBestsellers);
        }
      })
      .catch((err) => {
        console.warn("Backend bestsellers unavailable, using fallback:", err?.message || err);
        setProducts(fallbackBestsellers);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleAddToCart = (e: React.MouseEvent, product: ProductType) => {
    e.stopPropagation();
    addItem(product, 1);
    const displayName = currentLang === 'ta' && product.nameTamil ? product.nameTamil : product.name;
    toast.cart(`${displayName} ($${product.price.toFixed(2)})`);

    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1200);
  };

  return (
    <section id="best-sellers" className="w-full min-h-[calc(100vh-56px)] flex flex-col justify-center py-12 lg:py-16 bg-white dark:bg-neutral-950 font-sans transition-colors duration-normal">
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24">
        
        {/* Exact Header Layout from Reference Image */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-3">
          <div className="flex flex-col items-start">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#1E4D36] dark:text-emerald-400 mb-1.5 block">
              {currentLang === 'ta' ? 'எங்கள் தயாரிப்புகள்' : 'OUR PRODUCTS'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold font-heading text-neutral-900 dark:text-white tracking-tight leading-tight">
              {currentLang === 'ta' ? 'அதிகம் விரும்பப்படும் சிறந்த உணவுகள்' : 'Discover Our Bestsellers'}
            </h2>
          </div>

          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-[0.14em] text-[#1E4D36] dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            <span>{currentLang === 'ta' ? 'அனைத்து தயாரிப்புகள்' : 'VIEW ALL PRODUCTS'}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="rounded-2xl lg:rounded-3xl bg-[#F8F6F0] dark:bg-neutral-900 border border-[#ECE6DC] dark:border-neutral-800 p-4 sm:p-5 flex flex-col animate-pulse">
                <div className="w-full aspect-square rounded-xl lg:rounded-2xl bg-neutral-200 dark:bg-neutral-800 mb-3.5" />
                <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
                <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded mb-3" />
                <div className="flex items-center justify-between pt-2.5 border-t border-neutral-200/60 dark:border-neutral-800">
                  <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" />
                  <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 4 Cards Grid Across Full-Width Container */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {products.map((product) => {
              const isAdded = !!addedIds[product.id];
              const title = currentLang === 'ta' && product.nameTamil ? product.nameTamil : product.name;
              const subtitle = product.description
                ? (currentLang === 'ta' && product.descriptionTamil ? product.descriptionTamil : product.description)
                : '';

              return (
                <div
                  key={product.id}
                  onClick={() => onQuickView(product)}
                  className="group rounded-2xl lg:rounded-3xl bg-[#F8F6F0] dark:bg-neutral-900 border border-[#ECE6DC] dark:border-neutral-800 p-4 sm:p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer select-none"
                >
                  {/* Product Image Container */}
                  <div>
                    <div className="relative w-full aspect-square rounded-xl lg:rounded-2xl overflow-hidden mb-3.5 bg-white dark:bg-neutral-800 flex items-center justify-center shadow-2xs">
                      <Image
                        src={product.images[0] || '/images/placeholder-product.jpg'}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Title */}
                    <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white leading-snug mb-1 font-sans line-clamp-1">
                      {title}
                    </h3>

                    {/* Subtitle / Sensory description */}
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-normal leading-relaxed line-clamp-2 mb-3">
                      {subtitle}
                    </p>
                  </div>

                  {/* Bottom Row: Price on Left, Plus Icon Button on Right */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-neutral-200/60 dark:border-neutral-800">
                    <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white tracking-tight">
                      ${product.price.toFixed(2)}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, product)}
                      aria-label={`Add ${title} to cart`}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                        isAdded
                          ? 'bg-[#173F2D] border-[#173F2D] text-white scale-105'
                          : 'border-neutral-400 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:border-[#173F2D] hover:bg-[#173F2D] hover:text-white'
                      }`}
                    >
                      {isAdded ? (
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Plus className="w-4 h-4 stroke-[2]" />
                      )}
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
