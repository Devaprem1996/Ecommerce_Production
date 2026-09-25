"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { useInView, motion, AnimatePresence } from 'framer-motion';
import { Play, Leaf, MapPin, ShieldCheck } from 'lucide-react';

/* ──────────────────────────────────────────────
   Animated Count-Up (triggers on scroll-into-view)
   ────────────────────────────────────────────── */
interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
}

const CountUp: React.FC<CountUpProps> = ({ end, duration = 1200, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

/* ──────────────────────────────────────────────
   Showcase Media — rotating images
   ────────────────────────────────────────────── */
const showcaseMedia = [
  {
    src: '/images/why-choose-wood-press.jpg',
    alt: 'Traditional Marachekku wood-pressed oil extraction',
    captionEn: 'Marachekku Cold-Press Process',
    captionTa: 'மரச்செக்கு எண்ணெய் பிழிதல்',
  },
  {
    src: '/images/why-choose-product-flatlay.jpg',
    alt: 'Organic product collection flatlay',
    captionEn: 'Our Pure Product Range',
    captionTa: 'எங்கள் தூய தயாரிப்புகள்',
  },
  {
    src: '/images/why-choose-organic-farm.jpg',
    alt: 'Organic farmland in Tamil Nadu',
    captionEn: 'Direct Farm Sourcing',
    captionTa: 'நேரடி விவசாய கொள்முதல்',
  },
];

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */
export const WhyChooseUs: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % showcaseMedia.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <Leaf className="w-5 h-5" />,
      titleEn: 'Pure Wood-Pressed, Chemical-Free',
      titleTa: 'தூய மரச்செக்கு, ரசாயனம் இல்லை',
      descEn: 'Our oils are extracted using centuries-old Vaagai wood-press method — zero heat, zero solvents, retaining every micronutrient.',
      descTa: 'வாகை மரச்செக்கில் வெப்பமோ ரசாயனமோ இல்லாமல் பிழியப்படுகின்றன.',
      statVal: 100,
      statSuffix: '%',
      statLabelEn: 'Pure Cold-Pressed',
      statLabelTa: 'தூய குளிர் முறை',
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      titleEn: 'Direct From Native Tamil Nadu Farms',
      titleTa: 'நேரடி தமிழ்நாடு பண்ணை கொள்முதல்',
      descEn: 'We work with 50+ small-scale organic farmers ensuring fair trade and complete farm-to-table traceability.',
      descTa: '50+ சிறு இயற்கை விவசாயிகளிடமிருந்து நேரடியாக, நியாயமான விலையில் பெறுகிறோம்.',
      statVal: 50,
      statSuffix: '+',
      statLabelEn: 'Partner Farms',
      statLabelTa: 'இணைந்த பண்ணைகள்',
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      titleEn: 'NABL Lab Tested, Every Single Batch',
      titleTa: 'ஒவ்வொரு தொகுதியும் NABL ஆய்வக சோதனை',
      descEn: 'Every production batch undergoes rigorous NABL-certified lab testing for zero aflatoxins, free fatty acids and moisture.',
      descTa: 'ஒவ்வொரு தயாரிப்பும் NABL சான்றளிக்கப்பட்ட ஆய்வகத்தில் கடுமையான தரப்பரிசோதனை.',
      statVal: 120,
      statSuffix: '+',
      statLabelEn: 'Lab Tests Passed',
      statLabelTa: 'ஆய்வக சோதனைகள்',
    },
  ];

  return (
    <section className="relative w-full min-h-screen bg-[#F5F2EC] dark:bg-neutral-950 font-sans overflow-hidden transition-colors duration-normal flex flex-col">

      {/* ─── Full-Viewport Image with Heading Overlay ─── */}
      <div className="relative w-full flex-1 min-h-[60vh] lg:min-h-[70vh]">

        {/* Full-bleed background image */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <Image
                src={showcaseMedia[activeSlide].src}
                alt={showcaseMedia[activeSlide].alt}
                fill
                sizes="100vw"
                className="object-cover object-center"
                priority={activeSlide === 0}
              />
            </motion.div>
          </AnimatePresence>

          {/* Left gradient: parchment fade for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F5F2EC] via-[#F5F2EC]/70 to-transparent dark:from-neutral-950 dark:via-neutral-950/70 z-10 pointer-events-none w-[55%] sm:w-[50%] lg:w-[45%]" />
          {/* Bottom gradient for lower caption */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#F5F2EC]/80 dark:from-neutral-950/80 to-transparent z-10 pointer-events-none" />
        </div>

        {/* Heading positioned on the left over the gradient */}
        <div className="relative z-20 h-full flex items-center">
          <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="max-w-md lg:max-w-lg xl:max-w-xl"
            >
              <h2 className="text-[2rem] sm:text-[2.6rem] lg:text-[3.2rem] xl:text-[3.8rem] font-black font-heading text-neutral-900 dark:text-white leading-[1.06] tracking-tight">
                {currentLang === 'ta' ? (
                  <>
                    யாது அரோக்கியகம்
                    <br />
                    ஏன் உங்கள்
                    <br />
                    குடும்பத்திற்கான{' '}
                    <span className="italic font-serif font-normal">நம்பிக்கையான தேர்வு?</span>
                  </>
                ) : (
                  <>
                    Why Choose
                    <br />
                    Yathu Arokiyagam
                    <br />
                    <span className="italic font-serif font-normal">for Your Family?</span>
                  </>
                )}
              </h2>
            </motion.div>
          </div>
        </div>

        {/* Play button — centered on the image */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-2xl ml-[20%] sm:ml-[25%] lg:ml-[15%]"
          >
            <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-white ml-1" />
          </motion.div>
        </div>

        {/* Caption + slide dots at bottom right */}
        <div className="absolute bottom-0 right-0 z-20 px-6 pb-5 sm:px-10 flex items-end gap-6">
          <p className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-white/90">
            {currentLang === 'ta'
              ? showcaseMedia[activeSlide].captionTa
              : showcaseMedia[activeSlide].captionEn}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            {showcaseMedia.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                  idx === activeSlide
                    ? 'w-7 bg-neutral-900 dark:bg-white'
                    : 'w-2.5 bg-neutral-400/50 hover:bg-neutral-500'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Bottom: Three Feature Pillars ─── */}
      <div className="relative z-10 border-t border-neutral-300/60 dark:border-neutral-800 bg-[#F5F2EC] dark:bg-neutral-950">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {features.map((feat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`py-10 sm:py-12 lg:py-14 ${
                  index < 2 ? 'md:border-r border-b md:border-b-0 border-neutral-300/60 dark:border-neutral-800' : 'border-b md:border-b-0 border-neutral-300/60 dark:border-neutral-800 last:border-b-0'
                } ${index === 0 ? 'md:pr-8 lg:pr-10' : index === 1 ? 'md:px-8 lg:px-10' : 'md:pl-8 lg:pl-10'}`}
              >
                {/* Large stat number */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl sm:text-5xl font-black font-heading text-neutral-900 dark:text-white leading-none tracking-tight">
                    <CountUp end={feat.statVal} suffix={feat.statSuffix} />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    {currentLang === 'ta' ? feat.statLabelTa : feat.statLabelEn}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white leading-snug mb-3">
                  {currentLang === 'ta' ? feat.titleTa : feat.titleEn}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {currentLang === 'ta' ? feat.descTa : feat.descEn}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
