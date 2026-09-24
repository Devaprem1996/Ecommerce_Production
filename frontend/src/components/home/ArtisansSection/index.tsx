"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Star, Sparkles, ArrowRight } from 'lucide-react';

export const ArtisansSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const artisans = [
    {
      nameEn: 'Murugesan Perumal',
      nameTa: 'முருகேசன் பெருமாள்',
      roleEn: 'Master Vaagai Wood Presser',
      roleTa: 'மரச்செக்கு தலைமை கைவினைஞர்',
      rating: '4.9',
      reviews: '1,420',
      image: '/images/artisan-murugesan.jpg',
    },
    {
      nameEn: 'Selvaraj Thangaraj',
      nameTa: 'செல்வராஜ் தங்கராஜ்',
      roleEn: 'Heritage Seed Preserver',
      roleTa: 'பாரம்பரிய விதை காப்பாளர்',
      rating: '4.9',
      reviews: '980',
      image: '/images/artisan-selvaraj.jpg',
    },
    {
      nameEn: 'Kavitha Ramasamy',
      nameTa: 'கவிதா ராமசாமி',
      roleEn: 'Native Millet Miller',
      roleTa: 'சிறுதானிய தயாரிப்பு நிபுணர்',
      rating: '4.8',
      reviews: '1,150',
      image: '/images/artisan-kavitha.jpg',
    },
    {
      nameEn: 'Nagarajan Sundaram',
      nameTa: 'நாகராஜன் சுந்தரம்',
      roleEn: 'NABL Quality Inspector',
      roleTa: 'ஆய்வக தர ஆலோசகர்',
      rating: '5.0',
      reviews: '890',
      image: '/images/artisan-nagarajan.jpg',
    },
  ];

  return (
    <section className="w-full py-12 sm:py-16 bg-white dark:bg-neutral-950 font-sans transition-colors duration-normal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4" data-aos="fade-up">
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/50 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-primary-500" />
              <span>{currentLang === 'ta' ? 'பாரம்பரிய கைவினைஞர்கள்' : 'The Hands Behind Your Food'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-neutral-900 dark:text-white tracking-tight">
              {currentLang === 'ta' ? 'எங்கள் பாரம்பரிய விவசாயிகள் & தயாரிப்பாளர்கள்' : 'Meet Our Traditional Artisans & Farmers'}
            </h2>
          </div>

          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            <span>{currentLang === 'ta' ? 'அனைவரையும் காண்க' : 'View All Artisans'}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Featured Heritage Spotlight Banner */}
        <div 
          data-aos="fade-up"
          className="relative w-full rounded-3xl overflow-hidden mb-10 sm:mb-12 shadow-lg border border-amber-200/50 dark:border-amber-900/30 min-h-[220px] sm:min-h-[280px] flex items-end p-6 sm:p-10 group"
        >
          <Image
            src="/images/artisans-banner.png"
            alt="Traditional Heritage Farmers & Artisans"
            fill
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="object-cover object-center group-hover:scale-103 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/45 to-transparent" />
          
          <div className="relative z-10 max-w-2xl text-white">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/25 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 backdrop-blur-sm">
              {currentLang === 'ta' ? 'அசல் தலைமுறை அறிவு' : 'Generational Wisdom'}
            </span>
            <h3 className="text-xl sm:text-3xl font-extrabold font-heading text-white leading-tight mb-2">
              {currentLang === 'ta' 
                ? 'இயற்கை வழி வேளாண்மை, இடைத்தரகர்கள் இல்லாத நேரடி உறவு' 
                : 'Direct From Tamil Nadu Organic Farmers To Your Table'}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed">
              {currentLang === 'ta'
                ? 'எங்கள் ஒவ்வொரு மரச்செக்கு எண்ணெயும் பாரம்பரிய முறையில் விதைகளை பாதுகாக்கும் உண்மையான விவசாயிகளால் தயாரிக்கப்படுகிறது.'
                : 'Preserving over 25+ indigenous seed varieties with zero pesticide cultivation and slow wood-pressed extraction.'}
            </p>
          </div>
        </div>

        {/* 4-Column Vibrant Solid/Gradient Portrait Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {artisans.map((artisan, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 80}
              className="group flex flex-col items-center text-center p-3.5 sm:p-4 rounded-[22px] bg-white dark:bg-neutral-900 border border-neutral-150/90 dark:border-neutral-800 shadow-xs hover:shadow-xl transition-all duration-300 spring-hover"
            >
              {/* Authentic Portrait Frame */}
              <div className="relative w-full aspect-square rounded-[18px] overflow-hidden mb-4 shadow-sm border border-neutral-100 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-850">
                <Image
                  src={artisan.image}
                  alt={currentLang === 'ta' ? artisan.nameTa : artisan.nameEn}
                  fill
                  sizes="(max-width: 576px) 160px, 240px"
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Name */}
              <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1 mb-0.5">
                {currentLang === 'ta' ? artisan.nameTa : artisan.nameEn}
              </h3>

              {/* Role */}
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 line-clamp-1">
                {currentLang === 'ta' ? artisan.roleTa : artisan.roleEn}
              </p>

              {/* Star Rating Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold mt-auto">
                <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                <span>{artisan.rating}</span>
                <span className="text-[10px] font-normal text-neutral-500 dark:text-neutral-400">
                  ({artisan.reviews})
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
