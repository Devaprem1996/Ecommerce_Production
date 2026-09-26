"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, RotateCcw, Star, ShieldCheck, Leaf, Sparkles } from 'lucide-react';
import { CategoryType } from '@/types';
import { slugify } from '@/utils/slugify';
import { FilterState, priceRanges, ratingOptions } from './FilterPillsBar';
import clsx from 'clsx';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryType[];
  categoryCounts: Record<string, number>;
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalResults: number;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  categoryCounts,
  filters,
  onFilterChange,
  onResetFilters,
  totalResults,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[1050]"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-neutral-900 z-[1060] shadow-2xl flex flex-col font-sans border-l border-neutral-200 dark:border-neutral-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="text-base font-black text-neutral-900 dark:text-white">
                  {currentLang === 'ta' ? 'அனைத்து வடிகட்டிகள்' : 'Filter Harvests'}
                </h3>
                <p className="text-xs text-neutral-500">
                  {totalResults} {currentLang === 'ta' ? 'பொருட்கள் கிடைக்கின்றன' : 'products found'}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* 1. Category Filter */}
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
                  {currentLang === 'ta' ? 'பிரிவுகள்' : 'Categories'}
                </h4>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => onFilterChange({ selectedCategory: null })}
                    className={clsx(
                      "w-full px-3 py-2 rounded-xl text-xs font-semibold text-left flex items-center justify-between transition-colors",
                      filters.selectedCategory === null
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    )}
                  >
                    <span>{currentLang === 'ta' ? 'அனைத்து வகைகள்' : 'All Categories'}</span>
                    {filters.selectedCategory === null && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>

                  {categories.map((cat) => {
                    const slug = slugify(cat.name);
                    const isSelected = filters.selectedCategory === slug;
                    const count = categoryCounts[slug] || cat.itemCount || 0;
                    const displayName = currentLang === 'ta' && cat.nameTamil ? cat.nameTamil : cat.name;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => onFilterChange({ selectedCategory: isSelected ? null : slug })}
                        className={clsx(
                          "w-full px-3 py-2 rounded-xl text-xs font-semibold text-left flex items-center justify-between transition-colors",
                          isSelected
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold"
                            : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        )}
                      >
                        <span className="truncate">{displayName}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          {count > 0 && (
                            <span className="text-[10px] text-neutral-400 font-normal">({count})</span>
                          )}
                          {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Price Filter */}
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
                  {currentLang === 'ta' ? 'விலை வரம்பு' : 'Price Range'}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {priceRanges.map((range, idx) => (
                    <button
                      key={range.label}
                      type="button"
                      onClick={() => onFilterChange({ selectedPriceRangeIndex: idx })}
                      className={clsx(
                        "p-2.5 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer",
                        filters.selectedPriceRangeIndex === idx
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100"
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Rating Stars */}
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
                  {currentLang === 'ta' ? 'வாடிக்கையாளர் மதிப்பீடு' : 'Customer Rating'}
                </h4>
                <div className="flex flex-col gap-1.5">
                  {ratingOptions.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => onFilterChange({ selectedRating: opt.value })}
                      className={clsx(
                        "w-full px-3 py-2 rounded-xl text-xs font-bold text-left flex items-center justify-between border cursor-pointer transition-colors",
                        filters.selectedRating === opt.value
                          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-300"
                          : "border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50"
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{opt.label}</span>
                      </div>
                      {filters.selectedRating === opt.value && <Check className="w-4 h-4 text-amber-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Special Badges Toggles */}
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
                  {currentLang === 'ta' ? 'சிறப்பு சலுகைகள் & சான்றுகள்' : 'Certifications & Perks'}
                </h4>
                <div className="space-y-2">
                  {/* Organic */}
                  <label className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        100% Certified Organic Only
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={filters.organicOnly}
                      onChange={(e) => onFilterChange({ organicOnly: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* Discount / Offer */}
                  <label className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        Discounted Offers Only
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={filters.discountOnly}
                      onChange={(e) => onFilterChange({ discountOnly: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* In Stock */}
                  <label className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        In Stock Only
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={filters.inStockOnly}
                      onChange={(e) => onFilterChange({ inStockOnly: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex items-center gap-3">
              <button
                type="button"
                onClick={onResetFilters}
                className="flex-1 py-2.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{currentLang === 'ta' ? 'அனைத்தையும் நீக்கு' : 'Reset'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-full bg-[#183F2D] hover:bg-[#122e21] text-white text-xs font-bold shadow-md cursor-pointer transition-colors text-center"
              >
                {currentLang === 'ta' ? 'வடிகட்டு' : `Apply (${totalResults})`}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
