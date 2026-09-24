"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Leaf, ShieldCheck, Sparkles, Truck, Award, Heart } from 'lucide-react';

export const InfiniteMarqueeRibbon: React.FC = () => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const ribbonItems = [
    {
      icon: <Leaf className="w-4 h-4 text-emerald-400" />,
      textEn: '100% Vaagai Wood-Pressed',
      textTa: '100% வாகை மரச்செக்கு முறை',
    },
    {
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      textEn: 'Unpolished Native Millets',
      textTa: 'தீட்டப்படாத நாட்டு சிறுதானியங்கள்',
    },
    {
      icon: <ShieldCheck className="w-4 h-4 text-rose-400" />,
      textEn: 'Zero Chemicals & Preservatives',
      textTa: 'ரசாயனங்கள் & பாதுகாப்புகள் இல்லை',
    },
    {
      icon: <Award className="w-4 h-4 text-sky-400" />,
      textEn: 'Pure Wild Forest Honey',
      textTa: 'சுத்தமான காட்டு தேன்',
    },
    {
      icon: <Leaf className="w-4 h-4 text-emerald-400" />,
      textEn: 'Heritage Karuppu Kavuni Rice',
      textTa: 'பாரம்பரிய கருப்பு கவுனி அரிசி',
    },
    {
      icon: <ShieldCheck className="w-4 h-4 text-amber-400" />,
      textEn: 'NABL Batch Lab Tested',
      textTa: 'ஆய்வக தர சான்றளிக்கப்பட்டது',
    },
    {
      icon: <Truck className="w-4 h-4 text-teal-400" />,
      textEn: 'Free Delivery Across South India on ₹499+',
      textTa: 'தென்னிந்தியா முழுவதும் இலவச டெலிவரி',
    },
    {
      icon: <Heart className="w-4 h-4 text-red-400" />,
      textEn: 'Trusted by 10,000+ Conscious Families',
      textTa: '10,000+ குடும்பங்களின் நம்பிக்கை',
    },
  ];

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#071711] via-[#0D2E20] to-[#071711] border-y border-emerald-500/20 py-3 sm:py-3.5 select-none z-15 font-sans shadow-inner">
      {/* Left & Right Edge Gradient Vignettes for Seamless Fade */}
      <div className="absolute top-0 left-0 w-16 sm:w-28 h-full bg-gradient-to-r from-[#071711] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-16 sm:w-28 h-full bg-gradient-to-l from-[#071711] to-transparent z-10 pointer-events-none" />

      {/* Infinite Marquee Track */}
      <div className="animate-marquee flex items-center gap-6 sm:gap-10">
        {[...ribbonItems, ...ribbonItems].map((item, idx) => (
          <div
            key={idx}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 transition-colors whitespace-nowrap cursor-default"
          >
            {item.icon}
            <span className="text-xs sm:text-sm font-bold tracking-wide text-neutral-100 font-sans">
              {currentLang === 'ta' ? item.textTa : item.textEn}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
