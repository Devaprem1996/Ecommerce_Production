"use client";

import React from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { CategoryType } from '@/types';
import { slugify } from '@/utils/slugify';
import clsx from 'clsx';

interface PopularCategoriesBentoProps {
  categories: CategoryType[];
  categoryCounts: Record<string, number>;
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
}

export const PopularCategoriesBento: React.FC<PopularCategoriesBentoProps> = ({
  categories,
  categoryCounts,
  selectedCategory,
  onSelectCategory,
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  // Curate top 6 categories
  const topCategories = categories.slice(0, 6);

  const handleClick = (slug: string) => {
    onSelectCategory(slug === selectedCategory ? null : slug);
    const target = document.getElementById('shop-catalog-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full my-12 pt-6 border-t border-neutral-200/60 dark:border-neutral-800">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{currentLang === 'ta' ? 'அனைத்து விருப்பங்களும்' : 'Curated Collections'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-heading text-neutral-900 dark:text-white tracking-tight">
            {currentLang === 'ta' ? 'பிரபலமான பிரிவுகள்' : 'Popular Categories'}
          </h2>
        </div>

        {selectedCategory && (
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            {currentLang === 'ta' ? 'அனைத்து பிரிவுகளையும் காட்டு' : 'View All Categories'}
          </button>
        )}
      </div>

      {/* 2-Column / 3-Column Bento Cards matching Reference Image 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {topCategories.map((cat, idx) => {
          const slug = slugify(cat.name);
          const isSelected = selectedCategory === slug;
          const count = categoryCounts[slug] || cat.itemCount || 12;
          const displayName = currentLang === 'ta' && cat.nameTamil ? cat.nameTamil : cat.name;

          return (
            <motion.div
              key={cat.id || idx}
              whileHover={{ y: -3, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleClick(slug)}
              className={clsx(
                "group flex items-center gap-4 p-4 rounded-2xl sm:rounded-3xl border transition-all duration-200 cursor-pointer shadow-2xs",
                isSelected
                  ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20"
                  : "bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 hover:border-emerald-500/30 hover:shadow-md"
              )}
            >
              {/* Category Thumbnail */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#F6F5F2] dark:bg-neutral-800 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                <Image
                  src={cat.image || '/images/category-oils.png'}
                  alt={displayName}
                  fill
                  sizes="64px"
                  className="object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Title & Count */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {displayName}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {count} {currentLang === 'ta' ? 'பொருட்கள் தயார்' : 'Items Available'}
                </p>
              </div>

              {/* Right Arrow Icon */}
              <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0",
                isSelected
                  ? "bg-emerald-600 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950 group-hover:text-emerald-600"
              )}>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </motion.div>
          );
        })}
      </div>

    </section>
  );
};
