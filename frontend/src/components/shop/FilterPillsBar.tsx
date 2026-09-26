"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  SlidersHorizontal,
  X,
  Check,
  Star,
  Sparkles,
  Tag,
  ShieldCheck,
  Leaf
} from 'lucide-react';
import { CategoryType } from '@/types';
import { slugify } from '@/utils/slugify';
import clsx from 'clsx';

export interface FilterState {
  selectedCategory: string | null;
  selectedPriceRangeIndex: number;
  selectedRating: number | null;
  organicOnly: boolean;
  labTestedOnly: boolean;
  discountOnly: boolean;
  inStockOnly: boolean;
  sortBy: string;
}

interface FilterPillsBarProps {
  categories: CategoryType[];
  categoryCounts: Record<string, number>;
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onOpenAllFiltersDrawer: () => void;
  totalResults: number;
}

export const priceRanges = [
  { label: 'All Prices', min: 0, max: 10000 },
  { label: 'Under ₹150', min: 0, max: 150 },
  { label: '₹150 - ₹300', min: 150, max: 300 },
  { label: '₹300 - ₹500', min: 300, max: 500 },
  { label: '₹500+', min: 500, max: 10000 },
];

export const ratingOptions = [
  { label: 'All Ratings', value: null },
  { label: '4.5★ & Above', value: 4.5 },
  { label: '4.0★ & Above', value: 4.0 },
  { label: '3.5★ & Above', value: 3.5 },
];

export const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-low-high' },
  { label: 'Price: High to Low', value: 'price-high-low' },
  { label: 'Top Rated', value: 'rating' },
];

