"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { TorusCanvas } from './TorusCanvas';

export const InfiniteMarqueeRibbon: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  // Track 1: Solid High-Contrast Lead Anthem (Moving Left)
  const track1ItemsEn = [
    'GOOD FOOD',
    'REAL INGREDIENTS',
    'BETTER LIFE',
    'ZERO REFINEMENT',
  ];
  const track1ItemsTa = [
    'நல்ல உணவு',
    'உண்மையான பொருட்கள்',
    'சிறந்த வாழ்க்கை',
    'கலப்படமற்ற தரம்',
  ];

  // Track 2: Massive Kinetic Hollow Outline (Moving Right / Reverse)
  const track2ItemsEn = [
    'UNADULTERATED',
    'TRADITIONAL SOUL',
    'MODERN LIVING',
    'YATHU AROKIYAGAM',
  ];
  const track2ItemsTa = [
    'தூய நல்வாழ்வு',
    'பாரம்பரிய வேர்கள்',
    'இயற்கை வாழ்வியல்',
    'யாத்து ஆரோக்கியகம்',
  ];

  // Track 3: Deep Ambient Translucent Layer (Moving Left)
  const track3ItemsEn = [
    'HONEST ORIGINS',
    'UNBLEACHED',
    'COLD-PRESSED',
    'HEIRLOOM SEEDS',
    '100% PURE',
  ];
  const track3ItemsTa = [
    'பாரம்பரிய விதைகள்',
    'மரச்செக்கு முறை',
    'இயற்கை விவசாயம்',
    '100% தூய்மை',
  ];

  const track1 = currentLang === 'ta' ? track1ItemsTa : track1ItemsEn;
  const track2 = currentLang === 'ta' ? track2ItemsTa : track2ItemsEn;
  const track3 = currentLang === 'ta' ? track3ItemsTa : track3ItemsEn;

  // Quadruple arrays for seamless infinite CSS looping across all screens
  const quadruple = <T,>(arr: T[]): T[] => [...arr, ...arr, ...arr, ...arr];

  return (
    <section
      id="brand-manifesto-ribbon"
      className="relative w-full overflow-hidden select-none py-16 sm:py-24 lg:py-32 min-h-[75vh] sm:min-h-[82vh] lg:min-h-[88vh] flex flex-col justify-center items-center font-sans shadow-2xl"
      style={{
        background:
          'radial-gradient(ellipse at 50% 50%, #FF8238 0%, #F56314 36%, #E04800 68%, #B83200 100%)',
      }}
    >
      {/* 1. Luminous Peach-Amber Ambient Glow Matching Reference GIF */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-screen opacity-65 z-1"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(255, 220, 180, 0.5) 0%, transparent 68%)',
        }}
        aria-hidden="true"
      />

      {/* 2. Three.js Interactive 3D Torus Ring Backdrop */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <TorusCanvas />
      </div>

      {/* 3. Soft Top & Bottom Vignettes (Gentle Transition, No Harsh Black) */}
      <div
        className="absolute top-0 inset-x-0 h-16 sm:h-24 bg-gradient-to-b from-black/20 via-black/5 to-transparent z-20 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 inset-x-0 h-16 sm:h-24 bg-gradient-to-t from-black/25 via-black/8 to-transparent z-20 pointer-events-none"
        aria-hidden="true"
      />

      {/* 4. Left & Right Warm Vignette Fades */}
      <div
        className="absolute inset-y-0 left-0 w-16 sm:w-28 lg:w-44 bg-gradient-to-r from-[#B83200]/80 via-[#B83200]/30 to-transparent z-25 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute inset-y-0 right-0 w-16 sm:w-28 lg:w-44 bg-gradient-to-l from-[#B83200]/80 via-[#B83200]/30 to-transparent z-25 pointer-events-none"
        aria-hidden="true"
      />

      {/* 5. Taller Cinematic Massive Kinetic Typography Stack */}
      <div className="relative z-20 w-full flex flex-col gap-4 sm:gap-6 lg:gap-8 my-auto">
        {/* Track 1: Solid High-Contrast Lead Track (Scrolls Left) */}
        <div className="overflow-hidden w-full flex">
          <div className="animate-marquee flex items-center whitespace-nowrap">
            {quadruple(track1).map((item, idx) => (
              <span
                key={`t1-${idx}`}
                className="inline-flex items-center text-4xl sm:text-6xl md:text-7xl lg:text-[7.5vw] xl:text-[8vw] font-black uppercase tracking-tighter text-white leading-none pr-8 sm:pr-12 lg:pr-16 drop-shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-transform duration-300 hover:scale-[1.02]"
              >
                <span>{item}</span>
                <span className="text-[#FFD8B3] text-3xl sm:text-5xl lg:text-[4.5vw] ml-8 sm:ml-12 lg:ml-16 font-light select-none">
                  •
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Track 2: Massive Hollow Outline Track (Counter-Scrolls Right) */}
        <div className="overflow-hidden w-full flex">
          <div className="animate-marquee-reverse flex items-center whitespace-nowrap">
            {quadruple(track2).map((item, idx) => (
              <span
                key={`t2-${idx}`}
                className="inline-flex items-center text-5xl sm:text-7xl md:text-8xl lg:text-[9.2vw] xl:text-[10vw] font-black uppercase tracking-tighter kinetic-text-stroke leading-none pr-10 sm:pr-14 lg:pr-20 select-none transition-all duration-300 hover:scale-[1.02]"
              >
                <span>{item}</span>
                <span className="text-white/45 text-4xl sm:text-6xl lg:text-[5.5vw] ml-10 sm:ml-14 lg:ml-20 font-light select-none">
                  /
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Track 3: Ambient Translucent Deep Layer (Scrolls Left) */}
        <div className="overflow-hidden w-full flex">
          <div className="animate-marquee-slow flex items-center whitespace-nowrap">
            {quadruple(track3).map((item, idx) => (
              <span
                key={`t3-${idx}`}
                className="inline-flex items-center text-3xl sm:text-5xl md:text-6xl lg:text-[5.8vw] xl:text-[6.5vw] font-black uppercase tracking-tighter text-white/35 hover:text-white/65 leading-none pr-7 sm:pr-10 lg:pr-14 transition-colors duration-300 select-none"
              >
                <span>{item}</span>
                <span className="text-white/25 text-2xl sm:text-4xl lg:text-[3.5vw] ml-7 sm:ml-10 lg:ml-14 font-light select-none">
                  •
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
