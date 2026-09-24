"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles } from 'lucide-react';
import { mockCategories } from '@/constants/mockData';
import apiClient from '@/lib/apiClient';
import { mapCategoryToFrontend } from '@/utils/apiMapper';
import { CategoryType } from '@/types';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400';

// Vibrant Pastel Color Palettes matching reference design
const CATEGORY_THEMES = [
  {
    bg: 'bg-[#FFF7ED] hover:bg-[#FFEDD5] dark:bg-amber-950/20 dark:hover:bg-amber-950/30',
    border: 'border-amber-200/80 hover:border-amber-400 dark:border-amber-800/40',
    iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
    badgeBg: 'bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  },
  {
    bg: 'bg-[#ECFDF5] hover:bg-[#D1FAE5] dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30',
    border: 'border-emerald-200/80 hover:border-emerald-400 dark:border-emerald-800/40',
    iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    badgeBg: 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  },
  {
    bg: 'bg-[#F5F3FF] hover:bg-[#EDE9FE] dark:bg-purple-950/20 dark:hover:bg-purple-950/30',
    border: 'border-purple-200/80 hover:border-purple-400 dark:border-purple-800/40',
    iconBg: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
    badgeBg: 'bg-purple-100/80 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  },
  {
    bg: 'bg-[#FFF1F2] hover:bg-[#FFE4E6] dark:bg-rose-950/20 dark:hover:bg-rose-950/30',
    border: 'border-rose-200/80 hover:border-rose-400 dark:border-rose-800/40',
    iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
    badgeBg: 'bg-rose-100/80 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
  },
  {
    bg: 'bg-[#FEFCE8] hover:bg-[#FEF9C3] dark:bg-yellow-950/20 dark:hover:bg-yellow-950/30',
    border: 'border-yellow-200/80 hover:border-yellow-400 dark:border-yellow-800/40',
    iconBg: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
    badgeBg: 'bg-yellow-100/80 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300',
  },
  {
    bg: 'bg-[#F0F9FF] hover:bg-[#E0F2FE] dark:bg-sky-950/20 dark:hover:bg-sky-950/30',
    border: 'border-sky-200/80 hover:border-sky-400 dark:border-sky-800/40',
    iconBg: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400',
    badgeBg: 'bg-sky-100/80 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300',
  },
  {
    bg: 'bg-[#FFF7ED] hover:bg-[#FFEDD5] dark:bg-orange-950/20 dark:hover:bg-orange-950/30',
    border: 'border-orange-200/80 hover:border-orange-400 dark:border-orange-800/40',
    iconBg: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
    badgeBg: 'bg-orange-100/80 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  },
  {
    bg: 'bg-[#F0FDFA] hover:bg-[#CCFBF1] dark:bg-teal-950/20 dark:hover:bg-teal-950/30',
    border: 'border-teal-200/80 hover:border-teal-400 dark:border-teal-800/40',
    iconBg: 'bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400',
    badgeBg: 'bg-teal-100/80 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300',
  },
];

const CategoryCard: React.FC<{ category: CategoryType; index: number; currentLang: string }> = ({
  category,
  index,
  currentLang
}) => {
  const { t } = useTranslation();
  const [imgSrc, setImgSrc] = useState(category.image);
  const theme = CATEGORY_THEMES[index % CATEGORY_THEMES.length];
  const displayName = currentLang === 'ta' && category.nameTamil ? category.nameTamil : category.name;

  return (
    <Link
      href={`/shop?category=${category.slug}`}
      data-aos="fade-up"
      data-aos-delay={(index % 4) * 80}
      className={`group relative flex flex-col items-center text-center p-5 sm:p-6 rounded-[24px] border ${theme.bg} ${theme.border} transition-all duration-300 spring-hover shadow-xs hover:shadow-xl focus:outline-none cursor-pointer overflow-hidden`}
    >
      {/* Thumbnail Container with Smooth Scale */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-sm border-2 border-white/80 dark:border-white/20 mb-4 bg-white dark:bg-neutral-900 flex items-center justify-center flex-shrink-0">
        <Image
          src={imgSrc}
          alt={displayName}
          fill
          sizes="(max-width: 576px) 100px, 120px"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
        />
      </div>

      {/* Category Name with Kinetic Hover Expansion */}
      <h3 className="kinetic-title text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1 mb-1">
        {displayName}
      </h3>

      {/* Item Count Badge */}
      <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${theme.badgeBg} transition-transform duration-normal group-hover:scale-105`}>
        {category.itemCount || 8}+ {t('category.items', 'Products')}
      </span>
    </Link>
  );
};

export const CategorySection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [categories, setCategories] = useState<CategoryType[]>(mockCategories);

  useEffect(() => {
    apiClient.get('/api/v1/cms/categories')
      .then((res) => {
        if (res?.data?.categories && Array.isArray(res.data.categories)) {
          setCategories(res.data.categories.map(mapCategoryToFrontend));
        }
      })
      .catch((err) => {
        console.warn("Backend categories unavailable, using fallback:", err?.message || err);
      });
  }, []);

  return (
    <section id="categories" className="w-full py-12 sm:py-16 bg-[#FAFAF9] dark:bg-neutral-950 font-sans transition-colors duration-normal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Modern Section Header with Eyebrow and "View All" Link */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4" data-aos="fade-up">
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/50 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-primary-500" />
              <span>{currentLang === 'ta' ? 'வகைகளை ஆராயுங்கள்' : 'Explore by Category'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-neutral-900 dark:text-white tracking-tight">
              {currentLang === 'ta' ? 'பாரம்பரிய உணவு வகைகள்' : 'Traditional & Organic Categories'}
            </h2>
          </div>

          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            <span>{currentLang === 'ta' ? 'அனைத்து வகைகள்' : 'View All Categories'}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Vibrant Pastel Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
              currentLang={currentLang}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
