"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';

export const PreFooterCallout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <section className="relative w-full py-20 sm:py-24 bg-neutral-950 font-sans overflow-hidden text-center text-white">
      {/* Background Scenic Landscape with Subtle Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/farmland-panorama.png"
          alt="Pollachi Golden Hour South Indian Farmlands"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-40 scale-102 hover:scale-105 transition-transform duration-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/75 to-neutral-950/60 backdrop-blur-[0.5px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        
        {/* Eyebrow Pill */}
        <div 
          data-aos="fade-up"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>{currentLang === 'ta' ? 'ஆரோக்கியத்தை இன்றே தொடங்குங்கள்' : 'Pure Health Awaits'}</span>
        </div>

        {/* Headline */}
        <h2 
          data-aos="fade-up"
          data-aos-delay="100"
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-white leading-tight mb-6 tracking-tight max-w-3xl"
        >
          {currentLang === 'ta' ? (
            <>
              உங்கள் குடும்பத்தின் நல்வாழ்வு காத்திருக்கிறது.{' '}
              <span className="liquid-text-gradient">
                இன்றே தொடங்குங்கள்!
              </span>
            </>
          ) : (
            <>
              Your Family’s Health is Waiting.{' '}
              <span className="liquid-text-gradient">
                Start Pure Living Today!
              </span>
            </>
          )}
        </h2>

        {/* Subtitle */}
        <p 
          data-aos="fade-up"
          data-aos-delay="200"
          className="text-sm sm:text-base text-neutral-300 max-w-2xl mb-8 leading-relaxed font-medium"
        >
          {currentLang === 'ta'
            ? 'கலப்படங்களை தவிர்த்து, அசல் மரச்செக்கு எண்ணெய் மற்றும் பாரம்பரிய சிறுதானியங்களை உங்கள் அன்றாட உணவில் சேர்த்து நலமோடு வாழுங்கள்.'
            : 'Join over 10,000+ conscious families across South India who have eliminated refined chemicals and switched to authentic wood-pressed oils and heritage grains.'}
        </p>

        {/* Primary Sunset CTA */}
        <div data-aos="fade-up" data-aos-delay="300" className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/shop"
            className="liquid-btn group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white font-bold text-sm sm:text-base shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-normal cursor-pointer"
          >
            <span>{currentLang === 'ta' ? 'இப்போதே ஆர்டர் செய்க' : 'Explore Pure Catalog'}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Floating Mini Badge */}
        <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-neutral-400">
          <Heart className="w-4 h-4 text-red-500 fill-current" />
          <span>{currentLang === 'ta' ? '100% தூய்மை • பூச்சிக்கொல்லி இல்லாதது • தமிழ்நாட்டு பாரம்பரியம்' : '100% Pure • Preservative Free • South Indian Tradition'}</span>
        </div>

      </div>
    </section>
  );
};
