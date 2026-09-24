"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useInView, motion } from 'framer-motion';
import { Leaf, MapPin, Package, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

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

export const WhyChooseUs: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const features = [
    {
      icon: <Leaf className="w-6 h-6 text-emerald-400" />,
      iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      titleEn: '100% Traditional Wood-Pressed',
      titleTa: '100% மரச்செக்கு முறை',
      descEn: 'Extracted slowly in Vaagai wood presses without heat or chemical solvents.',
      descTa: 'வாகை மரச்செக்கில் மிதமான சுழற்சியில் ஊட்டச்சத்துக்கள் அழியாமல் பிழியப்படுகிறது.',
      statVal: 100,
      statSuffix: '%',
      statLabelEn: 'Pure & Cold Pressed',
      statLabelTa: 'தூய குளிர் முறை',
    },
    {
      icon: <MapPin className="w-6 h-6 text-amber-400" />,
      iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      titleEn: 'Direct Farm Sourcing',
      titleTa: 'நேரடி பண்ணை கொள்முதல்',
      descEn: 'Procured ethically from native Tamil Nadu and South Indian organic farmers.',
      descTa: 'உள்ளூர் விவசாயிகளிடம் இருந்து தரமான விளைபொருட்கள் நேரடியாக பெறப்படுகின்றன.',
      statVal: 50,
      statSuffix: '+',
      statLabelEn: 'Partner Farms',
      statLabelTa: 'இணைந்த பண்ணைகள்',
    },
    {
      icon: <Package className="w-6 h-6 text-sky-400" />,
      iconBg: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
      titleEn: 'Eco-Friendly Packing',
      titleTa: 'சுற்றுச்சூழல் நட்பு பேக்கிங்',
      descEn: 'Food-grade tin cans and glass bottles that preserve aroma and freshness.',
      descTa: 'மணமும் சுவையும் மாறாமல் பாதுகாக்க உணவு தர தகர டப்பாக்கள் மற்றும் கண்ணாடி பாட்டில்கள்.',
      statVal: 15,
      statSuffix: 'k+',
      statLabelEn: 'Orders Delivered',
      statLabelTa: 'விநியோகிக்கப்பட்டது',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-rose-400" />,
      iconBg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      titleEn: 'Rigorous Lab Certified',
      titleTa: 'ஆய்வக சான்றளிப்பு',
      descEn: 'Every production batch is tested for zero aflatoxins, free fatty acids, and moisture.',
      descTa: 'ஒவ்வொரு தயாரிப்பும் NABL சான்றளிக்கப்பட்ட ஆய்வகங்களில் கடுமையான தரப்பரிசோதனை செய்யப்படுகிறது.',
      statVal: 120,
      statSuffix: '+',
      statLabelEn: 'Lab Tests Passed',
      statLabelTa: 'ஆய்வக சோதனைகள்',
    },
  ];

  return (
    <section className="relative w-full py-16 sm:py-20 lg:py-24 bg-gradient-to-b from-[#081C15] via-[#0A2218] to-[#081C15] text-white font-sans overflow-hidden">
      {/* Ambient Radial Lighting Effects */}
      <div 
        className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Column: Inspiring Headline & Action */}
          <div className="lg:col-span-5 flex flex-col items-start text-left" data-aos="fade-up">
            
            {/* Pill Eyebrow */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{currentLang === 'ta' ? 'எங்கள் தரம் மற்றும் உறுதிமொழி' : 'Why Choose Yathu Arokiyagam?'}</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white leading-[1.18] tracking-tight mb-5">
              {currentLang === 'ta' ? (
                <>
                  நாங்கள் உணவை விற்கவில்லை,{' '}
                  <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                    ஆரோக்கியத்தை
                  </span>{' '}
                  மீட்டெடுக்கிறோம்.
                </>
              ) : (
                <>
                  We Don&apos;t Just Sell Food.{' '}
                  <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                    We Revive Pure Living.
                  </span>
                </>
              )}
            </h2>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-lg mb-8 font-normal">
              {currentLang === 'ta'
                ? 'ரசாயனங்கள் மற்றும் கலப்படங்கள் இல்லாத பாரம்பரிய மரச்செக்கு உணவுமுறை உங்கள் குடும்பத்தை தலைமுறை தலைமுறையாக ஆரோக்கியமாக காக்கும்.'
                : 'Honest, preservative-free traditional foods processed with ancient wood-pressing and native practices that safeguard essential micronutrients and genuine aroma.'}
            </p>

            {/* Action CTA */}
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-emerald-400 text-white font-bold text-sm shadow-md transition-all duration-normal hover:shadow-emerald-500/20"
            >
              <span>{currentLang === 'ta' ? 'எங்கள் தயாரிப்புகளை காண்க' : 'Explore Our Standards'}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-emerald-300" />
            </Link>
          </div>

          {/* Right Column: 2x2 Dark Glassmorphic Grid */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {features.map((feat, index) => (
                <div
                  key={index}
                  data-aos="fade-up"
                  data-aos-delay={index * 90}
                  className="group relative bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-emerald-400/40 backdrop-blur-md rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/30 flex flex-col justify-between"
                >
                  <div>
                    {/* Glowing Icon Badge */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-4 transition-transform duration-300 group-hover:scale-108 ${feat.iconBg}`}>
                      {feat.icon}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white mb-2 leading-snug">
                      {currentLang === 'ta' ? feat.titleTa : feat.titleEn}
                    </h3>

                    <p className="text-xs sm:text-sm text-neutral-350 leading-relaxed mb-5">
                      {currentLang === 'ta' ? feat.descTa : feat.descEn}
                    </p>
                  </div>

                  {/* Stat Counter at Bottom */}
                  <div className="pt-3 border-t border-white/10 flex items-baseline justify-between mt-auto">
                    <span className="text-2xl font-extrabold font-heading text-emerald-400">
                      <CountUp end={feat.statVal} suffix={feat.statSuffix} />
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                      {currentLang === 'ta' ? feat.statLabelTa : feat.statLabelEn}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
