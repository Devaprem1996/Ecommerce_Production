"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, ArrowRight, ShieldCheck, Leaf, X } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <section className="relative w-full overflow-hidden bg-[#FAF9F6] dark:bg-neutral-950 py-12 sm:py-16 lg:py-20 transition-colors duration-normal font-sans">
      {/* Subtle Warm & Emerald Ambient Background Meshes & Texture */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] pointer-events-none z-0">
        <Image
          src="/images/farmland-panorama.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter blur-[1px]"
          aria-hidden="true"
        />
      </div>
      <div 
        className="absolute top-0 left-0 w-96 h-96 rounded-full bg-amber-200/30 dark:bg-amber-500/5 blur-3xl pointer-events-none -translate-x-1/3 -translate-y-1/3" 
        aria-hidden="true" 
      />
      <div 
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-emerald-200/25 dark:bg-emerald-500/5 blur-3xl pointer-events-none translate-x-1/4 translate-y-1/4" 
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Inspiring Typography & Dual Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Eyebrow Pill with Live Rating */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50/90 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs mb-5 backdrop-blur-sm"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-600" />
              </span>
              <span className="text-xs sm:text-sm font-bold text-primary-800 dark:text-primary-200 tracking-wide flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                {currentLang === 'ta'
                  ? '100% பாரம்பரிய மரச்செக்கு & இயற்கை நல்வாழ்வு'
                  : '100% Traditional Vaagai Wood-Pressed & Organic'}
              </span>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-emerald-300 dark:bg-emerald-700" />
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                ★ 4.9/5 TrustScore
              </span>
            </motion.div>

            {/* Main Headline with Vibrant Gradient Word Accent */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-neutral-900 dark:text-white leading-[1.15] sm:leading-[1.12] tracking-tight mb-5"
            >
              {currentLang === 'ta' ? (
                <>
                  உங்கள் குடும்பத்திற்கு{' '}
                  <span className="liquid-text-gradient underline decoration-amber-400/60 decoration-wavy decoration-2 underline-offset-4">
                    பாரம்பரிய உணவு
                  </span>
                  , கலப்படமற்ற தூய்மை
                </>
              ) : (
                <>
                  Nourish Your Family With{' '}
                  <span className="liquid-text-gradient underline decoration-amber-400/60 decoration-wavy decoration-2 underline-offset-4">
                    Traditional Food
                  </span>
                  , Honest &amp; Pure
                </>
              )}
            </motion.h1>

            {/* Narrative Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-neutral-650 dark:text-neutral-350 leading-relaxed max-w-2xl mb-6 font-medium"
            >
              {currentLang === 'ta'
                ? 'வாகை மரச்செக்கில் பிழியப்பட்ட சுத்தமான சமையல் எண்ணெய்கள், ஊட்டச்சத்து நிறைந்த பாரம்பரிய சிறுதானியங்கள், மற்றும் சுத்தமான பனை வெல்லம் நேரடியாக உங்கள் இல்லத்திற்கு.'
                : 'Pure wood-pressed traditional cooking oils, nutrient-dense native millets, and unrefined natural sweeteners procured directly from trusted native Tamil farmers to your kitchen.'}
            </motion.p>

            {/* Above-the-fold Trust Micro-Pills */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8 text-xs font-semibold text-neutral-700 dark:text-neutral-300"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-800 dark:text-amber-300">
                <span className="text-amber-600 font-bold">✓</span>
                <span>{currentLang === 'ta' ? '< 40°C மரச்செக்கு பிழிவு' : '< 40°C Cold Extraction'}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{currentLang === 'ta' ? 'ரசாயனம் & ஹெக்சேன் இல்லை' : 'Zero Chemical Solvents'}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/20 text-blue-800 dark:text-blue-300">
                <span className="text-blue-600 font-bold">✓</span>
                <span>{currentLang === 'ta' ? 'விவசாயிகளிடமிருந்து நேரடி வரத்து' : 'Direct Farmer Sourced'}</span>
              </div>
            </motion.div>

            {/* Dual Actions: Liquid Pill Button + Circular Pulse Play Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 sm:gap-6 w-full sm:w-auto"
            >
              {/* Primary Liquid Gradient CTA */}
              <Link
                href="/shop"
                className="liquid-btn group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-primary-500 via-[#245740] to-primary-700 text-white font-bold text-sm sm:text-base shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-normal cursor-pointer"
              >
                <span>{currentLang === 'ta' ? 'பொருட்களை காண்க' : 'Shop Pure Products'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              {/* Secondary Interactive Circular Video Action */}
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(true)}
                className="inline-flex items-center gap-3 text-neutral-800 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 font-bold text-sm sm:text-base group cursor-pointer focus:outline-none transition-colors"
                aria-label="Watch Farm Story"
              >
                <div className="relative w-12 h-12 rounded-full bg-white dark:bg-neutral-850 shadow-md border border-amber-200/80 dark:border-amber-500/30 flex items-center justify-center text-amber-500 transition-transform group-hover:scale-110">
                  <span className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping opacity-75" />
                  <Play className="w-5 h-5 fill-current ml-0.5 relative z-10" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="leading-tight group-hover:underline">
                    {currentLang === 'ta' ? 'பண்ணை கதை காணுங்கள்' : 'Watch Farm Story'}
                  </span>
                  <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
                    {currentLang === 'ta' ? '2 நிமிடங்கள் • வீடியோ' : '2 mins • Village Tour'}
                  </span>
                </div>
              </button>
            </motion.div>
          </div>

          {/* Right Column: Liquid Morphing Shape with Visual & Floating Badges */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-[420px] aspect-[4/5] flex items-center justify-center"
            >
              {/* Vibrant Liquid Morphing Backdrop (Honey/Oil droplet fluid motion) */}
              <div 
                className="absolute inset-x-2 inset-y-0 animate-liquid-morph bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 shadow-2xl opacity-95 transition-all"
              />

              {/* Main Cut-Out Hero Visual with Fluid Outline */}
              <div className="relative z-10 w-[88%] h-[92%] animate-liquid-morph-slow overflow-hidden shadow-inner border-3 border-white/60 bg-white">
                <Image
                  src="/images/hero-organic-staples.png"
                  alt="Traditional South Indian Organic Produce & Cold Pressed Oils"
                  fill
                  priority
                  sizes="(max-width: 768px) 340px, 420px"
                  className="object-cover object-center hover:scale-108 transition-transform duration-slow"
                />
              </div>

              {/* Floating Micro-Badge Top Left: "100% Wood-Pressed" */}
              <div className="absolute -top-3 -left-4 z-20 animate-float">
                <div className="bg-white/95 dark:bg-neutral-850/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-750 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-primary-500 flex items-center justify-center font-bold">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-neutral-900 dark:text-white leading-tight">
                      {currentLang === 'ta' ? 'மரச்செக்கு முறை' : '100% Wood-Pressed'}
                    </span>
                    <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                      {currentLang === 'ta' ? 'சூடாக்கப்படாதது' : 'Cold Extracted'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Micro-Badge Bottom Right: "4.9/5 Certified Purity" */}
              <div className="absolute -bottom-4 -right-3 z-20 animate-float-delayed">
                <div className="bg-white/95 dark:bg-neutral-850/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-neutral-100 dark:border-neutral-750 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black text-neutral-900 dark:text-white leading-tight">
                        4.9/5 Rating
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                      {currentLang === 'ta' ? 'ஆய்வக சான்றளிப்பு' : 'Lab Certified Pure'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Playful Floating Satisfaction Dot Badge */}
              <div className="absolute top-1/4 -right-5 z-20 animate-float">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex flex-col items-center justify-center shadow-lg border-2 border-white text-center leading-none">
                  <span className="text-xs font-extrabold">98%</span>
                  <span className="text-[8px] font-semibold uppercase tracking-tighter mt-0.5">Pure</span>
                </div>
              </div>

            </motion.div>
          </div>

        </div>
      </div>

      {/* Video / Farm Story Modal */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl p-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {currentLang === 'ta' ? 'யாத்து ஆரோக்கியகம் பண்ணை கதை' : 'Yathu Arokiyagam Farm Story'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 cursor-pointer"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 aspect-video rounded-xl bg-neutral-950 flex flex-col items-center justify-center text-center p-6 text-white relative overflow-hidden">
                <Image
                  src="/images/artisans-banner.png"
                  alt="Traditional Wood Press"
                  fill
                  className="object-cover opacity-50"
                />
                <div className="relative z-10 max-w-md">
                  <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <Play className="w-7 h-7 fill-current ml-0.5" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">
                    {currentLang === 'ta' ? 'மரச்செக்கு பாரம்பரியம்' : 'The Art of Cold Wooden Pressing'}
                  </h4>
                  <p className="text-xs text-neutral-250 leading-relaxed">
                    {currentLang === 'ta'
                      ? 'வாகை மரச்செக்கில் மிதமான சுழற்சியில் எள், நிலக்கடலை மற்றும் தேங்காய் எண்ணெய்கள் பிழியப்படும் முறையை காணுங்கள்.'
                      : 'Experience how our native Vaagai wood presses extract nutrient-rich groundnut, sesame, and coconut oils without heat or artificial solvents.'}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(false)}
                  className="px-5 py-2 rounded-full bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs cursor-pointer"
                >
                  {currentLang === 'ta' ? 'மூடுக' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
