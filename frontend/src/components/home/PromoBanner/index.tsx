"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { Sparkles, ChevronLeft, ChevronRight, Copy, Check, Quote } from 'lucide-react';
import { toast } from '@/components/ui/Toast';

export const PromoBanner: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [copied, setCopied] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const stories = [
    {
      quoteEn: "Switching to Yathu Arokiyagam's wood-pressed groundnut and sesame oils brought back the authentic village aroma to our kitchen. Zero bloating, pure energy.",
      quoteTa: "யாத்து ஆரோக்கியகத்தின் மரச்செக்கு நல்லெண்ணெய் மற்றும் கடலை எண்ணெய்க்கு மாறிய பிறகு எங்கள் வீட்டு சமையலில் அசல் கிராமத்து மணம் வீசுகிறது.",
      authorEn: "Meenakshi Sundaram",
      authorTa: "மீனாட்சி சுந்தரம்",
      locationEn: "Verified Customer • Chennai",
      locationTa: "வாடிக்கையாளர் • சென்னை",
      image: "/images/customer-meenakshi.jpg",
    },
    {
      quoteEn: "Their unpolished Karuppu Kavuni rice and millet noodles have become our family's weekly ritual. Honest quality you can truly feel and taste.",
      quoteTa: "இவர்களின் கருப்புக் கவுனி அரிசியும் சிறுதானிய நூடுல்ஸும் எங்கள் உணவில் நிரந்தரமாகிவிட்டது. கலப்படமில்லாத உண்மைத்தன்மையை உணர முடிகிறது.",
      authorEn: "Dr. K. Raghavan",
      authorTa: "டாக்டர் கே. ராகவன்",
      locationEn: "Holistic Health Practitioner • Coimbatore",
      locationTa: "மருத்துவர் • கோயம்புத்தூர்",
      image: "/images/customer-raghavan.jpg",
    },
  ];

  const handleCopyCode = () => {
    navigator.clipboard.writeText('FIRST20');
    setCopied(true);
    toast.success(
      currentLang === 'ta'
        ? 'தள்ளுபடி குறியீடு நகலெடுக்கப்பட்டது!'
        : 'Promo code FIRST20 copied!'
    );
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStory = stories[activeIndex];

  return (
    <section className="relative w-full py-16 sm:py-20 bg-[#FFF5ED] dark:bg-neutral-900/80 font-sans overflow-hidden transition-colors duration-normal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Authentic Story & Controls */}
          <div className="lg:col-span-7 flex flex-col items-start text-left" data-aos="fade-up">
            
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{currentLang === 'ta' ? 'உண்மையான குடும்பங்கள் • உண்மையான தூய்மை' : 'Real Families. Real Wellness.'}</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-neutral-900 dark:text-white leading-tight mb-6">
              {currentLang === 'ta' ? (
                <>
                  பாரம்பரிய உணவு.{' '}
                  <span className="text-orange-600 dark:text-orange-400">
                    நலமான வாழ்க்கை.
                  </span>
                </>
              ) : (
                <>
                  Real Families.{' '}
                  <span className="text-orange-600 dark:text-orange-400">
                    Real Wellness.
                  </span>
                </>
              )}
            </h2>

            {/* Quote Block */}
            <div className="relative pl-6 border-l-3 border-orange-500 mb-6">
              <Quote className="w-7 h-7 text-orange-400/40 absolute -top-3 -left-3.5 fill-current" />
              <p className="text-base sm:text-lg text-neutral-700 dark:text-neutral-250 italic leading-relaxed">
                &ldquo;{currentLang === 'ta' ? currentStory.quoteTa : currentStory.quoteEn}&rdquo;
              </p>
            </div>

            {/* Author Attribution */}
            <div className="flex flex-col mb-8">
              <span className="text-base font-bold text-neutral-900 dark:text-white">
                {currentLang === 'ta' ? currentStory.authorTa : currentStory.authorEn}
              </span>
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                {currentLang === 'ta' ? currentStory.locationTa : currentStory.locationEn}
              </span>
            </div>

            {/* Controls & Promo Code Pill */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              {/* Slide Navigation Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev === 0 ? stories.length - 1 : prev - 1))}
                  className="w-10 h-10 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors cursor-pointer shadow-xs"
                  aria-label="Previous story"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev === stories.length - 1 ? 0 : prev + 1))}
                  className="w-10 h-10 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 flex items-center justify-center hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors cursor-pointer shadow-xs"
                  aria-label="Next story"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Promo Code Badge */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-neutral-800 border border-orange-200 dark:border-orange-900/50 shadow-xs">
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                  {currentLang === 'ta' ? '20% தள்ளுபடி:' : '20% OFF First Order:'}
                </span>
                <span className="text-xs font-black tracking-wider text-orange-600 dark:text-orange-400 font-mono">
                  FIRST20
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1 rounded text-neutral-500 hover:text-orange-600 cursor-pointer ml-1"
                  aria-label="Copy promo code"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Organic Curved Peach Arch & Cutout Photo */}
          <div className="lg:col-span-5 relative flex items-center justify-center" data-aos="fade-left">
            <div className="relative w-full max-w-[380px] aspect-[4/5] flex items-center justify-center">
              
              {/* Organic Liquid Morphing Orange Backdrop Shape */}
              <div 
                className="absolute inset-x-2 inset-y-0 animate-liquid-morph bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-400 shadow-xl opacity-90"
              />

              {/* Cutout Portrait Image with Fluid Outline */}
              <div className="relative z-10 w-[90%] h-[92%] animate-liquid-morph-slow overflow-hidden border-3 border-white/60 shadow-inner bg-white">
                <Image
                  src={currentStory.image}
                  alt="Happy Customer"
                  fill
                  sizes="(max-width: 768px) 320px, 380px"
                  className="object-cover object-center transition-transform duration-slow hover:scale-108"
                />
              </div>

              {/* Floating Satisfaction Pill Badge */}
              <div className="absolute top-8 -right-4 z-20 animate-float">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex flex-col items-center justify-center shadow-xl border-3 border-white text-center leading-none">
                  <span className="text-base font-black">98%</span>
                  <span className="text-[9px] font-bold uppercase tracking-tight mt-0.5">Satisfaction</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
