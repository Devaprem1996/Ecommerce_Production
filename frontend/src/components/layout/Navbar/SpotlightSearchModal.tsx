"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Tag, 
  ChevronRight,
  Package,
  Command,
  CornerDownLeft
} from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { mockProducts } from '@/constants/mockData';
import { mapProductToFrontend } from '@/utils/apiMapper';
import { ProductType } from '@/types';

interface SpotlightSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const trendingTerms = [
  { term: 'Vaagai Sesame Oil', termTa: 'மரச்செக்கு நல்லெண்ணெய்', slug: 'cold-pressed-oils' },
  { term: 'Karuppu Kavuni Rice', termTa: 'கருப்பு கவுனி அரிசி', slug: 'traditional-rices' },
  { term: 'Udangudi Karupatti', termTa: 'உடன்குடி பனை கருப்பட்டி', slug: 'natural-sweeteners' },
  { term: 'Native A2 Cow Ghee', termTa: 'நாட்டு மாட்டு நெய்', slug: 'pure-ghee-honey' },
  { term: 'Mappillai Samba', termTa: 'மாப்பிள்ளை சம்பா அரிசி', slug: 'traditional-rices' },
  { term: 'Traditional Idli Podi', termTa: 'கைக்குத்தல் இட்லி பொடி', slug: 'authentic-podi-masala' },
];

const categoryShortcuts = [
  { nameEn: 'Wood-Pressed Oils', nameTa: 'மரச்செக்கு எண்ணெய்', slug: 'cold-pressed-oils', icon: '🫒' },
  { nameEn: 'Heritage Rice', nameTa: 'பாரம்பரிய அரிசி', slug: 'traditional-rices', icon: '🌾' },
  { nameEn: 'Natural Sweeteners', nameTa: 'பனை கருப்பட்டி', slug: 'natural-sweeteners', icon: '🍯' },
  { nameEn: 'Native Millets', nameTa: 'சிறுதானியங்கள்', slug: 'organic-millets', icon: '🥣' },
  { nameEn: 'Healthy Snacks', nameTa: 'தின்பண்டங்கள்', slug: 'traditional-snacks-sweets', icon: '🍘' },
  { nameEn: 'Traditional Flours', nameTa: 'தானிய மாவு', slug: 'healthy-flours', icon: '🌾' },
];

