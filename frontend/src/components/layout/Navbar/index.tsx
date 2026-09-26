"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { NavbarProps } from './Navbar.types';
import { MobileMenu } from '../MobileMenu';
import { SpotlightSearchModal } from './SpotlightSearchModal';
import { useCartStore } from '@/store/cartStore';
import { useWishlist } from '@/hooks/useWishlist';
import { 
  Search, 
  Heart, 
  ShoppingBag, 
  User, 
  LogOut, 
  ChevronDown, 
  ShieldCheck, 
  Leaf, 
  ArrowRight,
  Sparkles,
  Zap,
  Phone,
  Flame,
  Truck,
  Droplets,
  PackageCheck,
  Star,
  CheckCircle2,
  Menu
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuthStore } from '@/store/auth-store';
import { SignOutModal } from '@/components/auth/SignOutModal';
import apiClient from '@/lib/apiClient';

// Authentic South Indian Category Pillars & Real Products from Catalog
interface MegaMenuProduct {
  nameEn: string;
  nameTa: string;
  slug: string;
  highlight?: string;
}

interface MegaMenuCategory {
  slug: string;
  nameEn: string;
  nameTa: string;
  icon: string;
  fallbackCount: number;
  items: MegaMenuProduct[];
}

interface MegaMenuColumn {
  titleEn: string;
  titleTa: string;
  tag: string;
  tagColor: string;
  categories: MegaMenuCategory[];
}

