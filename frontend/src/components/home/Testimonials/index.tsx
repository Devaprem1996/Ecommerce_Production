"use client";

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { StarRating } from '@/components/ui/StarRating';
import { mockTestimonials } from '@/constants/mockData';
import { CheckCircle2, Quote } from 'lucide-react';
import { clsx } from 'clsx';

export const Testimonials: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 40 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

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

  // Autoplay 4 seconds
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <section className="w-full py-16 bg-[#F8F9FA] dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800/10 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-10" data-aos="fade-up">
          <h2 className="text-3xl font-bold font-heading text-neutral-900 dark:text-white mb-2">
            {t('testimonials.title', 'What Our Customers Say')}
          </h2>
          <div className="h-1 w-16 bg-primary-500 mx-auto rounded-full" />
        </div>

        {/* Carousel Slider */}
        <div className="relative overflow-hidden" ref={emblaRef} data-aos="zoom-in">
          <div className="flex">
            {mockTestimonials.map((item) => {
              const displayQuote = currentLang === 'ta' && item.quoteTamil ? item.quoteTamil : item.quote;
              return (
                <div key={item.id} className="flex-none w-full px-4 flex flex-col items-center text-center select-none">
                  {/* Quote icon accent */}
                  <Quote className="w-12 h-12 text-primary-500/15 mb-4" />

                  {/* Ratings Display */}
                  <StarRating rating={item.rating} size="md" className="mb-4" />

                  {/* Testimonial Quote */}
                  <p className="text-base sm:text-lg lg:text-xl font-medium text-neutral-750 dark:text-neutral-350 leading-relaxed max-w-2xl mb-6">
                    “{displayQuote}”
                  </p>

                  {/* Reviewer Details */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-neutral-200">
                      <Image
                        src={item.avatar}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col items-start text-left">
                      <span className="font-bold text-sm text-neutral-900 dark:text-white leading-tight">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mt-0.5">
                        <span>{item.location}</span>
                        <span className="text-neutral-400">•</span>
                        <span className="flex items-center gap-0.5 text-success">
                          <CheckCircle2 className="w-3.5 h-3.5 fill-success/10" />
                          {t('testimonials.verified', 'Verified Buyer')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi && emblaApi.scrollTo(index)}
              className={clsx(
                'h-2 rounded-full transition-all duration-normal cursor-pointer focus:outline-none',
                selectedIndex === index ? 'w-5 bg-primary-500' : 'w-2 bg-neutral-350 dark:bg-neutral-750 hover:bg-neutral-400'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
