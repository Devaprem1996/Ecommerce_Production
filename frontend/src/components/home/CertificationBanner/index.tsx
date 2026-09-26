"use client";

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Leaf, Award, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CertificationCanvas } from './CertificationCanvas';

export const CertificationBanner: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // GSAP Smooth Scroll Parallax
  useEffect(() => {
    if (typeof window === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Background Image Parallax (shifts slower than page scroll)
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { yPercent: -10, scale: 1.08 },
          {
            yPercent: 10,
            scale: 1.14,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2,
            },
          }
        );
      }

      // 2. Foreground Typography Parallax (floats forward at differential velocity)
      if (textRef.current) {
        gsap.fromTo(
          textRef.current,
          { y: 35 },
          {
            y: -35,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="certification-callout"
      className="relative w-full py-10 sm:py-16 px-4 sm:px-6 lg:px-8 bg-neutral-50 dark:bg-neutral-950 font-sans select-none overflow-hidden transition-colors duration-normal"
    >
      {/* Grand Framed Editorial Canvas */}
      <div className="relative w-full max-w-[1500px] mx-auto min-h-[540px] sm:min-h-[620px] lg:min-h-[680px] rounded-[28px] sm:rounded-[40px] overflow-hidden flex items-center justify-center shadow-2xl border border-neutral-200/50 dark:border-neutral-800">

        {/* 1. Generated Macro Food Image with GSAP Parallax */}
        <div
          ref={imageRef}
          className="absolute inset-x-0 -top-[12%] h-[124%] w-full z-0 pointer-events-none select-none"
        >
          <Image
            src="/images/organic-artisan-bake.jpg"
            alt="Artisanal Organic Pure Ingredients - Yathu Arokiyagam"
            fill
            priority
            sizes="(max-width: 1500px) 100vw, 1500px"
            className="object-cover object-center select-none"
          />
        </div>

        {/* 2. Cinematic Warm Vignette & Ambient Radial Glow Overlays */}
        <div
          className="absolute inset-0 z-1 bg-gradient-to-t from-black/85 via-black/35 to-black/60 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 z-2 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(255, 175, 70, 0.22) 0%, transparent 68%)',
          }}
          aria-hidden="true"
        />

        {/* 3. Three.js Floating 3D Golden Dust & Pollen Particle Layer */}
        <CertificationCanvas />

        {/* 4. Expressive Minimalist Typography & Badging (Reference: "Adesso!" Style) */}
        <div
          ref={textRef}
          className="relative z-20 flex flex-col items-center text-center px-4 sm:px-8 max-w-4xl mx-auto my-auto"
        >
          {/* Minimalist Kicker Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-200 mb-4 sm:mb-6 shadow-lg">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {currentLang === 'ta'
                ? '100% ஆய்வக சான்றளிப்பு'
                : '100% LAB TESTED • ZERO SECRETS'}
            </span>
          </div>

          {/* Monumental Chunky Display Headline */}
          <h2 className="text-6xl sm:text-8xl md:text-9xl lg:text-[10.5vw] font-black uppercase tracking-tight text-white leading-[0.88] drop-shadow-[0_8px_32px_rgba(0,0,0,0.7)] select-none">
            {currentLang === 'ta' ? 'உண்மை!' : 'HONEST!'}
          </h2>

          {/* Playful Script Sub-line (Inspired by "you know you want a cookie") */}
          <p className="font-script text-amber-300 text-3xl sm:text-5xl md:text-6xl lg:text-7xl mt-2 sm:mt-3 tracking-normal drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] select-none">
            {currentLang === 'ta'
              ? 'உண்மையான உணவு உடலுக்குள் உணர்த்தும்.'
              : 'you know real ingredients feel different.'}
          </p>

          {/* Minimal Trust Badges: Clean, Modern, No Fake Report Papers */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mt-6 sm:mt-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-white/95 shadow-md">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentLang === 'ta' ? 'பூச்சிக்கொல்லிகள் இல்லை' : 'Zero Chemicals'}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-white/95 shadow-md">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentLang === 'ta' ? 'பாரம்பரிய மரச்செக்கு' : 'Traditional Wood-Pressed'}</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold text-white/95 shadow-md">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>{currentLang === 'ta' ? 'NABL அங்கீகாரம்' : 'NABL Certified Purity'}</span>
            </div>
          </div>

          {/* Direct Call to Action Button */}
          <Link
            href="/shop"
            className="group mt-8 sm:mt-10 inline-flex items-center gap-2.5 px-8 py-3.5 sm:py-4 rounded-full bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-2xl hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>{currentLang === 'ta' ? 'தூய உணவை சுவைக்க' : 'Taste Real Purity'}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </section>
  );
};
