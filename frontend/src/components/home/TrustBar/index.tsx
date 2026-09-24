"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from 'framer-motion';
import { Users, MapPin, ShoppingBag, ShieldCheck } from 'lucide-react';

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
}

const CountUp: React.FC<CountUpProps> = ({ end, duration = 1200, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

export const TrustBar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const metrics = [
    {
      icon: <Users className="w-6 h-6" />,
      badgeBg: 'bg-[#EFF6FF] dark:bg-blue-950/40 text-[#2563EB] border border-blue-200/60 dark:border-blue-800/40',
      num: 10,
      suffix: 'k+',
      labelEn: 'Happy Families',
      labelTa: 'மகிழ்ச்சியான குடும்பங்கள்',
      subEn: 'Across South India',
      subTa: 'தென்னிந்தியா முழுவதும்',
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      badgeBg: 'bg-[#FFFBEB] dark:bg-amber-950/40 text-[#D97706] border border-amber-200/60 dark:border-amber-800/40',
      num: 50,
      suffix: '+',
      labelEn: 'Heritage Native Farms',
      labelTa: 'உள்ளூர் இயற்கை பண்ணைகள்',
      subEn: 'Direct farmer trade',
      subTa: 'நேரடி விவசாய வரத்து',
    },
    {
      icon: <ShoppingBag className="w-6 h-6" />,
      badgeBg: 'bg-[#ECFDF5] dark:bg-emerald-950/40 text-[#059669] border border-emerald-200/60 dark:border-emerald-800/40',
      num: 85,
      suffix: '+',
      labelEn: 'Traditional Staples',
      labelTa: 'பாரம்பரிய தயாரிப்புகள்',
      subEn: 'Wood-pressed & pure',
      subTa: '100% தூய மரச்செக்கு',
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      badgeBg: 'bg-[#FFF1F2] dark:bg-rose-950/40 text-[#E11D48] border border-rose-200/60 dark:border-rose-800/40',
      num: 4.9,
      isDecimal: true,
      suffix: '/5',
      labelEn: 'Lab Verified Rating',
      labelTa: 'ஆய்வக தர மதிப்பீடு',
      subEn: 'NABL certified purity',
      subTa: 'NABL சான்றளிக்கப்பட்டவை',
    },
  ];

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 mb-8 sm:mb-12 z-20 font-sans">
      {/* Floating Glassmorphic Pill / Card */}
      <div 
        data-aos="fade-up"
        className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl shadow-neutral-200/40 dark:shadow-black/60 border border-neutral-150/90 dark:border-neutral-800 p-4 sm:p-6 lg:p-7 transition-all"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 divide-y sm:divide-y-0 lg:divide-x divide-neutral-100 dark:divide-neutral-800">
          {metrics.map((item, index) => (
            <div
              key={index}
              className={`group flex items-center gap-3.5 sm:gap-4 p-2.5 sm:p-3 rounded-2xl transition-all duration-300 hover:bg-neutral-50/80 dark:hover:bg-neutral-850/60 hover:translate-y-[-2px] ${
                index > 0 ? 'lg:pl-6' : ''
              }`}
            >
              {/* Colorful Pastel Icon Badge */}
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-xs ${item.badgeBg}`}>
                {item.icon}
              </div>

              {/* Number & Descriptive Label */}
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-2xl sm:text-3xl font-extrabold font-heading text-neutral-900 dark:text-white leading-none tracking-tight">
                  {item.isDecimal ? (
                    <span>4.9{item.suffix}</span>
                  ) : (
                    <CountUp end={item.num} suffix={item.suffix} />
                  )}
                </span>
                <span className="text-xs sm:text-sm font-bold text-neutral-850 dark:text-neutral-200 mt-1 whitespace-nowrap">
                  {currentLang === 'ta' ? item.labelTa : item.labelEn}
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-neutral-500 dark:text-neutral-400 leading-tight truncate">
                  {currentLang === 'ta' ? item.subTa : item.subEn}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
