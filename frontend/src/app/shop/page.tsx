"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  Grid2X2,
  Grid3X3,
  List,
  ChevronRight,
  X,
  Star,
  RotateCcw,
  ShoppingBag,
  SlidersHorizontal,
  ChevronDown,
  Loader2,
  Check,
  Sparkles,
  Leaf
} from 'lucide-react';
import { mockProducts, mockCategories } from '@/constants/mockData';
import { ProductCard } from '@/components/ui/ProductCard';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from '@/components/ui/Toast';
import { ProductType, CategoryType } from '@/types';
import { slugify } from '@/utils/slugify';
import apiClient from '@/lib/apiClient';
import { mapProductToFrontend, mapCategoryToFrontend } from '@/utils/apiMapper';
import clsx from 'clsx';

// Category color palettes for vibrant pastel styling
const categoryPillColors: Record<string, { bg: string; text: string; border: string }> = {
  'cold-pressed-oils': { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-800 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  'traditional-rice': { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-800 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
  'natural-sweeteners': { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-800 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
  'native-millets': { bg: 'bg-lime-50 dark:bg-lime-950/40', text: 'text-lime-800 dark:text-lime-300', border: 'border-lime-200 dark:border-lime-800' },
  'herbal-health-mix': { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-800 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' },
  'pure-ghee-honey': { bg: 'bg-yellow-50 dark:bg-yellow-950/40', text: 'text-yellow-800 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800' },
  'traditional-snacks-sweets': { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-800 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' },
  'authentic-podi-masala': { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-800 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
  'traditional-health-seeds': { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-800 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
  'stone-ground-flours': { bg: 'bg-stone-50 dark:bg-stone-900/60', text: 'text-stone-800 dark:text-stone-300', border: 'border-stone-200 dark:border-stone-750' },
};

const priceRanges = [
  { label: 'All Prices', min: 0, max: 10000 },
  { label: 'Under ₹150', min: 0, max: 150 },
  { label: '₹150 - ₹300', min: 150, max: 300 },
  { label: '₹300 - ₹500', min: 300, max: 500 },
  { label: '₹500+', min: 500, max: 10000 },
];

function ShopContent() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Stores
  const { addItem } = useCart();
  const { toggleItem, hasItem } = useWishlist();

  // States
  const [categories, setCategories] = useState<CategoryType[]>(mockCategories);
  const [dbProducts, setDbProducts] = useState<ProductType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriceRangeIndex, setSelectedPriceRangeIndex] = useState<number>(0);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(4);

  // Pagination & Loading
  const [visibleCount, setVisibleCount] = useState<number>(12);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [isFilterLoading, setIsFilterLoading] = useState<boolean>(false);

  // 1. Fetch Categories on mount
  useEffect(() => {
    apiClient.get('/api/v1/cms/categories')
      .then((res) => {
        if (res?.data?.categories && Array.isArray(res.data.categories)) {
          setCategories(res.data.categories.map(mapCategoryToFrontend));
        }
      })
      .catch(() => {});
  }, []);

  // 2. Fetch Products
  useEffect(() => {
    setIsPageLoading(true);
    apiClient.get('/api/v1/cms/products', { params: { limit: '100' } })
      .then((res) => {
        if (res?.data?.products && Array.isArray(res.data.products)) {
          setDbProducts(res.data.products.map(mapProductToFrontend));
        } else {
          setDbProducts(mockProducts);
        }
      })
      .catch(() => {
        setDbProducts(mockProducts);
      })
      .finally(() => {
        setIsPageLoading(false);
      });
  }, []);

  // 3. Sync category from URL parameter
  useEffect(() => {
    const categoryParam = searchParams?.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory(null);
    }
  }, [searchParams]);

  // Handle category pill click with router sync
  const handleCategorySelect = (slug: string | null) => {
    setSelectedCategory(slug);
    setVisibleCount(12);
    if (slug) {
      router.replace(`/shop?category=${slug}`, { scroll: false });
    } else {
      router.replace('/shop', { scroll: false });
    }
  };

  // Cart action
  const handleAddToCart = (product: ProductType) => {
    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    const modifiedProduct: ProductType = {
      ...product,
      id: defaultVariant && defaultVariant.id !== 'default' ? `${product.id}__var__${defaultVariant.id}` : product.id,
      name: defaultVariant && product.variants && product.variants.length > 1
        ? `${product.name} (${defaultVariant.name})`
        : product.name,
      price: defaultVariant ? defaultVariant.price : product.price,
      originalPrice: defaultVariant ? defaultVariant.originalPrice : product.originalPrice,
      stock: defaultVariant ? defaultVariant.stock : product.stock,
      unit: defaultVariant ? defaultVariant.name : product.unit,
      selectedVariantId: defaultVariant?.id !== 'default' ? defaultVariant?.id : undefined,
    };
    addItem(modifiedProduct, 1);
    const displayName = currentLang === 'ta' && product.nameTamil ? product.nameTamil : product.name;
    toast.cart(`${displayName} (1)`);
  };

  // Wishlist toggle
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

  // Clear all filters
  const handleClearAll = () => {
    setSelectedCategory(null);
    setSelectedPriceRangeIndex(0);
    setSelectedRating(null);
    setInStockOnly(false);
    setSortBy('featured');
    setVisibleCount(12);
    router.replace('/shop', { scroll: false });
  };

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...dbProducts];

    // Category Filter
    if (selectedCategory) {
      result = result.filter(product => {
        const prodCatSlug = slugify(product.category);
        return prodCatSlug === selectedCategory || product.category.toLowerCase() === selectedCategory.toLowerCase();
      });
    }

    // Price Filter
    const activePriceRange = priceRanges[selectedPriceRangeIndex];
    if (activePriceRange && (activePriceRange.min > 0 || activePriceRange.max < 10000)) {
      result = result.filter(p => p.price >= activePriceRange.min && p.price <= activePriceRange.max);
    }

    // Rating Filter
    if (selectedRating !== null) {
      result = result.filter(product => product.rating >= selectedRating);
    }

    // Availability Filter
    if (inStockOnly) {
      result = result.filter(product => product.stock > 0);
    }

    // Sorting
    if (sortBy === 'price-low-high') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high-low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [dbProducts, selectedCategory, selectedPriceRangeIndex, selectedRating, inStockOnly, sortBy]);

  // Paginated list
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const loadMoreProducts = () => {
    setIsFilterLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 8);
      setIsFilterLoading(false);
    }, 400);
  };

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    dbProducts.forEach(p => {
      const s = slugify(p.category);
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [dbProducts]);

  const hasActiveFilters = selectedCategory !== null || selectedPriceRangeIndex !== 0 || selectedRating !== null || inStockOnly;

  return (
    <div className="min-h-screen bg-[#FEFCF8] dark:bg-neutral-950 font-sans pb-20 transition-colors duration-normal">
      
      {/* 1. Vibrant Top Hero Banner with Organic Gradient Atmosphere */}
      <div className="w-full bg-gradient-to-r from-emerald-800 via-teal-900 to-amber-900 text-white py-8 sm:py-12 relative overflow-hidden shadow-sm">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <nav className="flex items-center gap-2 text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-3">
            <Link href="/" className="hover:text-white transition-colors">
              {t('shop.breadcrumb_home', 'Home')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-white select-none">
              {t('shop.breadcrumb_shop', 'Shop')}
            </span>
            {selectedCategory && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-amber-300 font-bold capitalize">
                  {categories.find(c => slugify(c.name) === selectedCategory)?.name || selectedCategory.replace(/-/g, ' ')}
                </span>
              </>
            )}
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-200 text-[11px] font-bold uppercase tracking-wider mb-2 border border-white/15">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{currentLang === 'ta' ? '100% இயற்கை விளைச்சல்' : '100% Direct Farm Organic Harvest'}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black font-heading text-white tracking-tight">
                {currentLang === 'ta' ? 'பாரம்பரிய இயற்கை அங்காடிகள்' : 'Authentic Organic Store Catalog'}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
                {currentLang === 'ta'
                  ? 'மரச்செக்கு எண்ணெய், பாரம்பரிய அரிசி, நாட்டு சர்க்கரை, சிறுதானியங்கள் மற்றும் கலப்படமற்ற உணவுப் பொருட்கள்.'
                  : 'Pure cold-pressed oils, native heritage rice, organic palm jaggery, millets, and unadulterated essentials.'}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3.5 py-1.5 rounded-xl bg-white/15 backdrop-blur-md text-white text-xs font-bold border border-white/20">
                {filteredProducts.length} {currentLang === 'ta' ? 'பொருட்கள் தயார்' : 'Products Available'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Horizontal Category Ribbon */}
      <div className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-200/80 dark:border-neutral-800 py-3.5 sticky top-16 z-30 shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
            
            {/* All Products Pill */}
            <button
              type="button"
              onClick={() => handleCategorySelect(null)}
              className={clsx(
                "px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border",
                selectedCategory === null
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/20"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-750"
              )}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>{currentLang === 'ta' ? 'அனைத்து பொருட்கள்' : 'All Products'}</span>
              <span className={clsx("text-[10px] px-1.5 py-0.2 rounded-full", selectedCategory === null ? "bg-white/20 text-white" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300")}>
                {dbProducts.length}
              </span>
            </button>

            {/* Individual Category Pills */}
            {categories.map((cat) => {
              const catSlug = slugify(cat.name);
              const isSelected = selectedCategory === catSlug;
              const count = categoryCounts[catSlug] || cat.itemCount || 0;
              const displayName = currentLang === 'ta' && cat.nameTamil ? cat.nameTamil : cat.name;
              const palette = categoryPillColors[catSlug] || { bg: 'bg-neutral-50', text: 'text-neutral-800', border: 'border-neutral-200' };

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(isSelected ? null : catSlug)}
                  className={clsx(
                    "px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border",
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-500/20 scale-102"
                      : `${palette.bg} ${palette.text} ${palette.border} hover:scale-101 hover:shadow-xs`
                  )}
                >
                  <span>{displayName}</span>
                  {count > 0 && (
                    <span className={clsx(
                      "text-[10px] font-bold px-1.5 py-0.2 rounded-full",
                      isSelected ? "bg-white/20 text-white" : "bg-black/5 dark:bg-white/10"
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Main Catalog Body with Responsive Filter & Sort Toolbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Toolbar Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F8F6F0] dark:bg-neutral-900 border border-[#ECE6DC] dark:border-neutral-800 rounded-3xl p-4 mb-6 shadow-xs">
          
          {/* Left: Price Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider mr-1 shrink-0">
              {currentLang === 'ta' ? 'விலை:' : 'Price:'}
            </span>
            {priceRanges.map((range, idx) => (
              <button
                key={range.label}
                type="button"
                onClick={() => setSelectedPriceRangeIndex(idx)}
                className={clsx(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 border",
                  selectedPriceRangeIndex === idx
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100"
                )}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Right: In-Stock Toggle, Sort Dropdown & Grid View Toggle */}
          <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
            
            {/* In-Stock Switch */}
            <button
              type="button"
              onClick={() => setInStockOnly(!inStockOnly)}
              className={clsx(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer",
                inStockOnly
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
                  : "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700"
              )}
            >
              <div className={clsx("w-2 h-2 rounded-full", inStockOnly ? "bg-emerald-500 animate-pulse" : "bg-neutral-400")} />
              <span>{currentLang === 'ta' ? 'கையிருப்பில் உள்ளவை' : 'In Stock Only'}</span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products"
                className="appearance-none text-xs font-bold text-neutral-800 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 pl-3 pr-8 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="featured">{t('shop.sort_featured', 'Featured')}</option>
                <option value="price-low-high">{t('shop.sort_price_asc', 'Price: Low to High')}</option>
                <option value="price-high-low">{t('shop.sort_price_desc', 'Price: High to Low')}</option>
                <option value="rating">{t('shop.sort_rating', 'Top Rated')}</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <button
                type="button"
                onClick={() => { setViewMode('grid'); setGridCols(4); }}
                className={clsx(
                  "p-1.5 rounded-lg transition-colors cursor-pointer",
                  viewMode === 'grid' && gridCols === 4 ? "bg-white dark:bg-neutral-700 text-emerald-600 shadow-xs" : "text-neutral-500"
                )}
                aria-label="4 columns"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => { setViewMode('grid'); setGridCols(2); }}
                className={clsx(
                  "p-1.5 rounded-lg transition-colors cursor-pointer",
                  viewMode === 'grid' && gridCols === 2 ? "bg-white dark:bg-neutral-700 text-emerald-600 shadow-xs" : "text-neutral-500"
                )}
                aria-label="2 columns"
              >
                <Grid2X2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={clsx(
                  "p-1.5 rounded-lg transition-colors cursor-pointer",
                  viewMode === 'list' ? "bg-white dark:bg-neutral-700 text-emerald-600 shadow-xs" : "text-neutral-500"
                )}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Active Filters Row (if any applied) */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-xs font-bold text-neutral-500">
              {currentLang === 'ta' ? 'தேர்ந்தெடுக்கப்பட்ட வடிகட்டிகள்:' : 'Active Filters:'}
            </span>
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300/40">
                {selectedCategory}
                <button type="button" onClick={() => handleCategorySelect(null)} className="cursor-pointer hover:opacity-75">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedPriceRangeIndex !== 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300/40">
                {priceRanges[selectedPriceRangeIndex].label}
                <button type="button" onClick={() => setSelectedPriceRangeIndex(0)} className="cursor-pointer hover:opacity-75">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-500/10 text-teal-800 dark:text-teal-300 text-xs font-bold border border-teal-300/40">
                In Stock Only
                <button type="button" onClick={() => setInStockOnly(false)} className="cursor-pointer hover:opacity-75">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-bold text-red-500 hover:text-red-600 underline cursor-pointer ml-2"
            >
              {currentLang === 'ta' ? 'அனைத்தையும் நீக்கு' : 'Reset All'}
            </button>
          </div>
        )}

        {/* Product Grid / List Content */}
        {isPageLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <SkeletonLoader key={idx} variant="card" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-8 shadow-xs">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
              <Leaf className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-2">
              {currentLang === 'ta' ? 'பொருட்கள் எதுவும் கிடைக்கவில்லை' : 'No Organic Products Found'}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mb-6">
              {currentLang === 'ta'
                ? 'தேர்ந்தெடுத்த வகைகளில் பொருட்கள் இல்லை. வேறு வகையை அல்லது விலை வரம்பை தேர்ந்தெடுக்கவும்.'
                : 'Try adjusting your filters or browsing other traditional categories to find what you need.'}
            </p>
            <Button
              variant="primary"
              onClick={handleClearAll}
              leftIcon={<RotateCcw className="w-4 h-4" />}
              className="font-bold text-xs"
            >
              {currentLang === 'ta' ? 'அனைத்து பொருட்களையும் பார்க்க' : 'View All Products'}
            </Button>
          </div>
        ) : (
          <>
            <motion.div
              layout
              className={clsx(
                viewMode === 'list'
                  ? 'flex flex-col gap-4'
                  : gridCols === 2
                  ? 'grid grid-cols-2 gap-3 sm:gap-5'
                  : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5'
              )}
            >
              {paginatedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: (index % 8) * 0.05 }}
                  className="flex w-full"
                >
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    onWishlistToggle={handleWishlistToggle}
                    isWishlisted={hasItem(product.id)}
                    onClick={() => router.push(`/shop/${slugify(product.name)}`)}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Load More Button */}
            {filteredProducts.length > visibleCount && (
              <div className="flex items-center justify-center mt-12">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={loadMoreProducts}
                  disabled={isFilterLoading}
                  className="min-w-[180px] rounded-2xl border border-neutral-300 dark:border-neutral-700 font-bold text-xs shadow-xs"
                  leftIcon={isFilterLoading ? <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> : undefined}
                >
                  {isFilterLoading ? (currentLang === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...') : (currentLang === 'ta' ? 'மேலும் காண்க' : 'Load More Products')}
                </Button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
