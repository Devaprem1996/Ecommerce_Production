"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { StarRating } from '@/components/ui/StarRating';
import { customerTestimonials } from '@/constants/testimonials';
import { CheckCircle2, Quote, Sparkles, ArrowRight } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  // Take the first 3 reviews for the clean 3-column display
  const featuredReviews = customerTestimonials.slice(0, 3);

  return (
    <section className="w-full py-12 sm:py-16 bg-[#FAFAF9] dark:bg-neutral-950 font-sans transition-colors duration-normal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Eyebrow and "View More Reviews" */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4" data-aos="fade-up">
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/70 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{currentLang === 'ta' ? 'வாடிக்கையாளர் கருத்துக்கள்' : 'Our Customers’ Testimonials'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-neutral-900 dark:text-white tracking-tight">
              {currentLang === 'ta' ? 'குடும்பங்கள் எங்களை நம்புவது ஏன்?' : 'Trusted by Over 10,000+ Families'}
            </h2>
          </div>

          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            <span>{currentLang === 'ta' ? 'அனைத்து மதிப்புரைகள்' : 'View More Reviews'}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 3-Column Card Grid matching Reference Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredReviews.map((item, index) => {
            const displayQuote = currentLang === 'ta' && item.quoteTamil ? item.quoteTamil : item.quote;
            return (
              <div
                key={item.id}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-[22px] bg-white dark:bg-neutral-900 border border-neutral-150/90 dark:border-neutral-800 shadow-xs hover:shadow-xl transition-all duration-300 spring-hover"
              >
                <div>
                  {/* Top Quote Icon Accent */}
                  <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mb-5">
                    <Quote className="w-5 h-5 fill-current" />
                  </div>

                  {/* Testimonial Quote */}
                  <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed mb-6 font-medium">
                    &ldquo;{displayQuote}&rdquo;
                  </p>
                </div>

                {/* Rating & Reviewer Info */}
                <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-auto">
                  <StarRating rating={item.rating} size="sm" className="mb-3" />
                  
                  <div className="flex items-center gap-3">
                    {item.avatar ? (
                      <div className="relative w-11 h-11 rounded-full overflow-hidden border border-neutral-200">
                        <Image
                          src={item.avatar}
                          alt={item.name}
                          fill
                          sizes="44px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-primary-500/15 border border-primary-500/25 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm">
                        {item.initial || item.name.charAt(0)}
                      </div>
                    )}

                    <div className="flex flex-col text-left">
                      <span className="font-bold text-sm text-neutral-900 dark:text-white leading-tight">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mt-0.5">
                        <span>{item.location}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3 fill-emerald-500/10" />
                          {t('testimonials.verified', 'Verified Buyer')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
