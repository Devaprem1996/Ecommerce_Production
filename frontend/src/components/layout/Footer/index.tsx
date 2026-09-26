"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { usePathname } from 'next/navigation';
import { toast } from '@/components/ui/Toast';
import { FooterProps } from './Footer.types';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

const FacebookIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const TikTokIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-6.61 6.32 6.34 6.34 0 0 0 10.86 4.47A6.33 6.33 0 0 0 18 15.65V9.06a8.27 8.27 0 0 0 4.84 1.56v-3.5a4.84 4.84 0 0 1-3.25-.43z" />
  </svg>
);

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const pathname = usePathname();

  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  // On the homepage, PreFooterCallout renders the integrated full-screen scenic footer.
  // Do not double-render the footer on the home page or admin dashboard.
  if (pathname?.startsWith('/admin') || pathname === '/') {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error(
        currentLang === 'ta'
          ? 'தயவுசெய்து சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்'
          : 'Please enter a valid email address'
      );
      return;
    }

    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      setEmail('');
      toast.success(
        currentLang === 'ta'
          ? 'நன்றி! எங்கள் இயற்கை குடும்பத்தில் இணைந்ததற்கு வாழ்த்துகள்.'
          : 'Thank you! You are now subscribed to Yathu Arokiyagam updates.'
      );
    }, 600);
  };

  return (
    <footer
      className={twMerge(
        clsx(
          'w-full bg-[#0A0C0E] text-white font-sans border-t border-neutral-800 z-10 pt-16 pb-12 px-4 sm:px-8 lg:px-16',
          className
        )
      )}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start pb-12 border-b border-neutral-800">
        
        {/* Left Column: Newsletter Subscription Box (Exact Reference Recreation) */}
        <div className="lg:col-span-5 flex flex-col items-start">
          <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mb-2">
            {currentLang === 'ta' ? 'எங்கள் செய்திமடலில் இணையுங்கள்' : 'SUBSCRIBE TO OUR NEWSLETTER'}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-5 max-w-md">
            {currentLang === 'ta'
              ? 'அறுவடை செய்திகள், புதிய தயாரிப்புகள் மற்றும் ஆரோக்கிய குறிப்புகளை உடனுக்குடன் பெறுங்கள்.'
              : 'Stay in the know of all the Yathu Arokiyagam seasonal harvests and community initiatives.'}
          </p>

          {/* Newsletter Input Box matching reference design */}
          <form onSubmit={handleSubscribe} className="w-full max-w-md flex flex-col sm:flex-row items-stretch border border-neutral-700 focus-within:border-white transition-colors bg-neutral-900/90">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={currentLang === 'ta' ? 'உங்கள் மின்னஞ்சல்' : 'YOUR E-MAIL'}
              aria-label="Email Address"
              className="w-full px-4 py-3 bg-transparent text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none uppercase tracking-wider font-mono"
            />
            <button
              type="submit"
              disabled={isSubscribing}
              className="px-6 py-3 bg-[#93C5FD] hover:bg-[#BFDBFE] active:bg-[#60A5FA] text-neutral-950 font-bold text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isSubscribing ? '...' : currentLang === 'ta' ? 'பதிவுசெய்க' : 'SUBSCRIBE'}
            </button>
          </form>

          {/* Copyright */}
          <div className="mt-8 text-[11px] sm:text-xs text-neutral-500 uppercase tracking-widest font-mono">
            © COPYRIGHT YATHU AROKIYAGAM {new Date().getFullYear()}. ALL RIGHTS RESERVED.
          </div>
        </div>

        {/* Center Column: Explore Links Grid */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-6 sm:gap-8">
          <div>
            <span className="block text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3.5">
              {currentLang === 'ta' ? 'கண்டுபிடி' : 'EXPLORE'}
            </span>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-xs sm:text-sm text-neutral-300 hover:text-white transition-colors">
                  {currentLang === 'ta' ? 'முகப்பு' : 'Home'}
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-xs sm:text-sm text-neutral-300 hover:text-white transition-colors">
                  {currentLang === 'ta' ? 'மரச்செக்கு எண்ணெய்கள்' : 'Cold-Pressed Oils'}
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-xs sm:text-sm text-neutral-300 hover:text-white transition-colors">
                  {currentLang === 'ta' ? 'மலைத்தேன்' : 'Wild Mountain Honey'}
                </Link>
              </li>
              <li>
                <Link href="/overview" className="text-xs sm:text-sm text-neutral-300 hover:text-white transition-colors">
                  {currentLang === 'ta' ? 'விவசாயிகள் & கதை' : 'Our Farm Story'}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <span className="block text-xs font-bold uppercase tracking-widest text-transparent mb-3.5 select-none">
              LINKS
            </span>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="text-xs sm:text-sm text-neutral-300 hover:text-white transition-colors">
                  {currentLang === 'ta' ? 'எங்களை பற்றி' : 'About'}
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-xs sm:text-sm text-neutral-300 hover:text-white transition-colors">
                  {currentLang === 'ta' ? 'சமூகம்' : 'Community'}
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-xs sm:text-sm text-neutral-300 hover:text-white transition-colors">
                  {currentLang === 'ta' ? 'அனைத்து பொருட்கள்' : 'Shop'}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs sm:text-sm text-neutral-300 hover:text-white transition-colors">
                  {currentLang === 'ta' ? 'தொடர்பு கொள்க' : 'Contact'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Social Rounded Icons & Legal Links */}
        <div className="lg:col-span-3 flex flex-col lg:items-end justify-between h-full gap-8">
          {/* Social Icons in rounded square boxes (matching reference) */}
          <div className="flex items-center gap-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-10 h-10 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 flex items-center justify-center text-neutral-300 hover:text-white transition-all hover:scale-105"
            >
              <FacebookIcon />
            </a>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-10 h-10 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 flex items-center justify-center text-neutral-300 hover:text-white transition-all hover:scale-105"
            >
              <InstagramIcon />
            </a>

            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="w-10 h-10 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 flex items-center justify-center text-neutral-300 hover:text-white transition-all hover:scale-105"
            >
              <TikTokIcon />
            </a>
          </div>

          {/* Legal Links */}
          <div className="flex items-center flex-wrap gap-4 text-[10px] sm:text-xs text-neutral-400 uppercase tracking-wider font-mono">
            <Link href="/privacy" className="hover:text-white transition-colors">
              {currentLang === 'ta' ? 'தனியுரிமைக் கொள்கை' : 'PRIVACY POLICY'}
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              {currentLang === 'ta' ? 'விதிமுறைகள்' : 'TERMS OF USE'}
            </Link>
            <span>•</span>
            <Link href="/faq" className="hover:text-white transition-colors">
              {currentLang === 'ta' ? 'உதவி' : 'ACCESSIBILITY'}
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';
