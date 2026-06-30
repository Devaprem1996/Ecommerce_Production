"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  ArrowRight
} from 'lucide-react';
import { blogPosts, BlogPost } from '@/data/blogData';
import { Button } from '@/components/ui/Button';
import 'aos/dist/aos.css';

export default function BlogListingPage() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  // Loading skeleton state
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | BlogPost['category']>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // AOS Init
  useEffect(() => {
    import('aos').then((AOS) => {
      AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
      });
    });

    // Simulate skeleton fetch delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const categories = [
    { id: 'all', key: 'all', fallback: 'All Articles' },
    { id: 'farming', key: 'farming', fallback: 'Sustainable Farming' },
    { id: 'nutrition', key: 'nutrition', fallback: 'Organic Nutrition' },
    { id: 'recipes', key: 'recipes', fallback: 'Traditional Recipes' }
  ];

  // Filter posts
  const filteredPosts = useMemo(() => {
    if (activeCategory === 'all') return blogPosts;
    return blogPosts.filter(post => post.category === activeCategory);
  }, [activeCategory]);

  // Pagination details
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * postsPerPage;
    return filteredPosts.slice(start, start + postsPerPage);
  }, [filteredPosts, currentPage]);

  const featuredPost = useMemo(() => {
    if (activeCategory !== 'all' || currentPage !== 1) return null;
    return blogPosts[0]; // First post is featured on initial load
  }, [activeCategory, currentPage]);

  const normalGridPosts = useMemo(() => {
    if (featuredPost) {
      return paginatedPosts.filter(p => p.slug !== featuredPost.slug);
    }
    return paginatedPosts;
  }, [paginatedPosts, featuredPost]);

  const handleCategoryChange = (catId: any) => {
    setActiveCategory(catId);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans pb-20 transition-colors duration-normal">
      
      {/* Breadcrumbs */}
      <div className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold">
            <Link href="/" className="hover:text-primary-500 transition-colors uppercase tracking-wider">
              {t('shop.breadcrumb_home', 'Home')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-900 dark:text-white uppercase tracking-wider">
              {t('blog.title', 'Organic Blog')}
            </span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-10 text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-2">
          <h1 className="text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
            {t('blog.title', 'Organic Blog & Insights')}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
            {t('blog.subtitle', 'Learn about sustainable farming, organic health, and traditional recipes.')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-10">
        
        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center border-b border-neutral-200 dark:border-neutral-800">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id as any)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-350'
              }`}
            >
              {t(`blog.categories.${cat.key}`, cat.fallback)}
            </button>
          ))}
        </div>

        {/* LOADING SKELETON */}
        {loading ? (
          <div className="space-y-8 animate-pulse">
            {/* Featured Post Skeleton */}
            {activeCategory === 'all' && currentPage === 1 && (
              <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature overflow-hidden grid grid-cols-1 lg:grid-cols-12 h-[350px]">
                <div className="lg:col-span-7 bg-neutral-200 dark:bg-neutral-800" />
                <div className="lg:col-span-5 p-8 space-y-4">
                  <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                  <div className="h-10 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
                  <div className="h-20 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
                  <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-card" />
                </div>
              </div>
            )}

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature overflow-hidden h-[380px] space-y-4 p-5">
                  <div className="h-44 w-full bg-neutral-200 dark:bg-neutral-800 rounded-card" />
                  <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
                  <div className="h-8 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
                  <div className="h-12 w-full bg-neutral-200 dark:bg-neutral-800 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ACTUAL CONTENT */
          <div className="space-y-12">
            
            {/* Featured Post Card */}
            {featuredPost && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="lg:col-span-7 h-64 lg:h-auto relative overflow-hidden bg-neutral-100">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-primary-500 text-white font-bold text-[9px] uppercase tracking-wider py-1 px-3.5 rounded-full shadow-sm">
                    {t(`blog.categories.${featuredPost.category}`)}
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-center space-y-4">
                  <div className="flex gap-4 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary-500" />
                      {currentLang === 'ta' ? featuredPost.dateTamil : featuredPost.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary-500" />
                      {featuredPost.readTime} {t('blog.read_time', 'min read')}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2.5xl font-black font-heading text-neutral-905 dark:text-white leading-tight">
                    {currentLang === 'ta' ? featuredPost.titleTamil : featuredPost.title}
                  </h2>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-semibold leading-relaxed line-clamp-3">
                    {currentLang === 'ta' ? featuredPost.excerptTamil : featuredPost.excerpt}
                  </p>

                  <div className="flex items-center gap-3 pt-2">
                    <img src={featuredPost.author.avatar} alt={featuredPost.author.name} className="w-9 h-9 rounded-full object-cover border" />
                    <div>
                      <p className="text-xs font-bold text-neutral-900 dark:text-white">{featuredPost.author.name}</p>
                      <p className="text-[9px] font-bold text-neutral-550 dark:text-neutral-450 uppercase tracking-widest">
                        {currentLang === 'ta' ? featuredPost.author.roleTamil : featuredPost.author.role}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link href={`/blog/${featuredPost.slug}`}>
                      <Button
                        variant="primary"
                        size="sm"
                        className="font-bold text-xs"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                      >
                        {t('blog.read_more', 'Read Article')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Normal Blog Grid */}
            {normalGridPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {normalGridPosts.map((post, idx) => (
                  <motion.div
                    key={post.slug}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature overflow-hidden flex flex-col shadow-sm hover:translate-y-[-8px] hover:shadow-lg transition-all duration-normal"
                  >
                    <div className="h-48 relative overflow-hidden bg-neutral-100">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-slow"
                      />
                      <div className="absolute top-4 left-4 bg-primary-500 text-white font-bold text-[9px] uppercase tracking-wider py-1 px-3 rounded-full shadow-sm">
                        {t(`blog.categories.${post.category}`)}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
                      <div className="space-y-2">
                        <div className="flex gap-3 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-primary-500" />
                            {currentLang === 'ta' ? post.dateTamil : post.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-primary-500" />
                            {post.readTime} {t('blog.read_time')}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-neutral-905 dark:text-white leading-snug line-clamp-2">
                          {currentLang === 'ta' ? post.titleTamil : post.title}
                        </h3>

                        <p className="text-xs text-neutral-600 dark:text-neutral-450 font-semibold leading-relaxed line-clamp-2">
                          {currentLang === 'ta' ? post.excerptTamil : post.excerpt}
                        </p>
                      </div>

                      <div className="border-t border-neutral-50 dark:border-neutral-850 pt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={post.author.avatar} alt={post.author.name} className="w-7 h-7 rounded-full object-cover border" />
                          <span className="text-[10px] font-bold text-neutral-700 dark:text-neutral-350">{post.author.name}</span>
                        </div>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="inline-flex items-center gap-1 text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline"
                        >
                          <span>{t('blog.read_more')}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              !featuredPost && (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-neutral-500">No blog posts found under this category.</p>
                </div>
              )
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-6">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentPage(i + 1); window.scrollTo({ top: 300, behavior: 'smooth' }); }}
                    className={`w-9 h-9 rounded-card font-bold text-xs flex items-center justify-center cursor-pointer transition-colors ${
                      currentPage === i + 1
                        ? 'bg-primary-500 text-white'
                        : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-400 hover:border-neutral-350'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
}
