"use client";

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CertificationCanvas } from './CertificationCanvas';
import { LazyCanvasWrapper } from '../LazyCanvasWrapper';
import { CertificationFallback } from '../CanvasFallbacks';

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
      <div className="relative w-full max-w-[1500px] mx-auto min-h-[340px] sm:min-h-[540px] lg:min-h-[680px] rounded-[28px] sm:rounded-[40px] overflow-hidden flex items-center justify-center shadow-2xl border border-neutral-200/50 dark:border-neutral-800">

        {/* 1. Generated Macro Food Image with GSAP Parallax */}
        <div
          ref={imageRef}
          className="absolute inset-x-0 -top-[12%] h-[124%] w-full z-0 pointer-events-none select-none"
        >
          <Image
            src="/images/certification-banner.png"
            alt="100% NABL Lab Tested & Certified Pure Traditional Food Ingredients - Yathu Arokiyagam"
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

        {/* 3. Three.js Floating 3D Golden Dust & Pollen Particle Layer (lazy, device-aware) */}
        <LazyCanvasWrapper
          className="absolute inset-0 w-full h-full"
          fallback={<CertificationFallback />}
        >
          <CertificationCanvas />
        </LazyCanvasWrapper>

        {/* 4. Expressive Minimalist Typography & Badging */}
        <div
          ref={textRef}
          className="relative z-20 flex flex-col items-center text-center px-4 sm:px-8 max-w-4xl mx-auto my-auto"
        >

          {/* Trust Badge Eyebrow */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-widest mb-3 sm:mb-4">
            {currentLang === 'ta' ? '100% ஆய்வக சான்றளிக்கப்பட்டது' : '100% NABL Lab Certified & Tested'}
          </span>

          {/* Monumental Display Headline */}
          <h2 className="text-4xl sm:text-7xl md:text-8xl lg:text-[7.5vw] font-black font-heading tracking-tight text-white leading-[0.95] drop-shadow-[0_8px_32px_rgba(0,0,0,0.8)] select-none">
            {currentLang === 'ta' ? 'தூய்மை & உண்மை' : 'Pure & Honest.'}
          </h2>

          {/* Authentic Quality Assurance Sub-line */}
          <p className="font-script text-amber-300 text-2xl sm:text-4xl md:text-5xl lg:text-6xl mt-2 sm:mt-3 tracking-normal drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] select-none max-w-3xl">
            {currentLang === 'ta'
              ? 'மரச்செக்கு முறையில் உருவான கலப்படமற்ற தூய்மை.'
              : 'Cold-extracted purity you can trust for your family.'}
          </p>

          {/* Direct Call to Action Button */}
          <Link
            href="/shop"
            className="group relative mt-8 sm:mt-10 inline-flex items-center gap-2.5 px-10 py-4 sm:py-5 rounded-full bg-transparent backdrop-blur-sm border border-white/50 hover:border-amber-400/80 text-white hover:text-amber-300 font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-none hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-[1.07] active:scale-95 transition-all duration-300 ease-out cursor-pointer overflow-hidden"
          >
            {/* Animated glow ring on hover */}
            <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-white/5" aria-hidden="true" />
            <span className="relative z-10">{currentLang === 'ta' ? 'தூய உணவை சுவைக்க' : 'Taste Real Purity'}</span>
            <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </div>

      </div>
    </section>
  );
};
