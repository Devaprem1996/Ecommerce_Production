"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Search, Home, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFoundPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-[80vh] bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-normal">
      <div className="max-w-xl w-full text-center space-y-8">
        
        {/* Animated Vector Illustration */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
          className="mx-auto w-48 h-48 sm:w-56 sm:h-56 text-primary-500 flex items-center justify-center select-none"
        >
          <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Background cloud-like shape */}
            <path
              d="M30 100C30 55.8172 65.8172 20 110 20C154.183 20 190 55.8172 190 100C190 144.183 154.183 180 110 180C65.8172 180 30 144.183 30 100Z"
              fill="currentColor"
              fillOpacity="0.04"
            />
            {/* A cute lost carrot with signpost */}
            {/* Signpost */}
            <rect x="75" y="110" width="8" height="60" rx="3" fill="#8B5A2B" />
            <path d="M50 80H108V110H50V80Z" fill="#A0522D" />
            <path d="M54 95H104" stroke="white" strokeWidth="2" strokeDasharray="3 3" />
            <text x="58" y="94" fill="white" fontSize="8" fontWeight="bold" fontFamily="sans-serif">FARMS</text>
            <text x="58" y="104" fill="white" fontSize="8" fontWeight="bold" fontFamily="sans-serif">◀ LOST</text>
            
            {/* Carrot */}
            <path
              d="M140 70C140 70 145 40 120 50C95 60 110 95 110 95C110 95 130 115 145 130C160 145 170 140 170 140C170 140 175 125 160 110C145 95 140 70 140 70Z"
              fill="#F77F00"
            />
            {/* Carrot Leaf */}
            <path
              d="M115 45C110 35 90 40 100 48C110 56 112 48 112 48C112 48 102 42 108 55"
              stroke="#2D6A4F"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M125 50C125 40 115 30 112 42C109 54 118 48 118 48"
              stroke="#52B788"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Cute face on carrot */}
            <circle cx="132" cy="78" r="2.5" fill="#1B4332" />
            <circle cx="145" cy="85" r="2.5" fill="#1B4332" />
            <path d="M136 84Q140 88 142 83" stroke="#1B4332" strokeWidth="2" strokeLinecap="round" fill="none" />
            <circle cx="129" cy="81" r="3" fill="#FFB6C1" fillOpacity="0.6" />
            <circle cx="149" cy="88" r="3" fill="#FFB6C1" fillOpacity="0.6" />
          </svg>
        </motion.div>

        {/* 404 Stylized Bounce Title */}
        <div className="space-y-3">
          <motion.h1
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 10 }}
            className="text-7xl sm:text-8xl font-black font-heading tracking-tighter text-primary-500 select-none"
          >
            404
          </motion.h1>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-neutral-900 dark:text-white">
            {t("404.title", "Oops! Page went farm-fresh 🌿")}
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-neutral-500 max-w-md mx-auto leading-relaxed">
            {t(
              "404.description",
              "Looks like this page took a detour back to the farm and isn't available anymore."
            )}
          </p>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearch} className="max-w-md mx-auto relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder={t("404.search_placeholder", "Search organic vegetables, rice...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold pl-10 pr-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-750 rounded-card text-neutral-900 dark:text-white focus:outline-none focus:border-primary-500 shadow-sm"
            />
          </div>
          <Button type="submit" variant="primary" className="font-bold text-xs py-3 px-5 shadow-sm">
            {t("404.search_btn", "Search")}
          </Button>
        </form>

        {/* Quick Fun Navigation CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <Link href="/">
            <Button variant="primary" className="font-bold text-xs py-3 px-6" leftIcon={<Home className="w-4 h-4" />}>
              {t("404.go_home", "Go to Home")}
            </Button>
          </Link>
          <Link href="/shop">
            <Button variant="secondary" className="font-bold text-xs py-3 px-6 bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-750" leftIcon={<ShoppingBag className="w-4 h-4" />}>
              {t("404.browse_products", "Browse Products")}
            </Button>
          </Link>
        </div>

        {/* Popular Directories */}
        <div className="space-y-3 pt-6 border-t border-neutral-100 dark:border-neutral-850">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block select-none">
            {t("404.popular_pages", "Popular Pages")}
          </span>
          <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2 text-xs font-bold text-neutral-600 dark:text-neutral-400">
            <Link href="/shop?filter=best-sellers" className="hover:text-primary-500 transition-colors">
              {t("shop.best_sellers", "Best Sellers")}
            </Link>
            <span className="text-neutral-300 dark:text-neutral-800 select-none">&bull;</span>
            <Link href="/shop?filter=new-arrivals" className="hover:text-primary-500 transition-colors">
              {t("shop.new_arrivals", "New Arrivals")}
            </Link>
            <span className="text-neutral-300 dark:text-neutral-800 select-none">&bull;</span>
            <Link href="/about" className="hover:text-primary-500 transition-colors">
              {t("footer.about_us", "About Us")}
            </Link>
            <span className="text-neutral-300 dark:text-neutral-800 select-none">&bull;</span>
            <Link href="/contact" className="hover:text-primary-500 transition-colors">
              {t("footer.contact_us", "Contact Us")}
            </Link>
            <span className="text-neutral-300 dark:text-neutral-800 select-none">&bull;</span>
            <Link href="/faq" className="hover:text-primary-500 transition-colors">
              {t("footer.faqs", "FAQs")}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
