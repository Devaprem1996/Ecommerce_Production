"use client";

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { Check, Copy } from 'lucide-react';

export const PromoBanner: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('FIRST20');
    setCopied(true);
    toast.success(
      currentLang === 'ta'
        ? 'தள்ளுபடி குறியீடு நகலெடுக்கப்பட்டது!'
        : 'Promo code copied to clipboard!'
    );
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section 
      data-aos="fade-up"
      className="relative w-full h-[320px] overflow-hidden flex items-center justify-center font-sans bg-neutral-900 bg-cover bg-center md:bg-fixed"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1600')`,
      }}
    >
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-primary-700/50 z-10" />

      {/* Content wrapper */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20 flex flex-col items-center text-center gap-4">
        <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-secondary-400 bg-secondary-400/10 px-3 py-1 rounded-full border border-secondary-400/25">
          {t('promo.code', 'Use Code: FIRST20')}
        </span>

        <h2 className="text-2xl sm:text-4xl font-bold font-heading text-white max-w-2xl leading-tight">
          {t('promo.offer', 'Get 20% Off Your First Purchase')}
        </h2>

        <p className="text-xs sm:text-sm text-neutral-300 max-w-md">
          {currentLang === 'ta' 
            ? 'இயற்கை மற்றும் புதிய பண்ணை காய்கறிகளுக்கு மட்டும் இந்த சலுகை பொருந்தும்.' 
            : 'Applicable on all farm fresh organic produce and handpicked organic honey products.'}
        </p>

        <div className="flex items-center gap-3 mt-2">
          <Button
            variant="cta"
            size="md"
            onClick={() => {
              const shopSec = document.getElementById('best-sellers');
              if (shopSec) shopSec.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {t('promo.cta', 'Claim Offer')}
          </Button>

          <Button
            variant="ghost"
            size="md"
            className="border border-white/30 text-white hover:bg-white/10 hover:text-white"
            onClick={handleCopyCode}
            leftIcon={copied ? <Check className="w-4.5 h-4.5" /> : <Copy className="w-4.5 h-4.5" />}
          >
            {copied ? 'Copied' : 'Copy Code'}
          </Button>
        </div>
      </div>
    </section>
  );
};
