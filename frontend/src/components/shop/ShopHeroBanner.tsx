"use client";

import React from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Tag, ShieldCheck } from 'lucide-react';

interface ShopHeroBannerProps {
  onCtaClick?: () => void;
}

export const ShopHeroBanner: React.FC<ShopHeroBannerProps> = ({ onCtaClick }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const scrollToGrid = () => {
    if (onCtaClick) {
      onCtaClick();
    } else {
      const el = document.getElementById('shop-catalog-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-[#F7F2E9] via-[#F4EFE5] to-[#EBE3D5] dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-950 border border-[#E5DCCF] dark:border-neutral-800 shadow-sm p-6 sm:p-10 lg:p-12 mb-8">
      {/* Subtle organic background ambient glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        
        {/* Left Side: Headline & CTA */}
        <div className="flex-1 max-w-xl text-left">
          
          {/* Farm Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border border-[#E0D7C7] dark:border-neutral-700 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{currentLang === 'ta' ? 'விவசாயிகளிடமிருந்து நேரடியாக' : 'Direct From Organic Farmers'}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-[44px] font-black font-heading text-neutral-900 dark:text-white tracking-tight leading-[1.15] mb-3">
            {currentLang === 'ta' ? (
              <>
                தேர்ந்தெடுத்த இயற்கை விளைச்சல்களுக்கு <br className="hidden sm:block" />
                <span className="text-[#183F2D] dark:text-emerald-400">30% வரை தள்ளுபடி!</span>
              </>
            ) : (
              <>
                Grab Upto 30% Off On <br className="hidden sm:block" />
                <span className="text-[#183F2D] dark:text-emerald-400">Selected Organic Harvests</span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6 max-w-lg">
            {currentLang === 'ta'
              ? 'பாரம்பரிய மரச்செக்கு எண்ணெய், காட்டுத்தேன், சிறுதானியங்கள் மற்றும் கலப்படமற்ற உணவுப் பொருட்கள் உங்கள் வீட்டு வாசலில்.'
              : 'Pure cold-pressed wood oils, unheated forest honey, heirloom native grains and stone-ground nutrition handcrafted for your family’s wellness.'}
          </p>

          {/* Action Row */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={scrollToGrid}
              className="px-6 py-3 rounded-full bg-[#183F2D] hover:bg-[#122e21] text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-emerald-950/20 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <span>{currentLang === 'ta' ? 'இப்போதே வாங்குங்கள்' : 'Buy Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <div className="flex items-center gap-2 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{currentLang === 'ta' ? '100% தூய்மை சான்றிதழ்' : '100% Lab Tested Purity'}</span>
            </div>
          </div>

        </div>

        {/* Right Side: Commercial Studio Image */}
        <div className="w-full lg:w-[460px] shrink-0 relative flex items-center justify-center">
          <div className="relative w-full max-w-[420px] aspect-[16/10] sm:aspect-[16/11] rounded-2xl overflow-hidden shadow-lg border border-white/60 dark:border-neutral-800">
            <Image
              src="/images/shop-promo-banner.jpg"
              alt="Organic farm produce basket"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 460px"
              className="object-cover object-center transform hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Subtle Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />

            {/* Floating Offer Tag */}
            <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/50 shadow-md flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[11px] font-extrabold text-neutral-900 dark:text-white">
                USE CODE: <span className="text-emerald-700 dark:text-emerald-400">ORGANIC10</span>
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
