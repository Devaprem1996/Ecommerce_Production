"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  RotateCcw,
  Sparkles,
  Leaf,
  Loader2,
  Grid2X2,
  Grid3X3,
  List
} from 'lucide-react';
import { mockProducts, mockCategories } from '@/constants/mockData';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { toast } from '@/components/ui/Toast';
import { ProductType, CategoryType } from '@/types';
import { slugify } from '@/utils/slugify';
import apiClient from '@/lib/apiClient';
import { mapProductToFrontend, mapCategoryToFrontend } from '@/utils/apiMapper';
import { FlyingCartProvider } from '@/components/shop/FlyingCartParticle';
import { ShopHeroBanner } from '@/components/shop/ShopHeroBanner';
import { FilterPillsBar, FilterState, priceRanges } from '@/components/shop/FilterPillsBar';
import { FilterDrawer } from '@/components/shop/FilterDrawer';
import { ShopProductCard } from '@/components/shop/ShopProductCard';
import { PopularCategoriesBento } from '@/components/shop/PopularCategoriesBento';
import { RecentlyViewedSection } from '@/components/shop/RecentlyViewedSection';
import clsx from 'clsx';

function ShopContent() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Stores
  const { addItem } = useCart();
  const { toggleItem, hasItem } = useWishlist();

  // Data States
  const [categories, setCategories] = useState<CategoryType[]>(mockCategories);
  const [dbProducts, setDbProducts] = useState<ProductType[]>([]);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [isFilterLoading, setIsFilterLoading] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // View States
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(4);
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    selectedCategory: null,
    selectedPriceRangeIndex: 0,
    selectedRating: null,
    organicOnly: false,
    labTestedOnly: false,
    discountOnly: false,
    inStockOnly: false,
    sortBy: 'featured',
  });

  // 1. Fetch Categories
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
      setFilters((prev) => ({ ...prev, selectedCategory: categoryParam }));
    } else {
      setFilters((prev) => ({ ...prev, selectedCategory: null }));
    }
  }, [searchParams]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => {
      const next = { ...prev, ...newFilters };
      if ('selectedCategory' in newFilters) {
        if (newFilters.selectedCategory) {
          router.replace(`/shop?category=${newFilters.selectedCategory}`, { scroll: false });
        } else {
          router.replace('/shop', { scroll: false });
        }
      }
      return next;
    });
    setVisibleCount(12);
  };

  const handleResetFilters = () => {
    setFilters({
      selectedCategory: null,
      selectedPriceRangeIndex: 0,
      selectedRating: null,
      organicOnly: false,
      labTestedOnly: false,
      discountOnly: false,
      inStockOnly: false,
      sortBy: 'featured',
    });
    setVisibleCount(12);
    router.replace('/shop', { scroll: false });
  };

  // Add to Cart Action
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

    // Track recently viewed
    try {
      const stored = localStorage.getItem('yathu_recently_viewed_ids');
      const list: string[] = stored ? JSON.parse(stored) : [];
      const updated = [product.id, ...list.filter((id) => id !== product.id)].slice(0, 10);
      localStorage.setItem('yathu_recently_viewed_ids', JSON.stringify(updated));
    } catch {}
  };

  // Wishlist Action
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

  // Item counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    dbProducts.forEach((p) => {
      const s = slugify(p.category);
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [dbProducts]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...dbProducts];

    // Category
    if (filters.selectedCategory) {
      result = result.filter((p) => {
        const prodCatSlug = slugify(p.category);
        return prodCatSlug === filters.selectedCategory || p.category.toLowerCase() === filters.selectedCategory?.toLowerCase();
      });
    }

    // Price
    const range = priceRanges[filters.selectedPriceRangeIndex];
    if (range && (range.min > 0 || range.max < 10000)) {
      result = result.filter((p) => p.price >= range.min && p.price <= range.max);
    }

    // Rating
    if (filters.selectedRating !== null) {
      result = result.filter((p) => (p.rating || 0) >= filters.selectedRating!);
    }

    // Organic
    if (filters.organicOnly) {
      result = result.filter((p) => p.isOrganic);
    }

    // Discount
    if (filters.discountOnly) {
      result = result.filter((p) => Boolean(p.originalPrice && p.originalPrice > p.price));
    }

    // In Stock
    if (filters.inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    // Sorting
    if (filters.sortBy === 'price-low-high') {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price-high-low') {
      result.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return result;
  }, [dbProducts, filters]);

  // Paginated list
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const loadMoreProducts = () => {
    setIsFilterLoading(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 8);
      setIsFilterLoading(false);
    }, 350);
  };

  const currentCategoryObj = categories.find((c) => slugify(c.name) === filters.selectedCategory);

  return (
    <FlyingCartProvider>
      <div className="min-h-screen bg-[#FEFCF8] dark:bg-neutral-950 font-sans pb-24 transition-colors duration-normal">
        
        {/* Breadcrumb Navigation Bar */}
        <div className="w-full bg-white/60 dark:bg-neutral-900/60 border-b border-neutral-200/60 dark:border-neutral-800 backdrop-blur-md py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              <Link href="/" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                {t('shop.breadcrumb_home', 'Home')}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              <span className={clsx(filters.selectedCategory ? "text-neutral-500" : "text-neutral-900 dark:text-white font-bold")}>
                {t('shop.breadcrumb_shop', 'Shop')}
              </span>
              {filters.selectedCategory && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-emerald-800 dark:text-emerald-400 font-bold capitalize">
                    {currentCategoryObj?.name || filters.selectedCategory.replace(/-/g, ' ')}
                  </span>
                </>
              )}
            </nav>

            <span className="text-xs font-bold text-neutral-500 hidden sm:inline-block">
              {filteredProducts.length} {currentLang === 'ta' ? 'விளைச்சல்கள் தயார்' : 'Harvests Available'}
            </span>
          </div>
        </div>

        {/* Main Page Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
          
          {/* 1. Promotional Hero Banner (Matching Image 1) */}
          <ShopHeroBanner
            onCtaClick={() => {
              handleFilterChange({ discountOnly: true });
              const target = document.getElementById('shop-catalog-section');
              if (target) target.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* 2. Horizontal Filter Pills Bar (Matching Image 1) */}
          <FilterPillsBar
            categories={categories}
            categoryCounts={categoryCounts}
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onOpenAllFiltersDrawer={() => setIsDrawerOpen(true)}
            totalResults={filteredProducts.length}
          />

          {/* 3. Catalog Section with Section Title and View Toggles */}
          <div id="shop-catalog-section" className="pt-2">
            
            {/* Section Heading & Grid View Modes */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black font-heading text-neutral-900 dark:text-white tracking-tight">
                  {filters.selectedCategory && currentCategoryObj ? (
                    currentLang === 'ta' && currentCategoryObj.nameTamil
                      ? currentCategoryObj.nameTamil
                      : `${currentCategoryObj.name} For You!`
                  ) : currentLang === 'ta' ? (
                    'உங்களுக்கான இயற்கை விளைச்சல்கள்!'
                  ) : (
                    'Organic Harvests For You!'
                  )}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {currentLang === 'ta'
                    ? `மொத்தம் ${filteredProducts.length} தூய்மையான பொருட்கள் கிடைக்கின்றன`
                    : `Showing ${filteredProducts.length} fresh, unadulterated farm staples`}
                </p>
              </div>

              {/* View Layout Switcher */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto bg-neutral-100 dark:bg-neutral-850 p-1 rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => { setViewMode('grid'); setGridCols(4); }}
                  className={clsx(
                    "p-2 rounded-xl transition-all cursor-pointer",
                    viewMode === 'grid' && gridCols === 4
                      ? "bg-white dark:bg-neutral-700 text-emerald-700 dark:text-emerald-400 shadow-xs"
                      : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  )}
                  aria-label="4 columns grid"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { setViewMode('grid'); setGridCols(2); }}
                  className={clsx(
                    "p-2 rounded-xl transition-all cursor-pointer",
                    viewMode === 'grid' && gridCols === 2
                      ? "bg-white dark:bg-neutral-700 text-emerald-700 dark:text-emerald-400 shadow-xs"
                      : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  )}
                  aria-label="2 columns grid"
                >
                  <Grid2X2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={clsx(
                    "p-2 rounded-xl transition-all cursor-pointer",
                    viewMode === 'list'
                      ? "bg-white dark:bg-neutral-700 text-emerald-700 dark:text-emerald-400 shadow-xs"
                      : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  )}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Product Cards Grid / Skeleton */}
            {isPageLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <SkeletonLoader key={idx} variant="card" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Empty Search State */
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-8 shadow-xs">
                <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-800">
                  <Leaf className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-neutral-900 dark:text-white mb-2">
                  {currentLang === 'ta' ? 'பொருட்கள் எதுவும் கிடைக்கவில்லை' : 'No Organic Harvests Found'}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mb-6">
                  {currentLang === 'ta'
                    ? 'தேர்ந்தெடுத்த வகைகளில் பொருட்கள் இல்லை. வேறு வடிகட்டியைத் தேர்ந்தெடுக்கவும்.'
                    : 'Try clearing some filters or browse our other handcrafted natural collections.'}
                </p>
                <Button
                  variant="primary"
                  onClick={handleResetFilters}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                  className="font-bold text-xs rounded-full"
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
                      ? 'grid grid-cols-2 gap-3.5 sm:gap-5'
                      : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5'
                  )}
                >
                  {paginatedProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: (index % 8) * 0.04 }}
                      className="flex w-full"
                    >
                      <ShopProductCard
                        product={product}
                        onAddToCart={handleAddToCart}
                        onWishlistToggle={handleWishlistToggle}
                        isWishlisted={hasItem(product.id)}
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
                      className="min-w-[200px] rounded-full border border-neutral-300 dark:border-neutral-700 font-bold text-xs shadow-xs"
                      leftIcon={isFilterLoading ? <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> : undefined}
                    >
                      {isFilterLoading
                        ? (currentLang === 'ta' ? 'ஏற்றுகிறது...' : 'Loading Harvests...')
                        : (currentLang === 'ta' ? 'மேலும் காண்க' : 'Load More Harvests')}
                    </Button>
                  </div>
                )}
              </>
            )}

          </div>

          {/* 4. Popular Categories Bento (Matching Image 1) */}
          <PopularCategoriesBento
            categories={categories}
            categoryCounts={categoryCounts}
            selectedCategory={filters.selectedCategory}
            onSelectCategory={(slug) => handleFilterChange({ selectedCategory: slug })}
          />

          {/* 5. Similar Items & Recently Viewed Sections (Matching Image 2) */}
          <RecentlyViewedSection
            allProducts={dbProducts}
            onAddToCart={handleAddToCart}
            onWishlistToggle={handleWishlistToggle}
            isWishlisted={hasItem}
          />

        </div>

        {/* 6. Filter Slide-Over Drawer */}
        <FilterDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          categories={categories}
          categoryCounts={categoryCounts}
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          totalResults={filteredProducts.length}
        />

      </div>
    </FlyingCartProvider>
  );
}

export default function Shop() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FEFCF8] dark:bg-neutral-950 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
