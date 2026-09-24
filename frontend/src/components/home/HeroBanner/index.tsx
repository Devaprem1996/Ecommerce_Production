"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TrustBar } from '../TrustBar';

export const HeroBanner: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <section className="relative w-full overflow-hidden bg-white min-h-[calc(100vh-56px)] flex flex-col justify-between font-sans transition-colors duration-normal">
      {/* 1. Full-Width Panoramic Hero Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <Image
          src="/images/hero-clean-v2.jpg"
          alt="Good Food, Real Ingredients, Better Life - Nourish Organic Farm Table"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[78%_center] lg:object-right select-none"
        />
        {/* Pristine Left Side White Wash for Crisp Editorial Legibility */}
        <div className="absolute inset-y-0 left-0 w-full sm:w-[65%] lg:w-[48%] bg-gradient-to-r from-white via-white/85 to-transparent pointer-events-none" />
      </div>

      {/* 2. Overlaid Hero Content Planned on Left Side */}
      <div className="flex-1 flex items-center w-full px-6 sm:px-10 lg:px-16 xl:px-24 relative z-10 pt-8 sm:pt-14 pb-4">
        <div className="max-w-xl xl:max-w-2xl flex flex-col items-start text-left">
          
          {/* Eyebrow Label */}
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#1E4D36] dark:text-emerald-400 mb-2.5 sm:mb-3 block"
          >
            {currentLang === 'ta' ? 'உண்மையான இயற்கை பொருட்கள்' : 'MADE WITH REAL INGREDIENTS'}
          </motion.span>

          {/* Main Editorial Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[58px] font-bold font-heading text-neutral-900 leading-[1.08] tracking-tight mb-3 sm:mb-4"
          >
            {currentLang === 'ta' ? (
              <>
                நல்ல உணவு.<br />
                உண்மையான பொருட்கள்.<br />
                <span className="font-script font-normal text-[#23583C] text-4xl sm:text-5xl lg:text-[66px] xl:text-[72px] inline-flex items-center gap-3">
                  சிறந்த வாழ்க்கை. <span className="inline-block w-10 sm:w-14 h-[2.5px] bg-[#23583C] align-middle"></span>
                </span>
              </>
            ) : (
              <>
                Good Food.<br />
                Real Ingredients.<br />
                <span className="font-script font-normal text-[#23583C] text-4xl sm:text-5xl lg:text-[66px] xl:text-[72px] inline-flex items-center gap-3">
                  Better Life. <span className="inline-block w-10 sm:w-14 h-[2.5px] bg-[#23583C] align-middle"></span>
                </span>
              </>
            )}
          </motion.h1>

          {/* Subparagraph */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-neutral-600 text-sm sm:text-base leading-relaxed max-w-sm sm:max-w-lg mb-6 sm:mb-7 font-normal"
          >
            {currentLang === 'ta'
              ? 'சுத்தமான, ஆரோக்கியமான மற்றும் இயற்கையின் தலைசிறந்த பொருட்களால் தயாரிக்கப்பட்டது. உங்கள் நல்வாழ்வுக்கான உணவு வகைகளை அறிந்திடுங்கள்.'
              : "Wholesome, delicious, and made with nature's best. Discover our range of premium food & beverages crafted for your everyday well-being."}
          </motion.p>

          {/* Dual CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="flex flex-wrap items-center gap-3 sm:gap-4 w-full sm:w-auto"
          >
            {/* Primary Dark Forest Green Button */}
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-[4px] bg-[#163A26] hover:bg-[#0F291B] text-white font-semibold text-xs sm:text-sm tracking-[0.14em] uppercase transition-colors shadow-sm cursor-pointer group"
            >
              <span>{currentLang === 'ta' ? 'பொருட்களை காண்க' : 'EXPLORE PRODUCTS'}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            {/* Secondary Clean Bordered Button */}
            <Link
              href="/about"
              className="inline-flex items-center justify-center px-6 sm:px-7 py-3 sm:py-3.5 rounded-[4px] border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 font-semibold text-xs sm:text-sm tracking-[0.14em] uppercase transition-colors cursor-pointer"
            >
              <span>{currentLang === 'ta' ? 'எங்கள் கதை' : 'OUR STORY'}</span>
            </Link>
          </motion.div>

        </div>
      </div>

      {/* 3. Floating 100% Natural Circular Badge Over Bowl */}
      <div className="hidden lg:block absolute right-[20%] xl:right-[22%] bottom-28 xl:bottom-32 z-20 pointer-events-none select-none">
        <div className="relative w-18 h-18 xl:w-20 xl:h-20 rounded-full bg-[#133F2B] text-white shadow-xl flex items-center justify-center border-2 border-white">
          <svg className="absolute inset-0 w-full h-full animate-[spin_24s_linear_infinite]" viewBox="0 0 100 100">
            <path id="badgePath" d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" fill="none" />
            <text className="text-[7.5px] font-bold uppercase tracking-[2px] fill-emerald-100">
              <textPath href="#badgePath" startOffset="0%">• NO PRESERVATIVES • NO ARTIFICIAL FLAVORS •</textPath>
            </text>
          </svg>
          <div className="flex flex-col items-center justify-center text-center leading-none z-10">
            <span className="text-xs font-black tracking-tight text-white">100%</span>
            <span className="text-[7px] font-bold tracking-wider uppercase text-emerald-200 mt-0.5">NATURAL</span>
          </div>
        </div>
      </div>

      {/* 4. Integrated Trust Bar Anchored at Bottom of Hero Viewport */}
      <div className="relative z-10 w-full pb-4 sm:pb-6">
        <TrustBar />
      </div>
    </section>
  );
};
