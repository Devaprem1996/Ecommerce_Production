"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { Leaf, MapPin, Package, Shield } from 'lucide-react';

interface CountUpProps {
  end: number;
  duration?: number;
  suffix?: string;
}

const CountUp: React.FC<CountUpProps> = ({ end, duration = 1500, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
      icon: <Leaf className="w-8 h-8 text-primary-500" />,
      titleKey: 'trust.organic',
      defaultTitle: '100% Organic',
      descKey: 'why_choose_us.organic_desc',
      defaultDesc: 'Certified organic and natural farming methods.',
      statVal: 100,
      statSuffix: '%',
      statLabel: currentLang === 'ta' ? 'இயற்கை தயாரிப்புகள்' : 'Organic Certified',
    },
    {
      icon: <MapPin className="w-8 h-8 text-primary-500" />,
      titleKey: 'why_choose_us.direct_farm',
      defaultTitle: 'Direct Farm Sourcing',
      descKey: 'why_choose_us.direct_desc',
      defaultDesc: 'Sourced directly from native farmers without middle-men.',
      statVal: 50,
      statSuffix: '+',
      statLabel: currentLang === 'ta' ? 'உள்ளூர் பண்ணைகள்' : 'Local Farms',
    },
    {
      icon: <Package className="w-8 h-8 text-primary-500" />,
      titleKey: 'why_choose_us.eco_friendly',
      defaultTitle: 'Eco-Friendly Packing',
      descKey: 'why_choose_us.eco_desc',
      defaultDesc: 'Biodegradable materials that protect the environment.',
      statVal: 15,
      statSuffix: 'k+',
      statLabel: currentLang === 'ta' ? 'மகிழ்ச்சியான வாடிக்கையாளர்கள்' : 'Happy Customers',
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-500" />,
      titleKey: 'why_choose_us.certified',
      defaultTitle: 'Quality Certified',
      descKey: 'why_choose_us.certified_desc',
      defaultDesc: 'Every batch is rigorously checked in certified labs.',
      statVal: 120,
      statSuffix: '+',
      statLabel: currentLang === 'ta' ? 'தர சோதனைகள்' : 'Lab Tests Passed',
    },
  ];

  return (
    <section className="w-full py-16 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800/10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-3xl font-bold font-heading text-neutral-900 dark:text-white mb-2">
            {t('why_choose_us.title', 'Why Choose Us')}
          </h2>
          <div className="h-1 w-16 bg-primary-500 mx-auto rounded-full" />
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="group bg-white dark:bg-neutral-905 border border-neutral-100 dark:border-neutral-850 p-6 rounded-feature shadow-card hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-normal flex flex-col justify-between"
            >
              <div>
                {/* Animated Icon Container on Card Hover */}
                <motion.div 
                  whileHover={{ scale: 1.12, rotate: 5 }}
                  className="w-14 h-14 rounded-full bg-primary-500/10 dark:bg-primary-500/5 flex items-center justify-center text-primary-500 mb-5 transition-transform duration-normal"
                >
                  {feat.icon}
                </motion.div>

                <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                  {t(feat.titleKey, feat.defaultTitle)}
                </h3>

                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
                  {t(feat.descKey, feat.defaultDesc)}
                </p>
              </div>

              {/* Stats Section with CountUp */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-auto flex flex-col">
                <span className="text-3xl font-extrabold font-heading text-primary-500 leading-none mb-1">
                  <CountUp end={feat.statVal} suffix={feat.statSuffix} />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  {feat.statLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
