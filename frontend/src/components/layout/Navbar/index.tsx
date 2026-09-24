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

// Authentic South Indian Category Pillars for Mega Dropdown
const megaMenuCategories = [
  {
    titleEn: 'Wood-Pressed Oils & Ghee',
    titleTa: 'மரச்செக்கு எண்ணெய் & நெய்',
    tag: 'Cold-Pressed • 0% Chemicals',
    tagColor: 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300',
    items: [
      { nameEn: 'Vaagai Wood-Pressed Sesame Oil', nameTa: 'வாகை மரச்செக்கு நல்லெண்ணெய்', slug: 'cold-pressed-oils', icon: '🫒', highlight: 'Bestseller' },
      { nameEn: 'Wood-Pressed Groundnut Oil', nameTa: 'மரச்செக்கு கடலை எண்ணெய்', slug: 'cold-pressed-oils', icon: '🥜' },
      { nameEn: 'Cold-Pressed Virgin Coconut Oil', nameTa: 'மரச்செக்கு தேங்காய் எண்ணெய்', slug: 'cold-pressed-oils', icon: '🥥' },
      { nameEn: 'Pure Native A2 Cow Ghee', nameTa: 'தூய நாட்டு மாட்டு நெய்', slug: 'pure-ghee-honey', icon: '🧈', highlight: 'Pure Desi' },
      { nameEn: 'Authentic Pure Castor Oil', nameTa: 'இயற்கை ஆமணக்கு எண்ணெய்', slug: 'cold-pressed-oils', icon: '🌿' },
    ]
  },
  {
    titleEn: 'Heritage Rice & Millets',
    titleTa: 'பாரம்பரிய அரிசி & சிறுதானியங்கள்',
    tag: 'Low GI • High Immunity',
    tagColor: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300',
    items: [
      { nameEn: 'Karuppu Kavuni Black Rice', nameTa: 'கருப்பு கவுனி அரிசி', slug: 'traditional-rices', icon: '🌾', highlight: 'Royal Grain' },
      { nameEn: 'Mappillai Samba Red Rice', nameTa: 'மாப்பிள்ளை சம்பா அரிசி', slug: 'traditional-rices', icon: '🍚', highlight: 'High Stamina' },
      { nameEn: 'Poongar Traditional Rice', nameTa: 'பூங்கார் பாரம்பரிய அரிசி', slug: 'traditional-rices', icon: '🌾' },
      { nameEn: 'Kodo & Barnyard Millet', nameTa: 'வரகு & குதிரைவாலி தினை', slug: 'organic-millets', icon: '🥣' },
      { nameEn: 'Sprouted Herbal Porridge Mix', nameTa: 'முளைகட்டிய சத்துமாவு கஞ்சி', slug: 'herbal-health-mix', icon: '🌿' },
    ]
  },
  {
    titleEn: 'Natural Sweets & Pantry',
    titleTa: 'இயற்கை இனிப்புகள் & மசாலா',
    tag: 'Unrefined • Pure Jaggery',
    tagColor: 'text-orange-700 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-300',
    items: [
      { nameEn: 'Udangudi Palm Jaggery (Karupatti)', nameTa: 'உடன்குடி பனை கருப்பட்டி', slug: 'natural-sweeteners', icon: '🍯', highlight: 'Direct Palm' },
      { nameEn: 'Native Country Sugar (Nattu Sakkarai)', nameTa: 'இயற்கை நாட்டு சர்க்கரை', slug: 'natural-sweeteners', icon: '✨' },
      { nameEn: 'Stone-Ground Idli Podi & Masala', nameTa: 'கைக்குத்தல் இட்லி பொடி', slug: 'authentic-podi-masala', icon: '🌶️' },
      { nameEn: 'Traditional Achu Murukku & Mittai', nameTa: 'பாரம்பரிய தின்பண்டங்கள்', slug: 'traditional-snacks-sweets', icon: '🍘' },
      { nameEn: 'Ancient Stone Ground Flours', nameTa: 'பாரம்பரிய தானிய மாவு', slug: 'healthy-flours', icon: '🌾' },
    ]
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
              ? 'shadow-[0_10px_30px_rgba(0,0,0,0.06)] py-2 sm:py-2.5' 
              : 'py-3 sm:py-3.5'
          ),
          className
        )}
      >
        {/* Subtle specular top highlight line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
            
            {/* 1. Left: Mobile Hamburger & Artisanal Brand Emblem */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 -ml-1.5 rounded-2xl text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Open navigation menu"
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span className="w-full h-0.5 bg-current rounded-full" />
                  <span className="w-3/4 h-0.5 bg-current rounded-full" />
                  <span className="w-full h-0.5 bg-current rounded-full" />
                </div>
              </button>

              {/* Artisanal Organic Crest & Brand Identity */}
              <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none select-none">
                <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-amber-600 p-[1.5px] shadow-sm group-hover:shadow-emerald-500/25 group-hover:shadow-md transition-all duration-300 group-hover:scale-105 shrink-0 flex items-center justify-center">
                  <div className="w-full h-full rounded-[14px] bg-white dark:bg-neutral-950 flex items-center justify-center overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-amber-500/10 group-hover:opacity-100 transition-opacity" />
                    <Leaf className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-emerald-600 dark:text-emerald-400 group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="text-base sm:text-lg lg:text-xl font-black font-heading tracking-tight text-neutral-900 dark:text-white leading-none">
                      {currentLang === 'ta' ? 'யாத்து ஆரோக்கியகம்' : 'YATHU AROKIYAGAM'}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ml-1 inline-block animate-pulse" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 leading-none">
                      {currentLang === 'ta' ? 'பாரம்பரிய இயற்கை அங்காடி' : 'Traditional Organic Store'}
                    </span>
                    <span className="hidden sm:inline-block text-[8px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 leading-none">
                      ESTD 2024
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* 2. Center: Luxury Navigation Bar with 4-Column Mega Menu (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              
              {/* Home */}
              <Link
                href="/"
                className={clsx(
                  "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
                  pathname === '/'
                    ? "text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 shadow-xs"
                    : "text-neutral-700 dark:text-neutral-300 hover:text-emerald-600 hover:bg-neutral-100/80 dark:hover:bg-neutral-800"
                )}
              >
                {t('nav.home', 'Home')}
              </Link>

              {/* Shop Catalog with Pro Mega Menu Dropdown */}
              <div 
                className="relative" 
                ref={megaMenuRef}
                onMouseEnter={handleMouseEnterMega}
                onMouseLeave={handleMouseLeaveMega}
              >
                <Link
                  href="/shop"
                  onClick={(e) => {
                    // On hover it opens mega menu; clicking goes directly to shop
                  }}
                  className={clsx(
                    "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                    pathname.startsWith('/shop') || isMegaMenuOpen
                      ? "text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 shadow-xs"
                      : "text-neutral-700 dark:text-neutral-300 hover:text-emerald-600 hover:bg-neutral-100/80 dark:hover:bg-neutral-800"
                  )}
                >
                  <span>{t('nav.shop', 'Shop Catalog')}</span>
                  <ChevronDown className={clsx("w-3.5 h-3.5 transition-transform duration-200", isMegaMenuOpen && "rotate-180")} />
                </Link>

                {/* Floating 4-Column Luxury Mega Menu Flyout */}
                <AnimatePresence>
                  {isMegaMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.98 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-2.5 w-[860px] rounded-3xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-[0_24px_60px_rgba(0,0,0,0.18)] p-6 z-50 font-sans"
                    >
                      {/* 4 Columns Grid */}
                      <div className="grid grid-cols-4 gap-6">
                        
                        {/* 3 Categories Columns */}
                        {megaMenuCategories.map((col, idx) => (
                          <div key={idx} className="space-y-3">
                            <div>
                              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block line-clamp-1">
                                {currentLang === 'ta' ? col.titleTa : col.titleEn}
                              </span>
                              <span className={clsx("inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-1", col.tagColor)}>
                                {col.tag}
                              </span>
                            </div>

                            <div className="flex flex-col gap-1 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                              {col.items.map((sub, sIdx) => (
                                <Link
                                  key={sIdx}
                                  href={`/shop?category=${sub.slug}`}
                                  onClick={() => setIsMegaMenuOpen(false)}
                                  className="group flex items-center justify-between p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-base shrink-0">{sub.icon}</span>
                                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate">
                                      {currentLang === 'ta' ? sub.nameTa : sub.nameEn}
                                    </span>
                                  </div>
                                  {sub.highlight && (
                                    <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-amber-400/20 text-amber-800 dark:text-amber-300 shrink-0 ml-1">
                                      {sub.highlight}
                                    </span>
                                  )}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* Column 4: Today's Harvest Spotlight Card */}
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
                                src="https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Sesame_oil_label.jpg/960px-Sesame_oil_label.jpg"
                                alt="Vaagai Wood-Pressed Sesame Oil"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            </div>

                            <h4 className="text-xs font-bold text-white line-clamp-1">
                              {currentLang === 'ta' ? 'வாகை மரச்செக்கு நல்லெண்ணெய்' : 'Vaagai Wood-Pressed Sesame Oil'}
                            </h4>
                            <p className="text-[10px] text-neutral-300 line-clamp-2 mt-0.5">
                              {currentLang === 'ta' ? '100% தூய முதல் தரம், எந்தவித ரசாயனமும் அற்றது.' : 'Single-origin traditional cold-pressed, zero hexane.'}
                            </p>

                            <div className="flex items-center gap-1 text-amber-400 text-[10px] font-bold mt-1.5">
                              <Star className="w-3 h-3 fill-amber-400" />
                              <span>4.9 (1,280+ ratings)</span>
                            </div>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                            <div>
                              <span className="text-xs font-black text-white">₹350</span>
                              <span className="text-[10px] text-neutral-400 line-through ml-1">₹380</span>
                            </div>
                            <Link
                              href="/shop?category=cold-pressed-oils"
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
                          <span>{currentLang === 'ta' ? 'அனைத்து பொருட்களும்' : 'Explore All 85+ Staples'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Our Story / About */}
              <Link
                href="/about"
                className={clsx(
                  "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
                  pathname === '/about'
                    ? "text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 shadow-xs"
                    : "text-neutral-700 dark:text-neutral-300 hover:text-emerald-600 hover:bg-neutral-100/80 dark:hover:bg-neutral-800"
                )}
              >
                {t('footer.about', 'Our Story')}
              </Link>

              {/* Track Order */}
              <Link
                href="/track-order"
                className={clsx(
                  "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
                  pathname === '/track-order'
                    ? "text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 shadow-xs"
                    : "text-neutral-700 dark:text-neutral-300 hover:text-emerald-600 hover:bg-neutral-100/80 dark:hover:bg-neutral-800"
                )}
              >
                {t('nav.track_order', 'Track Order')}
              </Link>

              {/* Contact */}
              <Link
                href="/contact"
                className={clsx(
                  "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all",
                  pathname === '/contact'
                    ? "text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 shadow-xs"
                    : "text-neutral-700 dark:text-neutral-300 hover:text-emerald-600 hover:bg-neutral-100/80 dark:hover:bg-neutral-800"
                )}
              >
                {t('nav.contact', 'Contact')}
              </Link>
            </nav>

            {/* 3. Center-Right: Omnipresent Spotlight Search Trigger Pill */}
            <div className="flex-1 max-w-[210px] xl:max-w-[270px] hidden md:block">
              <button
                type="button"
                onClick={() => setIsSpotlightOpen(true)}
                className="w-full h-9 px-3 rounded-full bg-neutral-100/90 dark:bg-neutral-800/90 hover:bg-neutral-200/70 dark:hover:bg-neutral-750 border border-neutral-200/80 dark:border-neutral-750 flex items-center justify-between text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-all cursor-pointer shadow-inner group"
                aria-label="Search catalog"
              >
                <div className="flex items-center gap-2 truncate">
                  <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shrink-0" />
                  <span className="text-xs font-medium truncate">
                    {currentLang === 'ta' ? 'தேடுக: நல்லெண்ணெய், அரிசி...' : 'Search pure oils, rice...'}
                  </span>
                </div>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-bold text-neutral-400 dark:text-neutral-400 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 px-1.5 py-0.5 rounded shadow-2xs shrink-0 select-none">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* 4. Right: Language Pill, Wishlist, Cart & Profile CTA */}
            <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 shrink-0">
              
              {/* Tactile Language Pill Switcher */}
              <div className="hidden sm:inline-flex items-center p-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-750 select-none">
                <button
                  type="button"
                  onClick={() => i18n.changeLanguage('en')}
                  className={clsx(
                    "px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer",
                    i18n.language === 'en'
                      ? "bg-white dark:bg-neutral-700 text-emerald-700 dark:text-emerald-300 shadow-xs"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  )}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => i18n.changeLanguage('ta')}
                  className={clsx(
                    "px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer",
                    i18n.language === 'ta'
                      ? "bg-white dark:bg-neutral-700 text-emerald-700 dark:text-emerald-300 shadow-xs"
                      : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  )}
                >
                  தமிழ்
                </button>
              </div>

              {/* Mobile Spotlight Search Button */}
              <button
                type="button"
                onClick={() => setIsSpotlightOpen(true)}
                className="md:hidden p-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist Button */}
              <Link
                href="/wishlist"
                className="p-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative cursor-pointer"
                aria-label={`Wishlist (${wishlistCount} items)`}
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Pro Cart Capsule: Shows Bag Icon + Live Counter + Subtotal Preview */}
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); openMiniCart(); }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-750 border border-neutral-200/80 dark:border-neutral-700 transition-all cursor-pointer shadow-xs group"
                aria-label={`View Cart (${cartCount} items)`}
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse shadow-xs">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-xs font-black text-neutral-900 dark:text-white hidden sm:inline-block">
                  ₹{cartSubtotal}
                </span>
              </button>

              {/* User Account / Profile */}
              {isLoggedIn ? (
                <div className="relative hidden sm:block" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 p-1 rounded-full border border-neutral-200 dark:border-neutral-750 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
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
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{currentLang === 'ta' ? 'உள்நுழைக' : 'Sign In'}</span>
                </Link>
              )}

              {/* Glowing "Order Now" Liquid CTA Pill */}
              <Link
                href="/shop"
                className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 hover:from-emerald-700 hover:to-amber-600 text-white font-black text-xs shadow-md shadow-emerald-600/20 hover:scale-102 transition-all duration-300 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>{currentLang === 'ta' ? 'ஆர்டர் செய்க' : 'Order Now'}</span>
              </Link>

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
