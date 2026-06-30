"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Search, 
  Plus, 
  HelpCircle, 
  Mail, 
  PhoneCall, 
  MessageSquare,
  Sparkles,
  HelpCircle as HelpIcon
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import 'aos/dist/aos.css';

interface FaqItem {
  category: 'orders' | 'delivery' | 'products' | 'payment' | 'returns';
  q: string;
  qTamil: string;
  a: string;
  aTamil: string;
}

const mockFaqs: FaqItem[] = [
  {
    category: 'orders',
    q: 'How can I cancel or modify my organic order?',
    qTamil: 'எனது ஆர்கானிக் ஆர்டரை நான் எவ்வாறு ரத்து செய்வது அல்லது மாற்றுவது?',
    a: 'You can cancel or modify your order within 2 hours of placing it. Please go to your profile, click on active orders, or contact our support directly.',
    aTamil: 'ஆர்டர் செய்த 2 மணி நேரத்திற்குள் அதை ரத்து செய்யலாம் அல்லது மாற்றலாம். தயவுசெய்து உங்கள் சுயவிவரத்திற்குச் சென்று செயலில் உள்ள ஆர்டர்களைக் கிளிக் செய்யவும் அல்லது எங்களைத் தொடர்பு கொள்ளவும்.'
  },
  {
    category: 'orders',
    q: 'Can I add items to my order after checking out?',
    qTamil: 'ஆர்டர் செய்த பிறகு கூடுதல் பொருட்களைச் சேர்க்க முடியுமா?',
    a: 'Once an order is paid and processing, items cannot be added. You can place a separate order, and if done within 1 hour, our team can merge shipping if you notify support.',
    aTamil: 'ஆர்டர் செய்யப்பட்டு பேக் செய்யப்படும் நிலையில் புதிய பொருட்களைச் சேர்க்க முடியாது. நீங்கள் மற்றொரு தனியான ஆர்டரைச் செய்யலாம். 1 மணி நேரத்திற்குள் ஆதரவுக் குழுவிடம் தெரிவித்தால் அவற்றை ஒன்றாக அனுப்ப முடியும்.'
  },
  {
    category: 'delivery',
    q: 'Where do you deliver and what are the shipping fees?',
    qTamil: 'நீங்கள் எங்கு டெலிவரி செய்கிறீர்கள் மற்றும் அதற்கான கட்டணங்கள் என்ன?',
    a: 'We deliver all over Tamil Nadu and neighboring states. Shipping is free for orders above ₹499. For orders below ₹499, a flat delivery fee of ₹50 is charged.',
    aTamil: 'நாங்கள் தமிழ்நாடு மற்றும் அண்டை மாநிலங்கள் முழுவதும் விநியோகம் செய்கிறோம். ₹499-க்கு மேல் உள்ள ஆர்டர்களுக்கு டெலிவரி இலவசம். அதற்கு கீழ் உள்ள ஆர்டர்களுக்கு ₹50 வசூலிக்கப்படுகிறது.'
  },
  {
    category: 'delivery',
    q: 'How long will it take to receive my order?',
    qTamil: 'எனது ஆர்டர் வந்து சேர எவ்வளவு நாட்கள் ஆகும்?',
    a: 'For orders with Tamil Nadu pincodes starting with 6, delivery takes 3 business days. For other regions, it takes 5 business days.',
    aTamil: '6 இலக்கத்தொடக்கம் கொண்ட தமிழக பின்கோடுகளுக்கு 3 வேலை நாட்களில் ஆர்டர் டெலிவரி செய்யப்படுகிறது. பிற பகுதிகளுக்கு 5 வேலை நாட்கள் ஆகும்.'
  },
  {
    category: 'products',
    q: 'Are your food products 100% certified organic?',
    qTamil: 'உங்கள் உணவுப் பொருட்கள் 100% சான்றளிக்கப்பட்ட இயற்கையானவையா?',
    a: 'Yes, all our grains, pulses, honey, and cold-pressed oils are NPOP certified organic and undergo rigorous lab testing to ensure zero chemical residues.',
    aTamil: 'ஆம், எங்களது அனைத்து தானியங்கள், பருப்புகள், தேன் மற்றும் செக்கு எண்ணெய்கள் NPOP சான்றளிக்கப்பட்டவை மற்றும் இரசாயன எச்சங்கள் இல்லை என்பதை உறுதிப்படுத்த ஆய்வக சோதனைகளுக்கு உட்படுத்தப்படுகின்றன.'
  },
  {
    category: 'products',
    q: 'How can I access the lab test reports for my products?',
    qTamil: 'எனது தயாரிப்பின் ஆய்வக சோதனை அறிக்கைகளை எவ்வாறு பார்ப்பது?',
    a: 'Every packing contains a unique QR code. Simply scan it with your mobile camera to read the chemical residue tests and sourcing details directly.',
    aTamil: 'ஒவ்வொரு தயாரிப்பு பேக்கிலும் தனித்துவமான QR குறியீடு இருக்கும். அதனை மொபைல் கேமரா மூலம் ஸ்கேன் செய்து ஆய்வக சோதனை அறிக்கை மற்றும் பண்ணை விவரங்களைக் காணலாம்.'
  },
  {
    category: 'payment',
    q: 'What payment modes do you support?',
    qTamil: 'நீங்கள் என்னென்ன கட்டண முறைகளை ஆதரிக்கிறீர்கள்?',
    a: 'We support all major payment types including UPI (GPay, PhonePe, BHIM), Credit/Debit cards, Net Banking, and Cash on Delivery (COD).',
    aTamil: 'நாங்கள் UPI (GPay, PhonePe, BHIM), கிரெடிட்/டெபிட் கார்டுகள், நெட் பேங்கிங் மற்றும் கேஷ் ஆன் டெலிவரி (COD) உட்பட அனைத்து முக்கிய கட்டண முறைகளையும் ஆதரிக்கிறோம்.'
  },
  {
    category: 'returns',
    q: 'What is your refund policy for organic perishables?',
    qTamil: 'இயற்கை உணவுப் பொருட்களுக்கான திரும்பப் பெறும் கொள்கை என்ன?',
    a: 'We offer a no-questions-asked refund or replacement within 24 hours of delivery if you receive fresh items that do not meet our quality standards.',
    aTamil: 'எங்கள் தரத்திற்கு உட்படாத புதிய பொருட்களை நீங்கள் பெற்றால், டெலிவரி செய்யப்பட்ட 24 மணி நேரத்திற்குள் எவ்வித கேள்வியுமின்றி பணத்தைத் திரும்பப் பெறலாம் அல்லது மாற்றிப் பெறலாம்.'
  }
];