const realMegaMenuColumns: MegaMenuColumn[] = [
  {
    titleEn: 'Oils, Flours & Noodles',
    titleTa: 'எண்ணெய், மாவு & நூடுல்ஸ்',
    tag: 'Cold-Pressed • Unrefined',
    tagColor: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300',
    categories: [
      {
        slug: 'traditional-oils',
        nameEn: 'Traditional Oils',
        nameTa: 'பாரம்பரிய எண்ணெய்கள்',
        icon: '🫒',
        fallbackCount: 4,
        items: [
          { nameEn: 'Wood Pressed Sesame Oil', nameTa: 'மரச்செக்கு நல்லெண்ணெய்', slug: 'wood-pressed-sesame-oil', highlight: 'Bestseller' },
          { nameEn: 'Wood Pressed Groundnut Oil', nameTa: 'மரச்செக்கு கடலை எண்ணெய்', slug: 'wood-pressed-groundnut-oil' },
          { nameEn: 'Wood Pressed Coconut Oil', nameTa: 'மரச்செக்கு தேங்காய் எண்ணெய்', slug: 'wood-pressed-coconut-oil' },
          { nameEn: 'Pure Castor Oil', nameTa: 'ஆமணக்கு எண்ணெய்', slug: 'castor-oil' },
        ],
      },
      {
        slug: 'healthy-flours',
        nameEn: 'Healthy Grain Flours',
        nameTa: 'தானிய மாவுகள்',
        icon: '🌾',
        fallbackCount: 2,
        items: [
          { nameEn: 'Finger Millet Flour', nameTa: 'ராகி மாவு', slug: 'finger-millet-flour' },
          { nameEn: 'Stone-Ground Wheat Flour', nameTa: 'கோதுமை மாவு', slug: 'wheat-flour' },
        ],
      },
      {
        slug: 'millet-noodles',
        nameEn: 'Millet Noodles & Vermicelli',
        nameTa: 'நூடுல்ஸ் & சேமியா',
        icon: '🍜',
        fallbackCount: 11,
        items: [
          { nameEn: 'Karupu Kavuni Rice Noodles', nameTa: 'கருப்பு கவுனி நூடுல்ஸ்', slug: 'karupu-kavuni-rice-noodles' },
          { nameEn: 'Pearl Millet Vermicelli', nameTa: 'கம்பு சேமியா', slug: 'pearl-millet-vermicelli' },
        ],
      },
    ],
  },
  {
    titleEn: 'Heritage Rice & Millets',
    titleTa: 'பாரம்பரிய அரிசி & சிறுதானியங்கள்',
    tag: 'Low GI • High Immunity',
    tagColor: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300',
    categories: [
      {
        slug: 'traditional-rices',
        nameEn: 'Traditional Heritage Rices',
        nameTa: 'பாரம்பரிய அரிசி வகைகள்',
        icon: '🌾',
        fallbackCount: 12,
        items: [
          { nameEn: 'Karupu Kavuni Rice Boiled', nameTa: 'கருப்பு கவுனி அரிசி', slug: 'karupu-kavuni-rice-boiled', highlight: 'Royal Grain' },
          { nameEn: 'Mappillai Samba Rice Boiled', nameTa: 'மாப்பிள்ளை சம்பா அரிசி', slug: 'mappillai-samba-rice-boiled', highlight: 'Stamina' },
          { nameEn: 'Poongar Traditional Rice', nameTa: 'பூங்கார் பாரம்பரிய அரிசி', slug: 'poongar-rice-boiled' },
          { nameEn: 'Rathasali Heritage Rice', nameTa: 'ரத்தசாலி அரிசி', slug: 'rathasali-rice-boiled' },
        ],
      },
      {
        slug: 'organic-millets',
        nameEn: 'Organic Native Millets',
        nameTa: 'இயற்கை சிறுதானியங்கள்',
        icon: '🥣',
        fallbackCount: 8,
        items: [
          { nameEn: 'Native Finger Millet', nameTa: 'நாட்டு ராகி', slug: 'native-finger-millet' },
          { nameEn: 'Native Pearl Millet', nameTa: 'நாட்டு கம்பு', slug: 'native-pearl-millet' },
          { nameEn: 'White Sorghum', nameTa: 'வெள்ளை சோளம்', slug: 'white-sorghum' },
        ],
      },
      {
        slug: 'millet-rice-flakes',
        nameEn: 'Millet & Rice Flakes (Aval)',
        nameTa: 'சிறுதானிய & அரிசி அவல்',
        icon: '🥣',
        fallbackCount: 5,
        items: [
          { nameEn: 'Pearl Millet Flakes', nameTa: 'கம்பு அவல்', slug: 'pearl-millet-flakes' },
          { nameEn: 'White Sorghum Flakes', nameTa: 'சோள அவல்', slug: 'white-sorghum-flakes' },
        ],
      },
    ],
  },
  {
    titleEn: 'Natural Sweets, Snacks & Dals',
    titleTa: 'இனிப்புகள், தின்பண்டங்கள் & பருப்பு',
    tag: 'Pure Palm • Chemical Free',
    tagColor: 'text-orange-700 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-300',
    categories: [
      {
        slug: 'natural-sweeteners',
        nameEn: 'Natural Sweeteners & Salts',
        nameTa: 'இயற்கை இனிப்புகள் & உப்பு',
        icon: '🍯',
        fallbackCount: 7,
        items: [
          { nameEn: 'Natural Wild Honey', nameTa: 'சுத்தமான காட்டு தேன்', slug: 'natural-wild-honey', highlight: 'Wild Forest' },
          { nameEn: 'Palm Jaggery Round', nameTa: 'பனங்கருப்பட்டி', slug: 'palm-jaggery-round', highlight: 'Pure Palm' },
          { nameEn: 'Sugarcane Jaggery Powder', nameTa: 'நாட்டு சர்க்கரை', slug: 'sugarcane-jaggery-powder' },
          { nameEn: 'Himalayan Crystal Salt', nameTa: 'இமாலயன் கல் உப்பு', slug: 'himalayan-crystal-salt' },
        ],
      },
      {
        slug: 'traditional-snacks-sweets',
        nameEn: 'Traditional Snacks & Sweets',
        nameTa: 'பாரம்பரிய தின்பண்டங்கள்',
        icon: '🍘',
        fallbackCount: 26,
        items: [
          { nameEn: 'Fried Native Groundnut', nameTa: 'வறுத்த சிறுமணி நிலக்கடலை', slug: 'fried-native-sirumani-groundnut', highlight: 'Fresh' },
          { nameEn: 'Traditional Achu Murukku', nameTa: 'பாரம்பரிய அச்சு முறுக்கு', slug: 'achu-murukku' },
          { nameEn: 'Crispy Sesame Seedai', nameTa: 'எள்ளு சீடை', slug: 'sesame-seedai' },
        ],
      },
      {
        slug: 'organic-pulses-dals',
        nameEn: 'Organic Pulses & Dals',
        nameTa: 'இயற்கை பருப்பு வகைகள்',
        icon: '🌱',
        fallbackCount: 10,
        items: [
          { nameEn: 'Mud-Packed Toor Dal', nameTa: 'மண் பக்குவ துவரம் பருப்பு', slug: 'mud-packed-toor-dal' },
          { nameEn: 'Native Moong Dal', nameTa: 'பாசிப்பருப்பு', slug: 'moong-dal' },
          { nameEn: 'Black Urad Dal', nameTa: 'கருப்பு உளுந்து', slug: 'black-urad-dal' },
        ],
      },
    ],
  },
];

