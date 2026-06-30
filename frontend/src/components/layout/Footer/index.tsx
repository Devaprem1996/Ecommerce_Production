"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FooterProps } from './Footer.types';
import { ChevronDown, CreditCard, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export const Footer: React.FC<FooterProps> = ({ className }) => {
  const { t } = useTranslation();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const footerLinks = {
    quickLinks: [
      { label: t('nav.home', 'Home'), path: '/' },
      { label: t('nav.shop', 'Shop'), path: '/shop' },
      { label: t('nav.blog', 'Blog'), path: '/blog' },
      { label: t('nav.faq', 'FAQs'), path: '/faq' },
    ],
    customer: [
      { label: t('footer.track_order', 'Track Order'), path: '/track-order' },
      { label: t('footer.returns', 'Returns & Refunds'), path: '/returns' },
      { label: t('footer.shipping', 'Shipping Info'), path: '/shipping' },
      { label: t('footer.privacy', 'Privacy Policy'), path: '/privacy' },
    ],
  };

  return (
    <footer
      className={twMerge(
        clsx(
          'bg-primary-750 text-white font-sans border-t border-primary-500/10 z-10',
          // Space for bottom bottom navigation on mobile
          'pb-20 sm:pb-8 pt-12 sm:pt-16'
        ),
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-primary-500/15">
          {/* Column 1: Brand Info */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-1 focus:outline-none">
              <span className="text-2xl font-bold font-heading tracking-wide text-white">
                Aether
                <span className="text-secondary-400">.</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-primary-200 leading-relaxed max-w-xs">
              {t(
                'why_choose_us.organic_desc',
                'Premium organic products sourced directly from local farms. 100% certified organic and lab tested.'
              )}
            </p>
            <div className="flex items-center gap-4 text-primary-200 mt-2">
              <ShieldCheck className="w-5 h-5 text-secondary-400" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {t('trust.lab_tested', 'Certified Quality')}
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links (Desktop: Grid, Mobile: Accordion) */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => toggleSection('quickLinks')}
              className="flex items-center justify-between w-full text-left font-bold text-sm sm:text-base uppercase tracking-wider text-secondary-400 py-2 sm:py-0 border-b border-primary-500/10 sm:border-none focus:outline-none cursor-pointer"
            >
              <span>{t('footer.quick_links', 'Quick Links')}</span>
              <ChevronDown
                className={clsx(
                  'w-5 h-5 text-white/60 transition-transform sm:hidden',
                  expandedSection === 'quickLinks' && 'rotate-180'
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {(expandedSection === 'quickLinks' || !isMobile) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden flex flex-col gap-2 mt-2 sm:mt-4"
                >
                  {footerLinks.quickLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.path}
                      className="text-xs sm:text-sm text-primary-200 hover:text-secondary-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Column 3: Customer Service */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => toggleSection('customer')}
              className="flex items-center justify-between w-full text-left font-bold text-sm sm:text-base uppercase tracking-wider text-secondary-400 py-2 sm:py-0 border-b border-primary-500/10 sm:border-none focus:outline-none cursor-pointer"
            >
              <span>{t('footer.customer', 'Customer Service')}</span>
              <ChevronDown
                className={clsx(
                  'w-5 h-5 text-white/60 transition-transform sm:hidden',
                  expandedSection === 'customer' && 'rotate-180'
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {(expandedSection === 'customer' || !isMobile) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden flex flex-col gap-2 mt-2 sm:mt-4"
                >
                  {footerLinks.customer.map((link) => (
                    <Link
                      key={link.label}
                      href={link.path}
                      className="text-xs sm:text-sm text-primary-200 hover:text-secondary-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Column 4: Follow Us */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => toggleSection('follow')}
              className="flex items-center justify-between w-full text-left font-bold text-sm sm:text-base uppercase tracking-wider text-secondary-400 py-2 sm:py-0 border-b border-primary-500/10 sm:border-none focus:outline-none cursor-pointer"
            >
              <span>{t('footer.social', 'Follow Us')}</span>
              <ChevronDown
                className={clsx(
                  'w-5 h-5 text-white/60 transition-transform sm:hidden',
                  expandedSection === 'follow' && 'rotate-180'
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {(expandedSection === 'follow' || !isMobile) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden flex flex-col gap-4 mt-2 sm:mt-4"
                >
                  <p className="text-xs sm:text-sm text-primary-200">
                    {t('footer.social_info', 'Stay updated with our farm stories, new arrivals, and harvest times.')}
                  </p>
                  <div className="flex items-center gap-4 text-primary-200">
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-secondary-400 transition-colors"
                      aria-label="Facebook Page"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-secondary-400 transition-colors"
                      aria-label="Instagram Profile"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-secondary-400 transition-colors"
                      aria-label="Twitter Feed"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Bottom (Payment details and copyright) */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-xs text-primary-200/70 text-center sm:text-left leading-tight">
            © {new Date().getFullYear()} Aether E-Commerce. All rights reserved. Sourced organically and lab verified.
          </p>

          {/* Payment method icons mock */}
          <div className="flex items-center gap-3 bg-primary-800/40 px-4 py-2 rounded-full border border-primary-500/10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-primary-300 mr-1.5">
              {t('trust.secure_pay', 'Secure Payments')}
            </span>
            <div className="flex items-center gap-2">
              {/* Payment Mock Badges */}
              <CreditCard className="w-4 h-4 text-primary-200" aria-label="Credit Card" />
              <span className="text-[10px] font-extrabold font-sans text-primary-200 border border-primary-500/25 px-1 rounded-sm">
                UPI
              </span>
              <span className="text-[10px] font-extrabold font-sans text-primary-200 border border-primary-500/25 px-1 rounded-sm">
                RUPAY
              </span>
              <span className="text-[10px] font-semibold text-primary-200">COD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.displayName = 'Footer';
