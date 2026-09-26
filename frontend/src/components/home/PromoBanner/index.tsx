"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Sparkles, Copy, Check, ArrowRight, ShieldCheck, Heart, Award } from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { VerticalStoryMarquee } from './VerticalStoryMarquee';

export const PromoBanner: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('FIRST20');
    setCopied(true);
    toast.success(
      currentLang === 'ta'
        ? 'தள்ளுபடி குறியீடு FIRST20 நகலெடுக்கப்பட்டது!'
        : 'Promo code FIRST20 copied to clipboard!'
    );
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="real-families-spotlight"
      className="relative w-full py-16 sm:py-24 font-sans overflow-hidden select-none transition-colors duration-normal"
    >
      {/* 1. Panoramic Farm Background Image with Warm Golden-Hour Lighting */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        {/* Scenic Farmland Panorama Image */}
        <Image
          src="/images/farmland-panorama.png"
          alt="Traditional Organic Farmland Heritage"
          fill
          priority={false}
          sizes="100vw"
          className="object-cover object-center opacity-30 dark:opacity-20 select-none"
        />

        {/* Luminous Warm Golden/Peach Wash Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF9F3]/95 via-[#FFF4EA]/90 to-[#FFEAD8]/95 dark:from-[#0B0D13]/96 dark:via-[#12151D]/92 dark:to-[#0B0D13]/96" />

        {/* Ambient Sunbeam Glow Behind Header & Cards */}
        <div
          className="absolute -top-24 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-amber-400/25 via-orange-400/15 to-transparent blur-[120px] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-amber-500/20 via-orange-500/10 to-transparent blur-[130px] pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* 2. Torn Paper Edge Graphic Motif on Top-Left Corner (Inspired by Reference 1) */}
      <div
        className="absolute top-0 left-0 w-28 sm:w-44 h-16 sm:h-24 pointer-events-none opacity-20 dark:opacity-10 overflow-hidden z-1"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 200 100"
          preserveAspectRatio="none"
          className="w-full h-full fill-amber-900 dark:fill-white"
        >
          <path d="M0,0 L200,0 C170,30 185,50 150,45 C120,40 130,75 90,65 C60,55 70,95 30,85 C15,80 5,95 0,100 Z" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Bento Grid: Left Hero & Offer Stack (7 Cols) + Right Vertical Loop (5 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

          {/* ─── LEFT COLUMN: Modern Bento Story & Promo Stack (7 Cols) ─── */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            {/* Header: Script Accent + Monumental Headline (Inspired by Reference 3) */}
            <div className="flex flex-col items-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 dark:bg-amber-400/15 border border-amber-500/30 text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-3 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>
                  {currentLang === 'ta'
                    ? 'உண்மையான குடும்பங்கள் • உண்மையான தூய்மை'
                    : 'Real Families • Real Wellness'}
                </span>
              </div>

              <span className="font-script text-amber-600 dark:text-amber-400 text-3xl sm:text-4xl -mb-1 block font-semibold">
                {currentLang === 'ta' ? 'பாரம்பரியத்தின் சுவை' : 'Rooted in Heritage'}
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black uppercase tracking-tight text-neutral-900 dark:text-white leading-[1.08]">
                {currentLang === 'ta' ? (
                  <>
                    பாரம்பரிய உணவு.{' '}
                    <span className="text-[#D9481E] dark:text-[#FF7A1A]">
                      நலமான குடும்பம்.
                    </span>
                  </>
                ) : (
                  <>
                    NOURISH YOUR HOME WITH{' '}
                    <span className="text-[#D9481E] dark:text-[#FF7A1A]">
                      PURE TRADITION.
                    </span>
                  </>
                )}
              </h2>

              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 mt-3 font-normal max-w-xl leading-relaxed">
                {currentLang === 'ta'
                  ? 'மரச்செக்கு நல்லெண்ணெய், ஆழ்காட்டுத் தேன் மற்றும் தீட்டப்படாத சிறுதானியங்கள் மூலம் ஆரோக்கியமான வாழ்க்கையைத் தொடங்குங்கள்.'
                  : 'Over 10,000+ conscious families across South India have restored authentic village nutrition to their daily meals with zero chemicals and zero preservatives.'}
              </p>
            </div>

            {/* Asymmetrical Bento Row: Feature Story Card + High-Contrast Promo Card */}
            <div className="relative grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-5 mt-2">

              {/* Bento Card 1: Family Spotlight Image Card (7 Cols) */}
              <div className="sm:col-span-7 relative rounded-[26px] overflow-hidden bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 min-h-[260px] flex flex-col justify-end p-5 group shadow-xl">
                {/* Background Image */}
                <Image
                  src="/images/why-choose-organic-farm.jpg"
                  alt="Traditional Family Farm Heritage"
                  fill
                  sizes="(max-width: 640px) 100vw, 420px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90"
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

                {/* Overlaid Details */}
                <div className="relative z-20 flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-1">
                    {currentLang === 'ta' ? 'பாரம்பரிய உழவு முறை' : 'DIRECT FROM NATIVE FARMS'}
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white leading-snug">
                    {currentLang === 'ta'
                      ? '100% தூய மரச்செக்கு & இயற்கை தானியங்கள்'
                      : 'Unrefined, Cold-Extracted, Chemical-Free'}
                  </h3>

                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/20 text-xs text-neutral-200">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      {currentLang === 'ta' ? 'ஆய்வக சான்றளிக்கப்பட்டது' : 'NABL Certified'}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      {currentLang === 'ta' ? '10,000+ இல்லங்கள்' : '10k+ Homes'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bento Card 2: High-Contrast Promo Offer Card (5 Cols) (Inspired by Reference 2) */}
              <div className="sm:col-span-5 relative rounded-[26px] bg-gradient-to-br from-[#E05326] via-[#D34015] to-[#B8320A] p-5 sm:p-6 flex flex-col justify-between text-white shadow-2xl overflow-hidden group">
                {/* Subtle Geometric Graphic Aura */}
                <div
                  className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/15 blur-xl pointer-events-none"
                  aria-hidden="true"
                />

                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider mb-2 backdrop-blur-xs">
                    {currentLang === 'ta' ? 'வரவேற்புச் சலுகை' : 'LIMITED OFFER'}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black tracking-tight leading-none mb-1 drop-shadow-sm">
                    20% OFF
                  </div>
                  <p className="text-xs text-white/90 leading-snug">
                    {currentLang === 'ta'
                      ? 'உங்கள் முதல் ஆர்டருக்கு சிறப்புத் தள்ளுபடி'
                      : 'On your first order with free delivery'}
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 mt-4 pt-3 border-t border-white/25">
                  {/* Coupon Copy Pill */}
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-sm border border-white/20 text-xs shadow-inner">
                    <span className="font-mono font-black tracking-wider text-amber-200">
                      FIRST20
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      aria-label="Copy promo code FIRST20"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-white hover:text-amber-200 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>{currentLang === 'ta' ? 'நகலெடுக்கப்பட்டது' : 'Copied'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{currentLang === 'ta' ? 'நகலெடு' : 'Copy'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Shop Now CTA */}
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-full bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg group-hover:scale-[1.01]"
                  >
                    <span>{currentLang === 'ta' ? 'ஷாப்பிங் செய்ய' : 'Shop Now'}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

              </div>

              {/* Floating Overlapping Circular Badge (Inspired by Reference 2) */}
              <div
                className="hidden sm:flex absolute -bottom-5 -right-3 lg:-right-5 z-30 w-24 h-24 rounded-full bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border-4 border-amber-400 dark:border-amber-500 shadow-2xl flex-col items-center justify-center text-center p-2 transform rotate-6 hover:rotate-0 transition-transform duration-300 pointer-events-none"
              >
                <Award className="w-4 h-4 text-amber-500 mb-0.5" />
                <span className="text-base font-black leading-none">98%</span>
                <span className="text-[9px] font-bold uppercase tracking-tighter text-neutral-600 dark:text-neutral-400 mt-0.5">
                  Satisfaction
                </span>
              </div>

            </div>

          </div>

          {/* ─── RIGHT COLUMN: Automatic Vertical Story Loop (5 Cols) (Inspired by Reference 2 Vertical Marquee) ─── */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-800 dark:text-neutral-200">
                {currentLang === 'ta' ? 'நேரலை வாடிக்கையாளர் கருத்துகள்' : 'Verified Community Reviews'}
              </span>
              <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                {currentLang === 'ta' ? 'நிறுத்த தொடவும்' : 'Hover to pause'}
              </span>
            </div>

            {/* Vertical Marquee Component */}
            <VerticalStoryMarquee />
          </div>

        </div>
      </div>
    </section>
  );
};
