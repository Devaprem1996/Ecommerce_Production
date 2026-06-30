"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { mockBlogs } from '@/constants/mockData';
import { Calendar, ArrowRight } from 'lucide-react';

export const BlogPreview: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <section className="w-full py-16 bg-white dark:bg-neutral-905 border-b border-neutral-100 dark:border-neutral-800/10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex items-end justify-between mb-10" data-aos="fade-up">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-neutral-900 dark:text-white">
              {currentLang === 'ta' ? 'சமீபத்திய கட்டுரைகள்' : 'Latest Articles'}
            </h2>
            <div className="h-1 w-12 bg-primary-500 rounded-full" />
          </div>
          <Link
            href="/blog"
            className="text-sm font-semibold text-primary-500 hover:text-primary-400 hover:underline transition-colors flex items-center gap-1 focus:outline-none"
          >
            {currentLang === 'ta' ? 'அனைத்து கட்டுரைகள் →' : 'View All Blogs →'}
          </Link>
        </div>

        {/* Blog Cards Container */}
        {/* Mobile: horizontal scrollable, Desktop: 3-column grid */}
        <div 
          className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-6 md:grid md:grid-cols-3"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {mockBlogs.map((blog, index) => {
            const displayTitle = currentLang === 'ta' && blog.titleTamil ? blog.titleTamil : blog.title;
            const displayExcerpt = currentLang === 'ta' && blog.excerptTamil ? blog.excerptTamil : blog.excerpt;
            return (
              <div
                key={blog.id}
                data-aos="fade-up"
                data-aos-delay={index * 120}
                className="group flex flex-col bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800/60 rounded-feature overflow-hidden hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-normal flex-shrink-0 w-[290px] sm:w-[340px] md:w-auto cursor-pointer"
              >
                {/* Image Section */}
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <Image
                    src={blog.image}
                    alt={displayTitle}
                    fill
                    sizes="(max-width: 768px) 300px, 400px"
                    className="object-cover transition-transform duration-slow group-hover:scale-105"
                  />
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-1">
                  {/* Date Tag */}
                  <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 mb-2 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{blog.date}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-bold font-heading text-neutral-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors leading-snug">
                    {displayTitle}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4 line-clamp-3">
                    {displayExcerpt}
                  </p>

                  {/* Read More Link */}
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="mt-auto inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-primary-500 hover:text-primary-400 transition-colors focus:outline-none"
                  >
                    <span>{currentLang === 'ta' ? 'மேலும் படிக்க' : 'Read More'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
