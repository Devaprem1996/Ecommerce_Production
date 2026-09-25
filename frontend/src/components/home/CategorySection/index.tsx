"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { mockCategories } from '@/constants/mockData';
import apiClient from '@/lib/apiClient';
import { mapCategoryToFrontend } from '@/utils/apiMapper';
import { CategoryType } from '@/types';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800';

/* ──────────────────────────────────────────────
   Extra showcase images for the bento layout —
   we use existing /public/images assets to fill
   additional grid cells beyond the API categories.
   ────────────────────────────────────────────── */
const extraShowcaseImages = [
  '/images/why-choose-wood-press.jpg',
  '/images/why-choose-product-flatlay.jpg',
  '/images/why-choose-organic-farm.jpg',
  '/images/farmland-panorama.png',
  '/images/bestseller-sesame-oil.jpg',
  '/images/bestseller-raw-honey.jpg',
];

/* ──────────────────────────────────────────────
   Bento Grid Cell Component
   ────────────────────────────────────────────── */
const BentoCell: React.FC<{
  category: CategoryType;
  index: number;
  currentLang: string;
  span: string; // Tailwind grid span classes
  aspectClass: string;
}> = ({ category, index, currentLang, span, aspectClass }) => {
  const [imgSrc, setImgSrc] = useState(category.image || FALLBACK_IMAGE);
  const displayName = currentLang === 'ta' && category.nameTamil ? category.nameTamil : category.name;

  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className={`${span} group relative block overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer ${aspectClass}`}
    >
      {/* Background Image with cinematic zoom on hover */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imgSrc}
          alt={displayName}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
        />
      </div>

      {/* Dark gradient overlay — stronger on hover */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/20 to-black/5 group-hover:from-black/80 group-hover:via-black/30 transition-all duration-500" />

      {/* Warm accent glow on hover */}
      <div className="absolute inset-0 z-10 bg-amber-600/0 group-hover:bg-amber-600/10 transition-colors duration-500 pointer-events-none" />

      {/* Content overlay */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-4 sm:p-5 lg:p-6">

        {/* Item count label */}
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: index * 0.06 }}
          className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-white/60 mb-1.5"
        >
          {category.itemCount || 8} {currentLang === 'ta' ? 'பொருட்கள்' : 'PRODUCTS'}
        </motion.span>

        {/* Category name */}
        <div className="flex items-end justify-between gap-3">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.06 + 0.05 }}
            className="text-lg sm:text-xl lg:text-2xl font-black text-white leading-tight tracking-tight"
          >
            {displayName}
          </motion.h3>

          {/* Arrow */}
          <div className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-neutral-900 transition-all duration-300 group-hover:scale-110">
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>

      {/* Sheen light sweep on hover */}
      <div
        className="absolute inset-0 z-30 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"
        aria-hidden="true"
      />
    </Link>
  );
};

/* ──────────────────────────────────────────────
   Main Section
   ────────────────────────────────────────────── */