export const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const pathname = usePathname();
  const router = useRouter();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const megaMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cart & Wishlist live data
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const openMiniCart = useCartStore((state) => state.openMiniCart);
  const wishlistCount = useWishlist((state) => state.items.length);
  const { user, isLoggedIn, role } = useAuthStore();
  const isAdmin = role === 'admin' || user?.role?.toLowerCase() === 'admin';

  // Live category counts & spotlight data from catalog API
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [spotlightProduct, setSpotlightProduct] = useState<{
    nameEn: string;
    nameTa: string;
    slug: string;
    price: number;
    originalPrice: number;
    imageUrl: string;
    rating: number;
    reviewsCount: number;
  }>({
    nameEn: 'Wood Pressed Sesame Oil',
    nameTa: 'மரச்செக்கு நல்லெண்ணெய்',
    slug: 'wood-pressed-sesame-oil',
    price: 350,
    originalPrice: 380,
    imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Sesame_oil_label.jpg/960px-Sesame_oil_label.jpg',
    rating: 5.0,
    reviewsCount: 240,
  });

  useEffect(() => {
    // 1. Fetch live categories to sync counts
    apiClient.get('/api/v1/cms/categories')
      .then((res) => {
        if (res?.data?.categories && Array.isArray(res.data.categories)) {
          const map: Record<string, number> = {};
          res.data.categories.forEach((cat: any) => {
            if (cat.slug) {
              map[cat.slug] = cat._count?.products ?? 0;
            }
          });
          setCategoryCounts(map);
        }
      })
      .catch(() => {});

    // 2. Fetch live top-rated product for spotlight
    apiClient.get('/api/v1/cms/products?limit=1&sortBy=rating&sortOrder=desc')
      .then((res) => {
        if (res?.data?.products && res.data.products.length > 0) {
          const top = res.data.products[0];
          setSpotlightProduct({
            nameEn: top.nameEn,
            nameTa: top.nameTa || top.nameEn,
            slug: top.slug,
            price: Number(top.variants?.[0]?.discountPrice || top.variants?.[0]?.price || 350),
            originalPrice: Number(top.variants?.[0]?.price || 380),
            imageUrl: top.thumbnailUrl || 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Sesame_oil_label.jpg/960px-Sesame_oil_label.jpg',
            rating: top.rating || 5.0,
            reviewsCount: top.reviewsCount || 240,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Language switch
  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ta' : 'en';
    i18n.changeLanguage(nextLang);
  };

  // Close dropdowns on route changes
  useEffect(() => {
    setIsMegaMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsSpotlightOpen(false);
  }, [pathname]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setIsMegaMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Monitor scroll height
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global Ctrl+K / Cmd+K listener to open spotlight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSpotlightOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMouseEnterMega = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current);
    setIsMegaMenuOpen(true);
  };

  const handleMouseLeaveMega = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 200);
  };

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header
        className={twMerge(
          clsx(
            'sticky top-0 w-full transition-all duration-300 z-[1020]',
            'bg-white/90 dark:bg-neutral-900/90 backdrop-blur-2xl border-b border-neutral-200/80 dark:border-neutral-800',
            isScrolled 
              ? 'shadow-[0_10px_30px_rgba(0,0,0,0.06)] py-1.5 sm:py-2' 
              : 'py-2 sm:py-2.5'
          ),
          className
        )}
      >
        {/* Subtle specular top highlight line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent pointer-events-none" />

        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
            
            {/* 1. Left: Mobile Hamburger & Nourish Clean Brand Emblem */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 -ml-1.5 rounded-xl text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Open navigation menu"
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span className="w-full h-0.5 bg-current rounded-full" />
                  <span className="w-3/4 h-0.5 bg-current rounded-full" />
                  <span className="w-full h-0.5 bg-current rounded-full" />
                </div>
              </button>

              {/* Exact Clean Brand Emblem from Reference Image */}
              <Link href="/" className="flex flex-col items-center group focus:outline-none select-none text-center">
                {/* Two Organic Curved Leaves Sprout Logo Mark */}
                <div className="flex items-center justify-center text-[#2D6A4F] dark:text-emerald-400 mb-0.5 group-hover:scale-105 transition-transform">
                  <svg width="24" height="20" viewBox="0 0 24 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 18.5C12 18.5 10.8 12.8 6.5 9.8C2.5 7 1.8 2.5 1.8 2.5C1.8 2.5 6.4 2 9.5 6C11.5 8.7 12 12.5 12 18.5Z" opacity="0.95" />
                    <path d="M12 18.5C12 18.5 13.2 12.8 17.5 9.8C21.5 7 22.2 2.5 22.2 2.5C22.2 2.5 17.6 2 14.5 6C12.5 8.7 12 12.5 12 18.5Z" />
                  </svg>
                </div>
                <span className="text-sm sm:text-base font-bold tracking-[0.18em] text-neutral-900 dark:text-white uppercase leading-tight font-sans">
                  YATHU AROKIYAGAM
                </span>
                <span className="text-[7px] font-semibold tracking-[0.18em] text-neutral-500 dark:text-neutral-400 uppercase mt-0.5">
                  PURE &amp; NATURAL FOODS
                </span>
              </Link>
            </div>

            {/* 2. Center: Exact Clean Navigation Links from Reference Image */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-neutral-800 dark:text-neutral-200">
              
              {/* HOME */}
              <Link
                href="/"
                className={clsx(
                  "relative text-xs font-semibold tracking-[0.16em] uppercase py-2 transition-colors hover:text-[#2D6A4F] dark:hover:text-emerald-400",
                  pathname === '/'
                    ? "text-neutral-900 dark:text-white font-bold after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-[2px] after:bg-neutral-900 dark:after:bg-white"
                    : "text-neutral-700 dark:text-neutral-300"
                )}
              >
                HOME
              </Link>

              {/* OUR STORY */}
              <Link
                href="/about"
                className={clsx(
                  "relative text-xs font-semibold tracking-[0.16em] uppercase py-2 transition-colors hover:text-[#2D6A4F] dark:hover:text-emerald-400",
                  pathname === '/about'
                    ? "text-neutral-900 dark:text-white font-bold after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-[2px] after:bg-neutral-900 dark:after:bg-white"
                    : "text-neutral-700 dark:text-neutral-300"
                )}
              >
                OUR STORY
              </Link>

              {/* PRODUCTS ˅ with Mega Menu Dropdown */}
              <div 
                className="relative" 
                ref={megaMenuRef}
                onMouseEnter={handleMouseEnterMega}
                onMouseLeave={handleMouseLeaveMega}
              >
                <Link
                  href="/shop"
                  className={clsx(
                    "relative text-xs font-semibold tracking-[0.16em] uppercase py-2 transition-colors flex items-center gap-1 hover:text-[#2D6A4F] dark:hover:text-emerald-400 cursor-pointer",
                    pathname.startsWith('/shop') && !pathname.includes('recipes')
                      ? "text-neutral-900 dark:text-white font-bold"
                      : "text-neutral-700 dark:text-neutral-300"
                  )}
                >
                  <span>PRODUCTS</span>
                  <ChevronDown className={clsx("w-3 h-3 transition-transform duration-200", isMegaMenuOpen && "rotate-180")} />
                </Link>

                {/* Floating 4-Column Luxury Mega Menu Flyout */}
                <AnimatePresence>
                  {isMegaMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-2.5 w-[920px] rounded-3xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-[0_24px_60px_rgba(0,0,0,0.18)] p-6 z-50 font-sans"
                    >
                      {/* 4 Columns Grid */}
                      <div className="grid grid-cols-4 gap-6">
                        
                        {/* 3 Real Categories Columns */}
                        {realMegaMenuColumns.map((col, idx) => (
                          <div key={idx} className="space-y-4">
                            <div className="pb-1 border-b border-neutral-100 dark:border-neutral-800">
                              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block line-clamp-1">
                                {currentLang === 'ta' ? col.titleTa : col.titleEn}
                              </span>
                              <span className={clsx("inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-1", col.tagColor)}>
                                {col.tag}
                              </span>
                            </div>

                            <div className="space-y-3.5">
                              {col.categories.map((cat, cIdx) => (
                                <div key={cIdx} className="space-y-1">
                                  {/* Category Header */}
                                  <div className="flex items-center justify-between group/cat">
                                    <Link
                                      href={`/shop?category=${cat.slug}`}
                                      onClick={() => setIsMegaMenuOpen(false)}
                                      className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-white hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                                    >
                                      <span className="text-sm shrink-0">{cat.icon}</span>
                                      <span className="truncate">{currentLang === 'ta' ? cat.nameTa : cat.nameEn}</span>
                                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover/cat:opacity-100 group-hover/cat:translate-x-0 transition-all text-emerald-600 dark:text-emerald-400 shrink-0" />
                                    </Link>
                                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 shrink-0 ml-1">
                                      {categoryCounts[cat.slug] ?? cat.fallbackCount}
                                    </span>
                                  </div>

                                  {/* Real Products in this Category */}
                                  <div className="flex flex-col gap-0.5 pl-5 border-l border-neutral-100 dark:border-neutral-800/80">
                                    {cat.items.map((sub, sIdx) => (
                                      <Link
                                        key={sIdx}
                                        href={`/shop/${sub.slug}`}
                                        onClick={() => setIsMegaMenuOpen(false)}
                                        className="group/item flex items-center justify-between py-0.5 px-1 rounded hover:bg-neutral-100/80 dark:hover:bg-neutral-800/80 transition-colors text-left"
                                      >
                                        <span className="text-[11px] text-neutral-600 dark:text-neutral-400 group-hover/item:text-emerald-700 dark:group-hover/item:text-emerald-300 transition-colors truncate">
                                          {currentLang === 'ta' ? sub.nameTa : sub.nameEn}
                                        </span>
                                        {sub.highlight && (
                                          <span className="text-[8px] font-extrabold uppercase px-1 py-0.2 rounded bg-amber-400/20 text-amber-800 dark:text-amber-300 shrink-0 ml-1">
                                            {sub.highlight}
                                          </span>
                                        )}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* Column 4: Today's Harvest Spotlight Card (Real Product) */}
                        <div className="rounded-2xl bg-gradient-to-br from-emerald-950 via-neutral-900 to-teal-950 text-white p-4 flex flex-col justify-between relative overflow-hidden shadow-lg border border-emerald-500/30">
                          <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
                          
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                <span>Harvest Spotlight</span>
                              </span>
                              <span className="text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.2 rounded-full">
                                #1 Bestseller
                              </span>
                            </div>

                            <div className="w-full h-24 rounded-xl overflow-hidden mb-3 bg-neutral-800 border border-white/10 relative">
                              <img
                                src={spotlightProduct.imageUrl}
                                alt={currentLang === 'ta' ? spotlightProduct.nameTa : spotlightProduct.nameEn}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            </div>

                            <h4 className="text-xs font-bold text-white line-clamp-1">
                              {currentLang === 'ta' ? spotlightProduct.nameTa : spotlightProduct.nameEn}
                            </h4>
                            <p className="text-[10px] text-neutral-300 line-clamp-2 mt-0.5">
                              {currentLang === 'ta' ? '100% தூய முதல் தரம், எந்தவித ரசாயனமும் அற்றது.' : 'Single-origin traditional cold-pressed, zero hexane.'}
                            </p>

                            <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold mt-1.5">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span>{spotlightProduct.rating.toFixed(1)} ({spotlightProduct.reviewsCount}+ ratings)</span>
                            </div>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                            <div>
                              <span className="text-xs font-black text-white">₹{spotlightProduct.price}</span>
                              {spotlightProduct.originalPrice > spotlightProduct.price && (
                                <span className="text-[10px] text-neutral-400 line-through ml-1">₹{spotlightProduct.originalPrice}</span>
                              )}
                            </div>
                            <Link
                              href={`/shop/${spotlightProduct.slug}`}
                              onClick={() => setIsMegaMenuOpen(false)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                            >
                              <span>Shop</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>

                      </div>

                      {/* Mega Menu Footer Banner */}
                      <div className="mt-5 pt-3.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-amber-500/10 -mx-6 -mb-6 p-4 rounded-b-3xl">
                        <div className="flex items-center gap-3 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                            <Truck className="w-4 h-4 text-emerald-600" />
                            <span>Free Express Farm Delivery on ₹499+</span>
                          </div>
                          <span className="text-neutral-300 dark:text-neutral-700">•</span>
                          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                            <ShieldCheck className="w-4 h-4 text-amber-600" />
                            <span>100% Lab Tested Purity Guarantee</span>
                          </div>
                        </div>

                        <Link
                          href="/shop"
                          onClick={() => setIsMegaMenuOpen(false)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          <span>{currentLang === 'ta' ? 'அனைத்து 85+ பொருட்களும்' : 'Explore All 85+ Staples'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SHOP */}
              <Link
                href="/shop"
                className={clsx(
                  "relative text-xs font-semibold tracking-[0.16em] uppercase py-2 transition-colors hover:text-[#2D6A4F] dark:hover:text-emerald-400",
                  pathname === '/shop'
                    ? "text-neutral-900 dark:text-white font-bold after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-[2px] after:bg-neutral-900 dark:after:bg-white"
                    : "text-neutral-700 dark:text-neutral-300"
                )}
              >
                SHOP
              </Link>

              {/* BLOGS */}
              <Link
                href="/blog"
                className={clsx(
                  "relative text-xs font-semibold tracking-[0.16em] uppercase py-2 transition-colors hover:text-[#2D6A4F] dark:hover:text-emerald-400",
                  pathname.startsWith('/blog')
                    ? "text-neutral-900 dark:text-white font-bold after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-[2px] after:bg-neutral-900 dark:after:bg-white"
                    : "text-neutral-700 dark:text-neutral-300"
                )}
              >
                BLOGS
              </Link>



              {/* CONTACT */}
              <Link
                href="/contact"
                className={clsx(
                  "relative text-xs font-semibold tracking-[0.16em] uppercase py-2 transition-colors hover:text-[#2D6A4F] dark:hover:text-emerald-400",
                  pathname === '/contact'
                    ? "text-neutral-900 dark:text-white font-bold after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-[2px] after:bg-neutral-900 dark:after:bg-white"
                    : "text-neutral-700 dark:text-neutral-300"
                )}
              >
                CONTACT
              </Link>
            </nav>

            {/* 3. Right: Exact 3 Clean Outline Icons (Search, User, Cart) */}
            <div className="flex items-center gap-4 sm:gap-6 text-neutral-800 dark:text-neutral-200">
              
              {/* 1. Search Icon Button */}
              <button
                type="button"
                onClick={() => setIsSpotlightOpen(true)}
                className="p-1 text-neutral-800 dark:text-neutral-200 hover:text-[#2D6A4F] dark:hover:text-emerald-400 transition-colors cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-5 h-5 stroke-[1.6]" />
              </button>

              {/* 2. User Account Icon */}
              {isLoggedIn ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="p-1.5 text-neutral-800 dark:text-neutral-200 hover:text-[#2D6A4F] dark:hover:text-emerald-400 transition-colors cursor-pointer"
                    aria-label="Account menu"
                  >
                    <User className="w-5 h-5 stroke-[1.6]" />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl p-2 z-50 font-sans"
                      >
                        <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">{user?.name || 'Customer'}</p>
                          <p className="text-[10px] text-neutral-500 truncate">{user?.email || user?.mobile}</p>
                        </div>
                        {isAdmin && (
                          <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-amber-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Admin Portal</span>
                          </Link>
                        )}
                        <Link href="/account" className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">
                          <User className="w-3.5 h-3.5" />
                          <span>My Account</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => { setIsUserMenuOpen(false); setShowSignOutModal(true); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="p-1.5 text-neutral-800 dark:text-neutral-200 hover:text-[#2D6A4F] dark:hover:text-emerald-400 transition-colors cursor-pointer"
                  aria-label="Sign in"
                >
                  <User className="w-5 h-5 stroke-[1.6]" />
                </Link>
              )}

              {/* 3. Shopping Cart Icon with Clean Circle Badge */}
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); openMiniCart(); }}
                className="relative p-1.5 text-neutral-800 dark:text-neutral-200 hover:text-[#2D6A4F] dark:hover:text-emerald-400 transition-colors cursor-pointer"
                aria-label={`Shopping cart with ${cartCount} items`}
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.6]" />
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#183F2D] text-white text-[9.5px] font-bold flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* Spotlight Search Modal (Command Palette) */}
      <SpotlightSearchModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
      />

      {/* Mobile Drawer Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Sign Out Modal */}
      <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
      />
    </>
  );
};