export const SpotlightSearchModal: React.FC<SpotlightSearchModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(-1);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Global ESC and Ctrl/Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Live search debounced
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await apiClient.get('/api/v1/cms/products', {
          params: { search: trimmed, limit: '8' }
        });
        if (res?.data?.products && Array.isArray(res.data.products)) {
          setResults(res.data.products.map(mapProductToFrontend));
        } else {
          // Fallback to local filter
          const filtered = mockProducts.filter(p => 
            p.name.toLowerCase().includes(trimmed.toLowerCase()) ||
            (p.nameTamil && p.nameTamil.includes(trimmed)) ||
            p.category.toLowerCase().includes(trimmed.toLowerCase())
          );
          setResults(filtered);
        }
      } catch (err) {
        // Fallback filter
        const filtered = mockProducts.filter(p => 
          p.name.toLowerCase().includes(trimmed.toLowerCase()) ||
          (p.nameTamil && p.nameTamil.includes(trimmed))
        );
        setResults(filtered);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectTerm = (term: string) => {
    router.push(`/search?q=${encodeURIComponent(term)}`);
    onClose();
  };

  const handleSelectProduct = (product: ProductType) => {
    router.push(`/shop?category=${encodeURIComponent(product.category.toLowerCase().replace(/\s+/g, '-'))}`);
    onClose();
  };

  const handleKeyDownInput = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelectProduct(results[selectedIndex]);
      } else if (query.trim()) {
        handleSelectTerm(query.trim());
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1100] flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 font-sans">
          {/* Glass backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-950/70 backdrop-blur-md transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-neutral-200/80 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Search Input Bar */}
            <div className="relative flex items-center px-4 sm:px-5 py-3.5 border-b border-neutral-200/80 dark:border-neutral-800">
              <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDownInput}
                placeholder={currentLang === 'ta' ? 'தேடுக: மரச்செக்கு நல்லெண்ணெய், கருப்பு கவுனி, பனை கருப்பட்டி...' : 'Search wood-pressed oils, Karuppu Kavuni, jaggery...'}
                className="flex-1 bg-transparent px-3 text-sm sm:text-base font-semibold text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 outline-none"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-750 px-2 py-0.5 rounded-lg select-none">
                  ESC
                </kbd>
              )}
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
              {/* If user is typing */}
              {query.trim().length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      {currentLang === 'ta' ? 'பொருட்கள் முடிவுகள்' : 'Product Matches'}
                    </span>
                    {isLoading && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold animate-pulse">
                        {currentLang === 'ta' ? 'தேடுகிறது...' : 'Searching catalog...'}
                      </span>
                    )}
                  </div>

                  {results.length > 0 ? (
                    <div className="space-y-1.5">
                      {results.map((product, idx) => (
                        <div
                          key={product.id}
                          onClick={() => handleSelectProduct(product)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all ${
                            selectedIndex === idx
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30'
                              : 'hover:bg-neutral-50 dark:hover:bg-neutral-850 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0 border border-neutral-200/60 dark:border-neutral-750">
                              <img
                                src={product.images[0] || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=200'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate">
                                {currentLang === 'ta' && product.nameTamil ? product.nameTamil : product.name}
                              </span>
                              <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                                <span className="text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider">
                                  {product.category}
                                </span>
                                <span>•</span>
                                <span>100% Traditional</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 ml-3">
                            <div className="text-right">
                              <span className="text-xs sm:text-sm font-black text-emerald-800 dark:text-emerald-300">
                                ₹{product.price}
                              </span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-[10px] text-neutral-400 line-through block">
                                  ₹{product.originalPrice}
                                </span>
                              )}
                            </div>
                            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* View all button */}
                      <button
                        type="button"
                        onClick={() => handleSelectTerm(query)}
                        className="w-full mt-3 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <span>
                          {currentLang === 'ta'
                            ? `"${query}"க்கான அனைத்து முடிவுகளையும் காண்க`
                            : `View all results for "${query}"`}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : !isLoading ? (
                    <div className="text-center py-8 space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
                        <Package className="w-6 h-6" />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-neutral-200">
                        {currentLang === 'ta' ? 'பொருட்கள் எதுவும் கிடைக்கவில்லை' : `No organic products matching "${query}"`}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {currentLang === 'ta' ? 'மரச்செக்கு நல்லெண்ணெய் அல்லது கருப்பு கவுனி போன்ற சொற்களை முயற்சிக்கவும்' : 'Try searching for "sesame oil", "rice", or "karupatti"'}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                /* Default View: Trending Searches + Category Quick Jump */
                <div className="space-y-6">
                  {/* Trending Organic Searches */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2.5">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                      <span>{currentLang === 'ta' ? 'பிரபலமான இயற்கை தேடல்கள்' : 'Trending Organic Staples'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {trendingTerms.map((item) => (
                        <button
                          key={item.term}
                          type="button"
                          onClick={() => handleSelectTerm(item.term)}
                          className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-emerald-50 dark:bg-neutral-800 dark:hover:bg-emerald-950/40 text-neutral-700 dark:text-neutral-300 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-semibold transition-all cursor-pointer border border-neutral-200/60 dark:border-neutral-750"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500 group-hover:scale-110 transition-transform" />
                          <span>{currentLang === 'ta' ? item.termTa : item.term}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Explore Categories Shortcuts */}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{currentLang === 'ta' ? 'வகைகள் வழி தேடுக' : 'Quick Jump by Category'}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {categoryShortcuts.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={`/shop?category=${cat.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-neutral-50 hover:bg-emerald-50/60 dark:bg-neutral-850 dark:hover:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-750 hover:border-emerald-500/30 transition-all text-left group"
                        >
                          <span className="text-xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 truncate">
                              {currentLang === 'ta' ? cat.nameTa : cat.nameEn}
                            </span>
                            <span className="text-[10px] text-neutral-400">100% Native</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Trust Micro-Banner */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-amber-500/10 border border-emerald-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                        {currentLang === 'ta' ? 'தமிழ்நாடெங்கும் ₹499க்கு மேல் இலவச விநியோகம்' : 'Free Express Farm Delivery across South India on ₹499+'}
                      </span>
                    </div>
                    <Link
                      href="/shop"
                      onClick={onClose}
                      className="text-xs font-black text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Shop Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Shortcuts */}
            <div className="px-4 py-2.5 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/80 flex items-center justify-between text-[11px] text-neutral-500 select-none">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-750 font-mono text-[10px]">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-750 font-mono text-[10px]">↓</kbd>
                  <span className="hidden sm:inline">to navigate</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-750 font-mono text-[10px]">↵</kbd>
                  <span className="hidden sm:inline">to select</span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-750 font-mono text-[10px]">esc</kbd>
                  <span className="hidden sm:inline">to close</span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Yathu Arokiyagam Live Search</span>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