export const CategorySection: React.FC = () => {
  const { i18n } = useTranslation();
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

  /*
   * Build a dynamic bento grid:
   *  - Use API/mock categories as primary cells
   *  - Fill remaining cells with showcase images for visual richness
   *  - Target 6–8 cells for a compelling asymmetric layout
   */
  const bentoCategories: CategoryType[] = [...categories];

  // If we have fewer than 6 categories, add showcase "filler" categories
  if (bentoCategories.length < 6) {
    const fillerNames = [
      { en: 'Farm Fresh Produce', ta: 'புதிய பண்ணை விளைபொருட்கள்', slug: 'farm-fresh' },
      { en: 'Pure Ghee & Honey', ta: 'தூய நெய் & தேன்', slug: 'ghee-honey' },
      { en: 'Traditional Snacks', ta: 'பாரம்பரிய தின்பண்டங்கள்', slug: 'snacks' },
      { en: 'Heritage Rice', ta: 'பாரம்பரிய அரிசி', slug: 'heritage-rice' },
    ];
    const needed = 6 - bentoCategories.length;
    for (let i = 0; i < needed && i < fillerNames.length; i++) {
      bentoCategories.push({
        id: `filler-${i}`,
        name: fillerNames[i].en,
        nameTamil: fillerNames[i].ta,
        slug: fillerNames[i].slug,
        image: extraShowcaseImages[i % extraShowcaseImages.length],
        itemCount: 10 + i * 3,
      });
    }
  }

  /*
   * Desktop bento grid pattern (6 cells):
   * ┌──────────┬──────┬──────┐
   * │  TALL    │ SQ   │ SQ   │  Row 1 + Row 2 top
   * │  (0)     │ (1)  │ (2)  │
   * ├──────┬───┴──────┴──────┤
   * │ SQ   │     WIDE (4)    │  Row 2 bottom + Row 3
   * │ (3)  │                 │
   * └──────┴─────────────────┘
   *   + (5) fills bottom-left if 6 items
   *
   * Mobile: single column stacked, alternating aspect ratios
   */
  const gridSpans = [
    // Cell 0: tall left — spans 2 rows
    'col-span-1 row-span-2 sm:col-span-1 sm:row-span-2',
    // Cell 1: top-center square
    'col-span-1 row-span-1',
    // Cell 2: top-right square
    'col-span-1 row-span-1',
    // Cell 3: bottom-left square
    'col-span-1 row-span-1',
    // Cell 4: wide bottom-right — spans 2 cols
    'col-span-1 sm:col-span-2 row-span-1',
    // Cell 5: extra if present
    'col-span-1 row-span-1',
  ];

  const displayCells = bentoCategories.slice(0, 6);

  return (
    <section
      id="categories"
      className="relative w-full min-h-screen bg-[#111111] font-sans overflow-hidden flex flex-col"
    >
      {/* ─── Section Header ─── */}
      <div className="w-full px-5 sm:px-8 lg:px-12 xl:px-16 pt-14 sm:pt-16 lg:pt-20 pb-8 sm:pb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 max-w-[1600px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-500 mb-2 block">
              {currentLang === 'ta' ? 'வகைகளை ஆராயுங்கள்' : 'Explore by Category'}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-white tracking-tight leading-[1.08]">
              {currentLang === 'ta' ? (
                <>பாரம்பரிய<br />உணவு வகைகள்</>
              ) : (
                <>Traditional &<br />Organic Categories</>
              )}
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/25 text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300"
            >
              <span>{currentLang === 'ta' ? 'அனைத்தும் காண்க' : 'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ─── Bento Grid ─── */}
      <div className="flex-1 w-full px-3 sm:px-5 lg:px-8 xl:px-12 pb-10 sm:pb-14 lg:pb-16">
        <div className="max-w-[1600px] mx-auto h-full">

          {/* Desktop / Tablet: asymmetric bento grid */}
          <div className="hidden sm:grid grid-cols-3 auto-rows-[minmax(200px,1fr)] gap-2.5 sm:gap-3 lg:gap-4 h-full">
            {displayCells.map((cat, idx) => (
              <BentoCell
                key={cat.id}
                category={cat}
                index={idx}
                currentLang={currentLang}
                span={gridSpans[idx] || 'col-span-1 row-span-1'}
                aspectClass=""
              />
            ))}
          </div>

          {/* Mobile: stacked cards with alternating aspect ratios */}
          <div className="grid sm:hidden grid-cols-2 gap-2.5">
            {displayCells.map((cat, idx) => (
              <BentoCell
                key={cat.id}
                category={cat}
                index={idx}
                currentLang={currentLang}
                span={idx === 0 ? 'col-span-2' : 'col-span-1'}
                aspectClass={idx === 0 ? 'aspect-[16/9]' : 'aspect-[3/4]'}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
