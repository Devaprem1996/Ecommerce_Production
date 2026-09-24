"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FaqSection: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      qEn: 'What is the shelf life of your wood-pressed cold oils?',
      qTa: 'மரச்செக்கு எண்ணெய்களின் ஆயுட்காலம் எவ்வளவு?',
      aEn: 'Because our oils are unrefined and free from artificial preservatives, they maintain optimal freshness and nutritional value for 6 to 9 months when stored in a cool, dry place away from direct sunlight.',
      aTa: 'எங்கள் எண்ணெய்கள் ரசாயனங்கள் அல்லது செயற்கை பாதுகாப்புகள் இன்றி பிழியப்படுவதால், நேரடி சூரிய ஒளி படாத குளிர்ந்த இடத்தில் 6 முதல் 9 மாதங்கள் வரை அதன் அசல் மணமும் மருத்துவ குணங்களும் நீடிக்கும்.',
    },
    {
      qEn: 'How do you guarantee 100% unadulterated purity?',
      qTa: '100% கலப்படமற்ற தூய்மை எவ்வாறு உறுதி செய்யப்படுகிறது?',
      aEn: 'We source seeds directly from trusted native farmers. Each batch is slowly pressed in traditional Vaagai wooden chekku and tested by NABL-accredited labs for zero aflatoxins, free fatty acids, and zero mineral oils. Lab reports are publicly accessible.',
      aTa: 'உள்ளூர் இயற்கை விவசாயிகளிடமிருந்து நேரடியாக விதைகள் பெறப்பட்டு, வாகை மரச்செக்கில் பிழியப்படுகிறது. NABL சான்றளிக்கப்பட்ட ஆய்வகங்களில் அஃப்லாடாக்சின் மற்றும் மினரல் ஆயில் இல்லை என உறுதி செய்யப்படுகிறது.',
    },
    {
      qEn: 'What are the delivery timelines across Tamil Nadu and South India?',
      qTa: 'டெலிவரி எவ்வளவு நாட்களில் கிடைக்கும்?',
      aEn: 'We dispatch orders within 24 hours. Deliveries typically take 2-3 business days across Tamil Nadu, and 3-5 days across Karnataka, Kerala, Andhra Pradesh, and other states. Free delivery applies on orders above ₹499.',
      aTa: 'ஆர்டர்கள் 24 மணி நேரத்திற்குள் அனுப்பப்படும். தமிழ்நாட்டிற்குள் 2-3 வேலை நாட்களிலும், பிற தென்னிந்திய மாநிலங்களுக்கு 3-5 நாட்களிலும் பாதுகாப்பாக டெலிவரி செய்யப்படுகிறது. ₹499க்கு மேல் இலவச டெலிவரி.',
    },
    {
      qEn: 'What if a glass bottle arrives damaged during transit?',
      qTa: 'பாட்டில்கள் சேதமடைந்தால் என்ன செய்வது?',
      aEn: 'We use multi-layer shockproof protective eco-packaging. In the rare event of transit damage, simply send us a photo within 48 hours and we will dispatch a free instant replacement or 100% refund immediately.',
      aTa: 'நாங்கள் பாதுகாப்பான பேக்கிங் முறைகளை பயன்படுத்துகிறோம். எதிர்பாராதவிதமாக சேதம் ஏற்பட்டால், 48 மணி நேரத்திற்குள் புகைப்படம் அனுப்பினால் உடனடியாக மாற்று பாட்டில் அல்லது முழு பணமும் திரும்ப வழங்கப்படும்.',
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="w-full py-12 sm:py-16 bg-[#FAFAF9] dark:bg-neutral-950 font-sans transition-colors duration-normal">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4" data-aos="fade-up">
          <div className="flex flex-col items-start">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/50 text-primary-700 dark:text-primary-300 text-xs font-bold uppercase tracking-wider mb-2.5">
              <HelpCircle className="w-3.5 h-3.5 text-primary-500" />
              <span>{currentLang === 'ta' ? 'அடிக்கடி கேட்கப்படும் கேள்விகள்' : 'FAQ'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-neutral-900 dark:text-white tracking-tight">
              {currentLang === 'ta' ? 'பொதுவான சந்தேகங்கள் & பதில்கள்' : 'Frequently Asked Questions'}
            </h2>
          </div>

          <Link
            href="/faq"
            className="group inline-flex items-center gap-2 text-sm font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
          >
            <span>{currentLang === 'ta' ? 'அனைத்து கேள்விகள்' : 'View All FAQs'}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Clean Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 60}
                className="rounded-[18px] bg-white dark:bg-neutral-900 border border-neutral-150/90 dark:border-neutral-800 overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left font-bold text-sm sm:text-base text-neutral-900 dark:text-white cursor-pointer focus:outline-none"
                >
                  <span className="pr-4">{currentLang === 'ta' ? faq.qTa : faq.qEn}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-primary-500 text-white dark:bg-primary-500' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-neutral-600 dark:text-neutral-350 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/60 pt-3">
                        {currentLang === 'ta' ? faq.aTa : faq.aEn}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
