"use client";

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

export const HeroBanner: React.FC = () => {
  const { t } = useTranslation();

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 30 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Autoplay
  useEffect(() => {
    if (!emblaApi || isHovered) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [emblaApi, isHovered]);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1600',
      titleKey: 'hero.slide1.title',
      subtitleKey: 'hero.slide1.subtitle',
      defaultTitle: 'Fresh & Organic Produce',
      defaultSubtitle: 'Directly from local farms to your kitchen counter.',
    },
    {
      image: 'https://images.unsplash.com/photo-1610832958506-ee5633619144?auto=format&fit=crop&q=80&w=1600',
      titleKey: 'hero.slide2.title',
      subtitleKey: 'hero.slide2.subtitle',
      defaultTitle: '100% Pure Lab Tested',
      defaultSubtitle: 'Certified quality checks on every product we offer.',
    },
    {
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1600',
      titleKey: 'hero.slide3.title',
      subtitleKey: 'hero.slide3.subtitle',
      defaultTitle: 'Fast & Secure Delivery',
      defaultSubtitle: 'Deliveries at your convenience, safely processed.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      },
    },
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-neutral-900 h-[50vh] sm:h-[60vh] lg:h-[80vh] min-h-[380px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Embla Viewport */}
      <div className="w-full h-full overflow-hidden" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => {
            const isSelected = selectedIndex === index;
            return (
              <div key={index} className="relative flex-none w-full h-full overflow-hidden select-none">
                {/* Background Image with smooth scale animation (Ken Burns) */}
                <div
                  className={clsx(
                    "absolute inset-0 w-full h-full transition-transform duration-[15000ms] ease-in-out",
                    isSelected ? "scale-110" : "scale-100"
                  )}
                >
                  <Image
                    src={slide.image}
                    alt={t(slide.titleKey, slide.defaultTitle)}
                    fill
                    priority={index === 0}
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/20" />

                {/* Content Block */}
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-2xl text-left">
                      <AnimatePresence mode="wait">
                        {isSelected && (
                          <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={containerVariants}
                            className="flex flex-col gap-4 sm:gap-6"
                          >
                            <motion.h1
                              variants={itemVariants}
                              className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading text-white leading-tight"
                            >
                              {t(slide.titleKey, slide.defaultTitle)}
                            </motion.h1>

                            <motion.p
                              variants={itemVariants}
                              className="text-sm sm:text-base lg:text-lg font-medium font-sans text-neutral-200"
                            >
                              {t(slide.subtitleKey, slide.defaultSubtitle)}
                            </motion.p>

                            <motion.div
                              variants={itemVariants}
                              className="flex items-center gap-4 mt-2"
                            >
                              <Button
                                variant="cta"
                                size="md"
                                onClick={() => {
                                  const shopSec = document.getElementById('best-sellers');
                                  if (shopSec) shopSec.scrollIntoView({ behavior: 'smooth' });
                                }}
                              >
                                {t('hero.cta.shop', 'Shop Now')}
                              </Button>
                              <Button
                                variant="ghost"
                                size="md"
                                className="border border-white/30 text-white hover:bg-white/10 hover:text-white"
                                onClick={() => {
                                  const catSec = document.getElementById('categories');
                                  if (catSec) catSec.scrollIntoView({ behavior: 'smooth' });
                                }}
                              >
                                {t('hero.cta.explore', 'Explore')}
                              </Button>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prev/Next Arrow Controls (Hidden on Mobile) */}
      <button
        onClick={scrollPrev}
        className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-black/50 text-white transition-colors duration-normal z-20 cursor-pointer hidden md:flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-400"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/20 hover:bg-black/50 text-white transition-colors duration-normal z-20 cursor-pointer hidden md:flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-400"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={clsx(
              'h-2 rounded-full transition-all duration-normal cursor-pointer focus:outline-none',
              selectedIndex === index ? 'w-6 bg-primary-400' : 'w-2 bg-white/40 hover:bg-white'
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