export default function FAQPage() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  // AOS init
  useEffect(() => {
    import('aos').then((AOS) => {
      AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
      });
    });
  }, []);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | FaqItem['category']>('all');

  // Accordion active index
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Categories list
  const categories = [
    { id: 'all', label: 'All', labelTamil: 'அனைத்தும்' },
    { id: 'orders', label: 'Orders', labelTamil: 'ஆர்டர்கள்' },
    { id: 'delivery', label: 'Delivery', labelTamil: 'டெலிவரி' },
    { id: 'products', label: 'Products', labelTamil: 'தயாரிப்புகள்' },
    { id: 'payment', label: 'Payment', labelTamil: 'கட்டணங்கள்' },
    { id: 'returns', label: 'Returns', labelTamil: 'திரும்பப் பெறுதல்' }
  ];

  // Filter FAQs based on search and active tab
  const filteredFaqs = useMemo(() => {
    return mockFaqs.filter(faq => {
      const qText = currentLang === 'ta' ? faq.qTamil : faq.q;
      const aText = currentLang === 'ta' ? faq.aTamil : faq.a;
      const matchesSearch = qText.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            aText.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, currentLang]);

  const toggleAccordion = (idx: number) => {
    if (openIndex === idx) {
      setOpenIndex(null);
    } else {
      setOpenIndex(idx);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans pb-20 transition-colors duration-normal">
      
      {/* Breadcrumbs */}
      <div className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold">
            <Link href="/" className="hover:text-primary-500 transition-colors uppercase tracking-wider">
              {t('shop.breadcrumb_home', 'Home')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-900 dark:text-white uppercase tracking-wider">
              FAQ
            </span>
          </nav>
        </div>
      </div>

      {/* Hero Banner with Search */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-700 to-primary-900 text-white py-16">
        <div className="absolute inset-0 bg-black/10" />
        <div className="max-w-3xl mx-auto text-center px-4 relative z-10 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-primary-300 uppercase tracking-widest block">
              Support Desk
            </span>
            <h1 className="text-3xl sm:text-4.5xl font-black font-heading tracking-tight">
              {t('faq.title', 'Frequently Asked Questions')}
            </h1>
          </div>

          {/* Search box */}
          <div className="max-w-lg mx-auto relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setOpenIndex(null); }}
              placeholder={t('faq.search_placeholder', 'Search for questions...')}
              className="w-full pl-11 pr-4 py-3 bg-white text-neutral-900 placeholder-neutral-500 rounded-feature text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-500 shadow-md"
            />
            <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Category Pills & FAQS Accordion */}
      <div className="max-w-4xl mx-auto px-4 pt-12 space-y-8">
        
        {/* Category Tab Pills */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center border-b border-neutral-200 dark:border-neutral-800">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id as any); setOpenIndex(null); }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-350'
              }`}
            >
              {currentLang === 'ta' ? cat.labelTamil : cat.label}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <motion.div
                    key={faq.q}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature overflow-hidden shadow-sm"
                  >
                    {/* Header trigger */}
                    <button
                      onClick={() => toggleAccordion(idx)}
                      className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                    >
                      <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white leading-snug pr-4">
                        {currentLang === 'ta' ? faq.qTamil : faq.q}
                      </h3>
                      <div className="bg-neutral-50 dark:bg-neutral-850 p-1.5 rounded-full flex items-center justify-center flex-shrink-0">
                        <Plus className={`w-4 h-4 text-primary-500 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
                      </div>
                    </button>

                    {/* Animated body panel */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 pt-1 text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-50 dark:border-neutral-850">
                            {currentLang === 'ta' ? faq.aTamil : faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12 space-y-2">
                <HelpIcon className="w-12 h-12 text-neutral-300 mx-auto" />
                <p className="text-sm font-bold text-neutral-500">
                  No questions match your query. Try different keywords.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Still Need Help? Section */}
        <div className="bg-gradient-to-r from-primary-500/5 to-primary-700/5 border border-primary-500/10 rounded-feature p-8 text-center space-y-6 pt-10" data-aos="fade-up">
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-bold text-lg text-neutral-905 dark:text-white leading-tight">
              {t('faq.help_title', 'Still need help?')}
            </h3>
            <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {t('faq.help_desc', 'Our support team is available 24/7 to resolve your inquiries.')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="mailto:support@aetherorganic.com"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-card text-xs font-bold text-neutral-700 dark:text-white hover:border-neutral-350 shadow-sm"
            >
              <Mail className="w-4 h-4 text-primary-500" />
              <span>Email Support</span>
            </a>
            <a
              href="tel:+919876543210"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-card text-xs font-bold text-neutral-700 dark:text-white hover:border-neutral-350 shadow-sm"
            >
              <PhoneCall className="w-4 h-4 text-primary-500" />
              <span>Call Us Direct</span>
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-card text-xs font-bold hover:bg-primary-400 shadow"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>{t('faq.contact_us', 'Contact Support')}</span>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