export const FilterPillsBar: React.FC<FilterPillsBarProps> = ({
  categories,
  categoryCounts,
  filters,
  onFilterChange,
  onResetFilters,
  onOpenAllFiltersDrawer,
  totalResults,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  // Active open dropdown tracker
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (name: string) => {
    setActiveMenu((prev) => (prev === name ? null : name));
  };

  const hasActiveFilters =
    filters.selectedCategory !== null ||
    filters.selectedPriceRangeIndex !== 0 ||
    filters.selectedRating !== null ||
    filters.organicOnly ||
    filters.labTestedOnly ||
    filters.discountOnly ||
    filters.inStockOnly;

  const currentCategoryName = categories.find(
    (c) => slugify(c.name) === filters.selectedCategory
  )?.name;

  return (
    <div ref={containerRef} className="w-full mb-6 relative z-30">
      
      {/* 1. Main Horizontal Filter Row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        
        {/* Left: Filter Dropdown Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          
          {/* 1. Harvest Type (Category) Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu('category')}
              className={clsx(
                "px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shrink-0",
                filters.selectedCategory !== null
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-300/80 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              )}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>{filters.selectedCategory ? currentCategoryName : (currentLang === 'ta' ? 'வகைகள்' : 'Harvest Type')}</span>
              <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform", activeMenu === 'category' && "rotate-180")} />
            </button>

            <AnimatePresence>
              {activeMenu === 'category' && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 w-64 max-h-72 overflow-y-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-2 z-50 no-scrollbar"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onFilterChange({ selectedCategory: null });
                      setActiveMenu(null);
                    }}
                    className={clsx(
                      "w-full px-3 py-2 rounded-xl text-xs font-semibold text-left flex items-center justify-between transition-colors",
                      filters.selectedCategory === null
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    )}
                  >
                    <span>{currentLang === 'ta' ? 'அனைத்து வகைகள்' : 'All Harvest Types'}</span>
                    {filters.selectedCategory === null && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="h-[1px] bg-neutral-100 dark:bg-neutral-800 my-1" />

                  {categories.map((cat) => {
                    const catSlug = slugify(cat.name);
                    const isSelected = filters.selectedCategory === catSlug;
                    const count = categoryCounts[catSlug] || cat.itemCount || 0;
                    const name = currentLang === 'ta' && cat.nameTamil ? cat.nameTamil : cat.name;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          onFilterChange({ selectedCategory: isSelected ? null : catSlug });
                          setActiveMenu(null);
                        }}
                        className={clsx(
                          "w-full px-3 py-2 rounded-xl text-xs font-semibold text-left flex items-center justify-between transition-colors",
                          isSelected
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold"
                            : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        )}
                      >
                        <span className="truncate">{name}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {count > 0 && (
                            <span className="text-[10px] text-neutral-400 font-normal">
                              ({count})
                            </span>
                          )}
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Price Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu('price')}
              className={clsx(
                "px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shrink-0",
                filters.selectedPriceRangeIndex !== 0
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-300/80 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              )}
            >
              <span>{filters.selectedPriceRangeIndex !== 0 ? priceRanges[filters.selectedPriceRangeIndex].label : (currentLang === 'ta' ? 'விலை' : 'Price')}</span>
              <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform", activeMenu === 'price' && "rotate-180")} />
            </button>

            <AnimatePresence>
              {activeMenu === 'price' && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-2 z-50"
                >
                  {priceRanges.map((range, idx) => {
                    const isSelected = filters.selectedPriceRangeIndex === idx;
                    return (
                      <button
                        key={range.label}
                        type="button"
                        onClick={() => {
                          onFilterChange({ selectedPriceRangeIndex: idx });
                          setActiveMenu(null);
                        }}
                        className={clsx(
                          "w-full px-3 py-2 rounded-xl text-xs font-semibold text-left flex items-center justify-between transition-colors",
                          isSelected
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold"
                            : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        )}
                      >
                        <span>{range.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Rating / Review Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu('rating')}
              className={clsx(
                "px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shrink-0",
                filters.selectedRating !== null
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-300/80 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              )}
            >
              <Star className="w-3.5 h-3.5" />
              <span>{filters.selectedRating !== null ? `${filters.selectedRating}★ & up` : (currentLang === 'ta' ? 'மதிப்பீடு' : 'Review')}</span>
              <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform", activeMenu === 'rating' && "rotate-180")} />
            </button>

            <AnimatePresence>
              {activeMenu === 'rating' && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-2 z-50"
                >
                  {ratingOptions.map((opt) => {
                    const isSelected = filters.selectedRating === opt.value;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => {
                          onFilterChange({ selectedRating: opt.value });
                          setActiveMenu(null);
                        }}
                        className={clsx(
                          "w-full px-3 py-2 rounded-xl text-xs font-semibold text-left flex items-center justify-between transition-colors",
                          isSelected
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold"
                            : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        )}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. Certified / Purity Toggle */}
          <button
            type="button"
            onClick={() => onFilterChange({ organicOnly: !filters.organicOnly })}
            className={clsx(
              "px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shrink-0",
              filters.organicOnly
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-300/80 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{currentLang === 'ta' ? '100% இயற்கை' : 'Organic'}</span>
          </button>

          {/* 5. Offer / Discount Toggle */}
          <button
            type="button"
            onClick={() => onFilterChange({ discountOnly: !filters.discountOnly })}
            className={clsx(
              "px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shrink-0",
              filters.discountOnly
                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                : "bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-300/80 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            )}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>{currentLang === 'ta' ? 'சலுகைகள்' : 'Offer'}</span>
          </button>

          {/* 6. All Filters (Drawer Trigger) */}
          <button
            type="button"
            onClick={onOpenAllFiltersDrawer}
            className="px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-300/80 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 shrink-0 shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{currentLang === 'ta' ? 'அனைத்து வடிகட்டிகள்' : 'All Filters'}</span>
          </button>

        </div>

        {/* Right: Sort by Dropdown */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <span className="text-xs font-semibold text-neutral-500 hidden sm:inline">
            {currentLang === 'ta' ? 'வரிசைப்படுத்து:' : 'Sort by:'}
          </span>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value })}
              aria-label="Sort products"
              className="appearance-none text-xs font-bold text-neutral-900 dark:text-white bg-white dark:bg-neutral-900 border border-neutral-300/80 dark:border-neutral-700 pl-3.5 pr-8 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* 2. Active Filter Chips Row (if any active filter) */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 mt-3.5 pt-3 border-t border-neutral-200/60 dark:border-neutral-800 flex-wrap"
          >
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
              {currentLang === 'ta' ? 'தேர்வு:' : 'Active:'}
            </span>

            {/* Category tag */}
            {filters.selectedCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300/50 shadow-2xs">
                <span>{currentCategoryName || filters.selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ selectedCategory: null })}
                  className="hover:opacity-75 cursor-pointer"
                  aria-label="Remove category filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Price tag */}
            {filters.selectedPriceRangeIndex !== 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300/50 shadow-2xs">
                <span>{priceRanges[filters.selectedPriceRangeIndex].label}</span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ selectedPriceRangeIndex: 0 })}
                  className="hover:opacity-75 cursor-pointer"
                  aria-label="Remove price filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Rating tag */}
            {filters.selectedRating !== null && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-300 text-xs font-bold border border-yellow-300/50 shadow-2xs">
                <span>{filters.selectedRating}★ & up</span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ selectedRating: null })}
                  className="hover:opacity-75 cursor-pointer"
                  aria-label="Remove rating filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Organic tag */}
            {filters.organicOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 text-xs font-bold border border-teal-300/50 shadow-2xs">
                <span>100% Organic</span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ organicOnly: false })}
                  className="hover:opacity-75 cursor-pointer"
                  aria-label="Remove organic filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Discount tag */}
            {filters.discountOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/50 text-orange-800 dark:text-orange-300 text-xs font-bold border border-orange-300/50 shadow-2xs">
                <span>Offers Only</span>
                <button
                  type="button"
                  onClick={() => onFilterChange({ discountOnly: false })}
                  className="hover:opacity-75 cursor-pointer"
                  aria-label="Remove discount filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Clear All Button */}
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer ml-1"
            >
              {currentLang === 'ta' ? 'அனைத்தையும் நீக்கு' : 'Reset All'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
