"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, Leaf, ShieldCheck, Lock } from 'lucide-react';

export const TrustBar: React.FC = () => {
  const { t } = useTranslation();

  const trustItems = [
    {
      icon: <Truck className="w-7 h-7 text-primary-500" />,
      titleKey: 'trust.free_delivery',
      defaultTitle: 'Free Delivery',
      descKey: 'announcement.text',
      defaultDesc: 'Free Delivery on ₹499+',
    },
    {
      icon: <Leaf className="w-7 h-7 text-primary-500" />,
      titleKey: 'trust.organic',
      defaultTitle: '100% Organic',
      descKey: 'why_choose_us.organic_desc',
      defaultDesc: 'Certified organic and natural farming.',
    },
    {
      icon: <ShieldCheck className="w-7 h-7 text-primary-500" />,
      titleKey: 'trust.lab_tested',
      defaultTitle: 'Lab Tested',
      descKey: 'hero.slide2.subtitle',
      defaultDesc: 'Certified quality checks on every product.',
    },
    {
      icon: <Lock className="w-7 h-7 text-primary-500" />,
      titleKey: 'trust.secure_pay',
      defaultTitle: 'Secure Pay',
      descKey: 'otp.title',
      defaultDesc: 'Quick & Secure Payments.',
    },
  ];

  return (
    <section className="w-full bg-[#F0FFF4] dark:bg-neutral-900/60 border-y border-emerald-100 dark:border-neutral-800/40 py-6 sm:py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {trustItems.map((item, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 p-4 rounded-card bg-white/80 dark:bg-neutral-900 border border-emerald-500/10 hover:border-emerald-500/25 transition-all duration-normal hover:shadow-card-hover"
            >
              <div className="p-2 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 text-primary-500 flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex flex-col gap-0.5">
                <h4 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                  {t(item.titleKey, item.defaultTitle)}
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                  {t(item.descKey, item.defaultDesc)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
