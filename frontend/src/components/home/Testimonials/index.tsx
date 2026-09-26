"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { customerTestimonials } from '@/constants/testimonials';
import { FloatingCardGrid } from './FloatingCardGrid';
import { MagneticButton } from './MagneticButton';
import { ArrowLeft, ArrowRight, Star, ShieldCheck } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const reviews = customerTestimonials;
  const current = reviews[currentIndex] || reviews[0];

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  }, [reviews.length]);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  }, [reviews.length]);

  // Keyboard Navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  const displayQuote = currentLang === 'ta' && current.quoteTamil ? current.quoteTamil : current.quote;

  return (
    <section
      className="relative w-full bg-[#FAFAF9] dark:bg-[#0C0E10] font-sans overflow-hidden transition-colors duration-300 border-b border-neutral-200/70 dark:border-neutral-800"
      aria-label="Customer Testimonials"
    >
      {/* 1. Top Architectural Diagonal-Hatched Stripe Banner (Exact Reference Match) */}
      <div className="w-full h-8 sm:h-9 border-t border-b border-neutral-200/80 dark:border-neutral-800/80 bg-[repeating-linear-gradient(-45deg,transparent,transparent_6px,rgba(0,0,0,0.035)_6px,rgba(0,0,0,0.035)_7px)] dark:bg-[repeating-linear-gradient(-45deg,transparent,transparent_6px,rgba(255,255,255,0.035)_6px,rgba(255,255,255,0.035)_7px)] relative z-10" />

      {/* 2. Subtle Technical Grid Lines in Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="max-w-7xl mx-auto h-full border-x border-neutral-200/40 dark:border-neutral-800/40 relative">
          {/* Subtle vertical center split guideline */}
          <div className="hidden lg:block absolute left-[44%] top-0 bottom-0 w-px bg-neutral-200/30 dark:bg-neutral-800/30" />
        </div>
      </div>

      {/* 3. Main Testimonial Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: 3D Floating Beveled Glass Slabs & Centerpiece Avatar Grid */}
          <div className="lg:col-span-5 flex items-center justify-center order-2 lg:order-1">
            <FloatingCardGrid
              currentTestimonial={current}
              direction={direction}
              activeIndex={currentIndex}
            />
          </div>

          {/* Right Column: Quotation Mark, Quote Headline, Reviewer Details, and Controls */}
          <div className="lg:col-span-7 flex flex-col justify-center items-start lg:pl-4 order-1 lg:order-2">
            
            {/* Elegant Quotation Mark SVG (Curved Silver Gradient Double Swoosh) */}
            <div className="mb-5 sm:mb-7 select-none">
              <svg
                width="48"
                height="36"
                viewBox="0 0 48 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="opacity-75 hover:opacity-100 transition-opacity"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="quoteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#94A3B8" />
                    <stop offset="100%" stopColor="#CBD5E1" />
                  </linearGradient>
                </defs>
                {/* Left comma quote */}
                <path
                  d="M17.5 0C8.5 3.5 1.5 11.5 0 21.5C1.5 20.5 4 19.5 7 19.5C13 19.5 17.5 24 17.5 30C17.5 33.5 14.5 36 10.5 36C4.5 36 0 30.5 0 21.5C0 10.5 8 2.5 17.5 0Z"
                  fill="url(#quoteGradient)"
                  className="dark:opacity-80"
                />
                {/* Right comma quote */}
                <path
                  d="M43.5 0C34.5 3.5 27.5 11.5 26 21.5C27.5 20.5 30 19.5 33 19.5C39 19.5 43.5 24 43.5 30C43.5 33.5 40.5 36 36.5 36C30.5 36 26 30.5 26 21.5C26 10.5 34 2.5 43.5 0Z"
                  fill="url(#quoteGradient)"
                  className="dark:opacity-80"
                />
              </svg>
            </div>

            {/* Testimonial Quote Text with Framer Motion AnimatePresence */}
            <div className="min-h-[140px] sm:min-h-[150px] lg:min-h-[160px] flex items-center w-full">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.blockquote
                  key={current.id}
                  custom={direction}
                  initial={{ opacity: 0, y: direction >= 0 ? 18 : -18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: direction >= 0 ? -18 : 18 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="text-xl sm:text-2xl lg:text-[32px] font-normal text-neutral-900 dark:text-neutral-100 tracking-[-0.015em] leading-[1.38] sm:leading-[1.35] max-w-2xl"
                >
                  {displayQuote}
                </motion.blockquote>
              </AnimatePresence>
            </div>

            {/* Author Information & Rating Section */}
            <div className="mt-6 sm:mt-8 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="flex flex-col items-start gap-1.5"
                >
                  {/* Name and Role / Company (Exact match: Julian Benegas, BaseHub) */}
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-base sm:text-lg font-medium text-neutral-600 dark:text-neutral-300">
                      {current.name}
                      {current.role ? `, ${current.role}` : current.location ? `, ${current.location}` : ''}
                    </span>
                  </div>

                  {/* 5-Star Rating & Verified Buyer Badge */}
                  <div className="flex items-center gap-3 mt-0.5">
                    <div className="flex items-center gap-0.5" aria-label={`${current.rating} out of 5 stars`}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-amber-400 fill-amber-400"
                        />
                      ))}
                    </div>

                    <span className="h-3 w-px bg-neutral-300 dark:bg-neutral-700" />

                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{currentLang === 'ta' ? 'உறுதிப்படுத்தப்பட்ட வாங்குபவர்' : 'Verified Purchase'}</span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Counter Indicator */}
              <div className="hidden sm:flex items-center text-xs font-mono font-medium text-neutral-400 dark:text-neutral-500">
                <span className="text-neutral-900 dark:text-white font-bold">{String(currentIndex + 1).padStart(2, '0')}</span>
                <span className="mx-1">/</span>
                <span>{String(reviews.length).padStart(2, '0')}</span>
              </div>
            </div>

            {/* Navigation Buttons: Side by Side Circular Arrows with GSAP Magnetic Effect */}
            <div className="mt-8 flex items-center gap-3">
              <MagneticButton
                onClick={handlePrev}
                ariaLabel="Previous testimonial"
                className="w-10 h-10 rounded-full border border-neutral-300/80 dark:border-neutral-700 bg-white/90 dark:bg-neutral-900/90 text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-500 shadow-xs hover:shadow-md transition-shadow"
              >
                <ArrowLeft className="w-4 h-4" />
              </MagneticButton>

              <MagneticButton
                onClick={handleNext}
                ariaLabel="Next testimonial"
                className="w-10 h-10 rounded-full border border-neutral-300/80 dark:border-neutral-700 bg-white/90 dark:bg-neutral-900/90 text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-500 shadow-xs hover:shadow-md transition-shadow"
              >
                <ArrowRight className="w-4 h-4" />
              </MagneticButton>

              {/* Mobile Slide Dot Indicators */}
              <div className="flex sm:hidden items-center gap-1.5 ml-4">
                {reviews.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDirection(idx > currentIndex ? 1 : -1);
                      setCurrentIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      currentIndex === idx
                        ? 'w-6 bg-primary-600 dark:bg-primary-400'
                        : 'w-1.5 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
