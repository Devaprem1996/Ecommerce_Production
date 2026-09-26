"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform } from 'framer-motion';
import { PreFooterCanvas } from './PreFooterCanvas';
import { BrandWatermarkLoop } from './BrandWatermarkLoop';
import { toast } from '@/components/ui/Toast';
import { ArrowUpRight } from 'lucide-react';

const FacebookIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TikTokIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-6.61 6.32 6.34 6.34 0 0 0 10.86 4.47A6.33 6.33 0 0 0 18 15.65V9.06a8.27 8.27 0 0 0 4.84 1.56v-3.5a4.84 4.84 0 0 1-3.25-.43z" />
  </svg>
);

export const PreFooterCallout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth scroll parallax for background and center content
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.0]);
  const textY = useTransform(scrollYProgress, [0, 1], ['20px', '-20px']);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error(
        currentLang === 'ta'
          ? 'தயவுசெய்து சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்'
          : 'Please enter a valid email address'
      );
      return;
    }

    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      setEmail('');
      toast.success(
        currentLang === 'ta'
          ? 'நன்றி! எங்கள் இயற்கை குடும்பத்தில் இணைந்ததற்கு வாழ்த்துகள்.'
          : 'Thank you! You are now subscribed to Yathu Arokiyagam updates.'
      );
    }, 600);
  };

  const marqueePhrases = [
    'NEW MEMBERS GET 15% OFF THEIR FIRST HARVEST',
    "USE CODE 'NATURE15'",
    '100% WOOD-PRESSED OILS',
    'RAW WILD MOUNTAIN HONEY',
    'TRADITIONAL HERITAGE GRAINS',
    'DIRECT FROM SOUTH INDIAN FARMS',
  ];

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen lg:h-screen flex flex-col justify-between overflow-hidden bg-neutral-950 font-sans select-none text-white z-20"
      aria-label="Scenic Nature Callout and Footer"
    >
      {/* 1. Background Panoramic Landscape with Scroll Parallax */}
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute -top-[8%] -bottom-[8%] inset-x-0 z-0 will-change-transform pointer-events-none"
      >
        <Image
          src="/images/scenic-nature-prefooter.jpg"
          alt="Majestic panoramic misty mountain wilderness and South Indian organic hillside farmlands"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter contrast-[1.08] brightness-[0.98]"
        />
        {/* Soft daylight sky balance vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/85" />
      </motion.div>

      {/* 2. Top Running Monospace Marquee Ribbon (Matching Reference Design) */}
      <div className="relative z-30 w-full bg-black py-2.5 sm:py-3 border-b border-white/10 overflow-hidden shadow-md">
        <div className="flex w-max animate-marquee whitespace-nowrap">
          {[...Array(4)].map((_, loopIdx) => (
            <div key={loopIdx} className="flex items-center gap-8 sm:gap-12 mx-4 sm:mx-6">
              {marqueePhrases.map((phrase, pIdx) => (
                <div key={pIdx} className="flex items-center gap-8 sm:gap-12">
                  <span className="text-[11px] sm:text-xs font-mono font-bold tracking-widest text-neutral-200 uppercase">
                    {phrase}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-400 shrink-0" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Three.js 3D Interactive WebGL Canvas (Floating Honey Drops, Botanical Leaves, Golden Pollen) */}
      <PreFooterCanvas />

      {/* 4. Cinematic Brand Watermark Loop */}
      <BrandWatermarkLoop />

      {/* 5. Center Heroic Scenic Callout (ADVENTURE IS CALLING style) */}
      <motion.div
        style={{ y: textY }}
        className="relative z-25 flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-12 pb-16 lg:py-0"
      >
        {/* Main Headline */}
        <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-[84px] font-black uppercase tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)] leading-[1.05] max-w-4xl">
          {currentLang === 'ta' ? 'இயற்கை உங்களை அழைக்கிறது' : 'PURITY IS CALLING'}
        </h2>

        {/* Brand Subtitle / Callout Tag */}
        <p className="mt-3 sm:mt-4 text-xs sm:text-sm md:text-base font-semibold uppercase tracking-[0.25em] text-neutral-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {currentLang === 'ta'
            ? 'பாரம்பரிய மரச்செக்கு எண்ணெய் & இயற்கை அமுதம்'
            : 'Traditional Wood-Pressed Oils & Organic Mountain Harvests'}
        </p>

        {/* Central Callout CTA Button (Electric Royal Accent matching Reference) */}
        <div className="mt-6 sm:mt-8">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-8 sm:px-10 py-3 sm:py-3.5 rounded-md bg-[#2528E5] hover:bg-[#1E21BF] active:scale-95 text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-[0_10px_30px_rgba(37,40,229,0.5)] transition-all duration-200 cursor-pointer"
          >
            <span>{currentLang === 'ta' ? 'யாத்து உடன் இணையுங்கள்' : 'JOIN YATHU'}</span>
          </Link>
        </div>
      </motion.div>

      {/* 6. Integrated Footer Section (Directly Overlaid on Landscape Foreground) */}
      <div className="relative z-30 w-full bg-gradient-to-t from-black via-black/90 to-transparent pt-20 sm:pt-28 pb-8 sm:pb-10 px-4 sm:px-8 lg:px-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
          
          {/* Left Column: Newsletter Subscription Box (Exact Reference Recreation) */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mb-2">
              {currentLang === 'ta' ? 'எங்கள் செய்திமடலில் இணையுங்கள்' : 'SUBSCRIBE TO OUR NEWSLETTER'}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300/90 leading-relaxed mb-5 max-w-md">
              {currentLang === 'ta'
                ? 'அறுவடை செய்திகள், புதிய தயாரிப்புகள் மற்றும் ஆரோக்கிய குறிப்புகளை உடனுக்குடன் பெறுங்கள்.'
                : 'Stay in the know of all the Yathu Arokiyagam seasonal harvests and community initiatives.'}
            </p>

            {/* Newsletter Input Box matching reference design */}
            <form onSubmit={handleSubscribe} className="w-full max-w-md flex flex-col sm:flex-row items-stretch border border-white/40 focus-within:border-white transition-colors bg-black/40 backdrop-blur-md">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={currentLang === 'ta' ? 'உங்கள் மின்னஞ்சல்' : 'YOUR E-MAIL'}
                aria-label="Email Address"
                className="w-full px-4 py-3 bg-transparent text-xs sm:text-sm text-white placeholder-neutral-400 focus:outline-none uppercase tracking-wider font-mono"
              />
              <button
                type="submit"
                disabled={isSubscribing}
                className="px-6 py-3 bg-[#93C5FD] hover:bg-[#BFDBFE] active:bg-[#60A5FA] text-neutral-950 font-bold text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isSubscribing ? '...' : currentLang === 'ta' ? 'பதிவுசெய்க' : 'SUBSCRIBE'}
              </button>
            </form>

            {/* Copyright */}
            <div className="mt-8 text-[11px] sm:text-xs text-neutral-400 uppercase tracking-widest font-mono">
              © COPYRIGHT YATHU AROKIYAGAM {new Date().getFullYear()}. ALL RIGHTS RESERVED.
            </div>
          </div>

          {/* Center Column: Explore Links Grid */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-6 sm:gap-8">
            <div>
              <span className="block text-xs font-bold uppercase tracking-widest text-neutral-300 mb-3.5">
                {currentLang === 'ta' ? 'கண்டுபிடி' : 'EXPLORE'}
              </span>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/" className="text-xs sm:text-sm text-neutral-300 hover:text-white transition-colors">
                    {currentLang === 'ta' ? 'முகப்பு' : 'Home'}
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="text-xs sm:text-sm text-neutral-300 hover:text-white transition-colors">
                    {currentLang === 'ta' ? 'மரச்செக்கு எண்ணெய்கள்' : 'Cold-Pressed Oils'}
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="text-xs sm:text-sm text-neutral-300 hover:text-white transition-colors">
                    {currentLang === 'ta' ? 'மலைத்தேன்' : 'Wild Mountain Honey'}
                  </Link>
                </li>
                <li>
                  <Link href="/overview" className="text-xs sm:text-sm text-neutral-300 hover:text-white transition-colors">
                    {currentLang === 'ta' ? 'விவசாயிகள் & கதை' : 'Our Farm Story'}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <span className="block text-xs font-bold uppercase tracking-widest text-transparent mb-3.5 select-none">
                LINKS
              </span>
              <ul className="space-y-2.5">
                <li>
                  <Link href="/about" className="text-xs sm:text-sm text-neutral-300 hover:text-white transition-colors">
                    {currentLang === 'ta' ? 'எங்களை பற்றி' : 'About'}
                  </Link>
                </li>
                <li>
                  <Link href="/gallery" className="text-xs sm:text-sm text-neutral-300 hover:text-white transition-colors">
                    {currentLang === 'ta' ? 'சமூகம்' : 'Community'}
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="text-xs sm:text-sm text-neutral-300 hover:text-white transition-colors">
                    {currentLang === 'ta' ? 'அனைத்து பொருட்கள்' : 'Shop'}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-xs sm:text-sm text-neutral-300 hover:text-white transition-colors">
                    {currentLang === 'ta' ? 'தொடர்பு கொள்க' : 'Contact'}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Social Rounded Icons & Legal Links */}
          <div className="lg:col-span-3 flex flex-col lg:items-end justify-between h-full gap-8">
            {/* Social Icons in rounded square boxes (matching reference) */}
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-lg bg-neutral-800/80 hover:bg-neutral-700/90 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-all hover:scale-105"
              >
                <FacebookIcon />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-lg bg-neutral-800/80 hover:bg-neutral-700/90 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-all hover:scale-105"
              >
                <InstagramIcon />
              </a>

              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-10 h-10 rounded-lg bg-neutral-800/80 hover:bg-neutral-700/90 border border-white/10 flex items-center justify-center text-neutral-300 hover:text-white transition-all hover:scale-105"
              >
                <TikTokIcon />
              </a>
            </div>

            {/* Legal Links */}
            <div className="flex items-center flex-wrap gap-4 text-[10px] sm:text-xs text-neutral-400 uppercase tracking-wider font-mono">
              <Link href="/privacy" className="hover:text-white transition-colors">
                {currentLang === 'ta' ? 'தனியுரிமைக் கொள்கை' : 'PRIVACY POLICY'}
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-white transition-colors">
                {currentLang === 'ta' ? 'விதிமுறைகள்' : 'TERMS OF USE'}
              </Link>
              <span>•</span>
              <Link href="/faq" className="hover:text-white transition-colors">
                {currentLang === 'ta' ? 'உதவி' : 'ACCESSIBILITY'}
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
