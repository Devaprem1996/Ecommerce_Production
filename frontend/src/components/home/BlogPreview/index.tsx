"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { mockBlogs } from '@/constants/mockData';
import { Calendar, ArrowRight, Sparkles, Clock } from 'lucide-react';

export const BlogPreview: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  // Modern blog categories mapping for the badges
  const blogBadges = [
    { name: 'Cold-Pressed Oils', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
    { name: 'Millet Recipes', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
    { name: 'Natural Sweeteners', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' },
    { name: 'Heritage Wellness', color: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300' },
  ];

  // Provide 4 articles for the 4-column grid
  const articles = [
    ...mockBlogs,
    {
      id: 'blog-4',
      title: 'The Proven Health Benefits of Vaagai Wood-Pressed Sesame Oil',
      titleTamil: 'வாகை மரச்செக்கு நல்லெண்ணெயின் மருத்துவ குணங்கள்',
      excerpt: 'Discover why traditional cold pressing preserves zinc, sesamol, and natural antioxidants lost in refined oils.',
      excerptTamil: 'சுத்திகரிக்கப்பட்ட எண்ணெய்களில் அழியும் இயற்கை ஊட்டச்சத்துக்கள் மரச்செக்கில் எவ்வாறு பாதுகாக்கப்படுகிறது.',
      image: 'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=600',
      date: 'May 12, 2026',
      readTime: '4 min read',
      slug: 'health-benefits-wood-pressed-sesame-oil',
    },
  ].slice(0, 4);

  return (
    <section className="w-full py-12 sm:py-16 bg-white dark:bg-neutral-900/60 font-sans transition-colors duration-normal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Modern Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4" data-aos="fade-up">
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/50 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-primary-500" />
              <span>{currentLang === 'ta' ? 'பாரம்பரிய குறிப்புகள்' : 'Traditional Health Insights'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-neutral-900 dark:text-white tracking-tight">
              {currentLang === 'ta' ? 'எங்கள் ஆரோக்கிய வலைப்பதிவு' : 'From Our Wellness Journal'}
            </h2>
          </div>

          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            <span>{currentLang === 'ta' ? 'அனைத்து கட்டுரைகள்' : 'View All Insights'}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 4-Column Card Grid matching Reference Section 10 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((blog, index) => {
            const displayTitle = currentLang === 'ta' && blog.titleTamil ? blog.titleTamil : blog.title;
            const badge = blogBadges[index % blogBadges.length];

            return (
              <div
                key={blog.id}
                data-aos="fade-up"
                data-aos-delay={index * 80}
                className="group flex flex-col bg-white dark:bg-neutral-900 border border-neutral-150/90 dark:border-neutral-800 rounded-[20px] overflow-hidden hover:shadow-xl transition-all duration-300 spring-hover cursor-pointer"
              >
                {/* Image Section with Smooth Zoom */}
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                  <Image
                    src={blog.image}
                    alt={displayTitle}
                    fill
                    sizes="(max-width: 576px) 100vw, (max-width: 992px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-108"
                  />
                  <div className="absolute top-3 left-3 z-10">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs ${badge.color}`}>
                      {badge.name}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-5 flex flex-col flex-1">
                  {/* Date & Reading Time */}
                  <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                    <div className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{blog.date}</span>
                    </div>
                    <div className="flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{(blog as any).readTime || '3 min read'}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">
                    {displayTitle}
                  </h3>

                  {/* Read More Link */}
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="mt-auto inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 group-hover:text-primary-700 transition-colors"
                  >
                    <span>{currentLang === 'ta' ? 'முழுமையாக படிக்க' : 'Read Article'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
