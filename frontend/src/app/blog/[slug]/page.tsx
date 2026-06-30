"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  Calendar, 
  Clock, 
  User, 
  Share2, 
  Link2, 
  ArrowLeft,
  ArrowRight,
  MessageSquare,
  Bookmark
} from 'lucide-react';
import { getBlogPostBySlug, getRelatedPosts, BlogPost } from '@/data/blogData';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import 'aos/dist/aos.css';

const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export default function BlogDetailPage({ params }: PageProps) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const router = useRouter();

  // Resolve params slug
  const [slug, setSlug] = useState<string | null>(null);
  useEffect(() => {
    Promise.resolve(params).then((resolved) => {
      setSlug(resolved.slug);
    });
  }, [params]);

  // Retrieve post
  const post = useMemo(() => {
    if (!slug) return null;
    return getBlogPostBySlug(slug);
  }, [slug]);

  // Redirect to 404 if post not found
  useEffect(() => {
    if (slug && !post) {
      notFound();
    }
  }, [slug, post]);

  // Table of Contents active heading tracking
  const [activeHeadingId, setActiveHeadingId] = useState('');
  useEffect(() => {
    const handleScroll = () => {
      if (!post) return;
      const headingElements = post.headings.map(h => document.getElementById(h.id));
      const scrollPosition = window.scrollY + 120;

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i];
        if (el && el.offsetTop <= scrollPosition) {
          setActiveHeadingId(el.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return getRelatedPosts(post.slug, post.category, 3);
  }, [post]);

  if (!slug || !post) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Social sharing links
  const encodedTitle = encodeURIComponent(currentLang === 'ta' ? post.titleTamil : post.title);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareUrls = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodeURIComponent(currentUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodeURIComponent(currentUrl)}`
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    toast.success('Article link copied to clipboard!');
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 90;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveHeadingId(id);
    }
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
            <Link href="/blog" className="hover:text-primary-500 transition-colors uppercase tracking-wider">
              {t('blog.title', 'Blog')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-900 dark:text-white uppercase tracking-wider truncate max-w-[200px] sm:max-w-none">
              {currentLang === 'ta' ? post.titleTamil : post.title}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Back Link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-primary-500 transition-colors uppercase tracking-widest mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </Link>

        {/* Dynamic two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Article Content (Left Column) */}
          <article className="lg:col-span-8 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 sm:p-10 shadow-sm space-y-6">
            
            {/* Header info */}
            <div className="space-y-4">
              <div className="inline-block bg-primary-500/10 dark:bg-primary-500/20 text-primary-500 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                {t(`blog.categories.${post.category}`)}
              </div>

              <h1 className="text-2.5xl sm:text-4xl font-black font-heading text-neutral-905 dark:text-white tracking-tight leading-tight">
                {currentLang === 'ta' ? post.titleTamil : post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-5 text-xs font-bold text-neutral-500 uppercase tracking-wider border-y border-neutral-50 dark:border-neutral-850/80 py-3.5">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  {currentLang === 'ta' ? post.dateTamil : post.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary-500" />
                  {post.readTime} {t('blog.read_time')}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-primary-500" />
                  {post.author.name}
                </span>
              </div>
            </div>

            {/* Hero Image */}
            <div className="rounded-feature overflow-hidden h-[240px] sm:h-[400px] bg-neutral-100">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Author Widget */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-850/30 border border-neutral-100 dark:border-neutral-800 rounded-feature flex items-center gap-4">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-12 h-12 rounded-full object-cover border"
              />
              <div>
                <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {t('blog.author_title', 'Written By')}
                </p>
                <h4 className="font-bold text-sm text-neutral-905 dark:text-white">
                  {post.author.name}
                </h4>
                <p className="text-[10px] font-bold text-neutral-600 dark:text-neutral-450 uppercase tracking-wider">
                  {currentLang === 'ta' ? post.author.roleTamil : post.author.role}
                </p>
              </div>
            </div>

            {/* Typeset Content Paragraphs */}
            <div className="space-y-6 pt-2">
              {(currentLang === 'ta' ? post.contentTamil : post.content).map((paragraph, idx) => {
                // If headings match index, insert a heading anchor
                const hIndex = idx; // simple correlation or render specific segments
                const matchesHeading = post.headings[hIndex];
                
                return (
                  <div key={idx} className="space-y-4">
                    {matchesHeading && (
                      <h2
                        id={matchesHeading.id}
                        className="text-xl sm:text-2xl font-black font-heading text-neutral-905 dark:text-white pt-4 border-t border-neutral-50 dark:border-neutral-850 scroll-mt-24"
                      >
                        {currentLang === 'ta' ? matchesHeading.textTamil : matchesHeading.text}
                      </h2>
                    )}
                    <p className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
                      {paragraph}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Sharing buttons */}
            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-primary-500" />
                {t('blog.share_title', 'Share This Article')}
              </span>
              
              <div className="flex gap-2">
                {/* Whatsapp */}
                <a
                  href={shareUrls.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-card transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>WhatsApp</span>
                </a>
                
                {/* Facebook */}
                <a
                  href={shareUrls.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-card transition-colors cursor-pointer"
                >
                  <Facebook className="w-4 h-4 fill-current" />
                  <span>Facebook</span>
                </a>

                {/* Twitter */}
                <a
                  href={shareUrls.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-card transition-colors cursor-pointer"
                >
                  <Twitter className="w-4 h-4 fill-current" />
                  <span>Twitter</span>
                </a>

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-200/50 dark:bg-neutral-800 text-neutral-700 dark:text-white hover:bg-neutral-350 hover:dark:bg-neutral-750 text-[10px] font-bold uppercase tracking-wider rounded-card transition-colors cursor-pointer"
                >
                  <Link2 className="w-4 h-4" />
                  <span>Copy Link</span>
                </button>
              </div>
            </div>

          </article>

          {/* Table of Contents (Right Column) - Sticky */}
          <aside className="lg:col-span-4 sticky top-24 hidden lg:block space-y-6">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 shadow-sm space-y-4">
              <h3 className="font-black text-xs text-neutral-900 dark:text-white uppercase tracking-widest border-b border-neutral-100 dark:border-neutral-800 pb-2.5 flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-primary-500" />
                {t('blog.toc_title', 'Table of Contents')}
              </h3>

              <nav className="space-y-2">
                {post.headings.map(h => {
                  const isActive = activeHeadingId === h.id;
                  return (
                    <button
                      key={h.id}
                      onClick={() => scrollToSection(h.id)}
                      className={`w-full text-left text-xs font-bold py-1.5 px-2.5 rounded-card transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-primary-500/10 text-primary-500'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-850'
                      }`}
                    >
                      {currentLang === 'ta' ? h.textTamil : h.text}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

        </div>

        {/* Related Posts Grid */}
        {relatedPosts.length > 0 && (
          <div className="pt-16 border-t border-neutral-200 dark:border-neutral-800 space-y-6">
            <h2 className="text-xl sm:text-2xl font-black font-heading text-neutral-900 dark:text-white">
              {t('blog.related_title', 'Related Articles')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map(rel => (
                <div
                  key={rel.slug}
                  className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature overflow-hidden flex flex-col shadow-sm hover:translate-y-[-8px] hover:shadow-lg transition-all duration-normal"
                >
                  <div className="h-44 relative overflow-hidden bg-neutral-100">
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white line-clamp-2 leading-snug">
                        {currentLang === 'ta' ? rel.titleTamil : rel.title}
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-450 line-clamp-2 leading-relaxed font-semibold">
                        {currentLang === 'ta' ? rel.excerptTamil : rel.excerpt}
                      </p>
                    </div>
                    <Link
                      href={`/blog/${rel.slug}`}
                      className="inline-flex items-center gap-1 text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline"
                    >
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
