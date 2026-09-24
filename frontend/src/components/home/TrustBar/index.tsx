"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Leaf, Droplets, Heart, Globe } from 'lucide-react';

export const TrustBar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const features = [
    {
      icon: <Leaf className="w-5 h-5 stroke-[1.5] text-neutral-800 dark:text-neutral-200" />,
      titleEn: 'Natural Ingredients',
      titleTa: 'இயற்கை மூலப்பொருட்கள்',
      subEn: 'Sourced from the finest farms',
      subTa: 'சிறந்த பண்ணைகளில் இருந்து நேரடி வரத்து',
    },
    {
      icon: <Droplets className="w-5 h-5 stroke-[1.5] text-neutral-800 dark:text-neutral-200" />,
      titleEn: 'No Preservatives',
      titleTa: 'பாதுகாப்பு இரசாயனம் இல்லை',
      subEn: 'Clean label. No added chemicals',
      subTa: 'கலப்படமற்ற தூய்மையான தயாரிப்பு',
    },
    {
      icon: <Heart className="w-5 h-5 stroke-[1.5] text-neutral-800 dark:text-neutral-200" />,
      titleEn: 'Better for You',
      titleTa: 'உங்கள் ஆரோக்கியத்திற்கு சிறந்தது',
      subEn: 'Nutritious choices for a healthier you',
      subTa: 'ஊட்டச்சத்து நிறைந்த உணவுகள்',
    },
    {
      icon: <Globe className="w-5 h-5 stroke-[1.5] text-neutral-800 dark:text-neutral-200" />,
      titleEn: 'Sustainable Choice',
      titleTa: 'நிலையான தேர்வு',
      subEn: 'Good for you, good for the planet',
      subTa: 'பூமிக்கும் மனிதனுக்கும் நலம் தரும்',
    },
  ];

  return (
    <div className="w-full font-sans transition-colors duration-normal">
      <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24">
        
        {/* Soft Cream Warm Rounded Banner Matching Reference Image */}
        <div className="rounded-2xl bg-[#F8F6F0] dark:bg-neutral-900/90 border border-[#ECE6DC] dark:border-neutral-800 py-3 px-6 sm:px-8 shadow-2xs">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-4 lg:divide-x divide-neutral-200/60 dark:divide-neutral-800">
            {features.map((item, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3.5 ${
                  idx > 0 ? 'lg:pl-6' : ''
                }`}
              >
                {/* Thin Line Stroke Minimalist Icon */}
                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/80 dark:bg-neutral-800/80 shadow-2xs">
                  {item.icon}
                </div>

                {/* Text Content */}
                <div className="flex flex-col text-left">
                  <h4 className="text-xs sm:text-[13px] font-bold text-neutral-900 dark:text-white leading-tight font-sans">
                    {currentLang === 'ta' ? item.titleTa : item.titleEn}
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug">
                    {currentLang === 'ta' ? item.subTa : item.subEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
