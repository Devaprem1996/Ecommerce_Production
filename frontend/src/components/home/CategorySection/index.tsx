"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { mockCategories } from '@/constants/mockData';

export const CategorySection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <section id="categories" className="w-full py-16 bg-white dark:bg-neutral-905 border-b border-neutral-100 dark:border-neutral-800/10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-3xl font-bold font-heading text-neutral-900 dark:text-white mb-2">
            {t('category.title', 'Shop by Category')}
          </h2>
          <div className="h-1 w-16 bg-primary-500 mx-auto rounded-full" />
        </div>

        {/* Categories Container */}
        {/* Mobile: horizontal scrollable, Desktop: 5-column grid */}
        <div 
          className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-6 sm:grid sm:grid-cols-3 lg:grid-cols-5 lg:justify-center"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Webkit hide scrollbar wrapper style */}
          <style jsx global>{`
            .scrollbar-none::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {mockCategories.map((category, index) => {
            const displayName = currentLang === 'ta' && category.nameTamil ? category.nameTamil : category.name;
            return (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                data-aos="fade-up"
                data-aos-delay={index * 80}
                className="group flex flex-col items-center text-center flex-shrink-0 w-[130px] sm:w-auto cursor-pointer focus:outline-none"
              >
                {/* Circular image wrapper with zoom and lift hover states */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-neutral-100 dark:border-neutral-800 group-hover:border-primary-400 group-hover:scale-105 group-hover:shadow-card-hover transition-all duration-normal flex items-center justify-center bg-neutral-50 dark:bg-neutral-800 mb-4">
                  <Image
                    src={category.image}
                    alt={displayName}
                    fill
                    sizes="(max-width: 576px) 120px, 150px"
                    className="object-cover transition-transform duration-slow group-hover:scale-105"
                  />
                </div>

                {/* Category Name */}
                <h4 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-primary-500 transition-colors line-clamp-1">
                  {displayName}
                </h4>

                {/* Item Count */}
                <span className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-semibold">
                  {category.itemCount} {t('category.items', 'items')}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
