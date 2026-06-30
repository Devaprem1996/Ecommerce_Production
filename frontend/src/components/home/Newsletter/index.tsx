"use client";

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { Mail, CheckCircle2 } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError(
        currentLang === 'ta'
          ? 'செல்லுபடியாகும் மின்னஞ்சல் முகவரியை உள்ளிடவும்.'
          : 'Please enter a valid email address.'
      );
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
      toast.success(
        currentLang === 'ta'
          ? 'சந்தா வெற்றிகரமாக சேர்க்கப்பட்டது!'
          : 'Subscribed successfully!'
      );
    }, 1000);
  };

  return (
    <section className="w-full py-16 bg-gradient-to-br from-primary-700 to-primary-500 text-white font-sans overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6">
        {/* Animated Icon */}
        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-2" data-aos="zoom-in">
          <Mail className="w-7 h-7 text-white" />
        </div>

        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="newsletter-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col items-center w-full gap-4"
            >
              {/* Title & Subtitle */}
              <div className="max-w-xl flex flex-col gap-2" data-aos="fade-up">
                <h2 className="text-2xl sm:text-4xl font-bold font-heading text-white">
                  {t('newsletter.title', 'Subscribe to Our Newsletter')}
                </h2>
                <p className="text-sm text-neutral-100">
                  {currentLang === 'ta'
                    ? 'வாராந்திர இயற்கை சமையல் குறிப்புகள், சலுகைகள் மற்றும் சிறப்புத் தள்ளுபடிகளைப் பெறுங்கள்.'
                    : 'Get weekly recipes, farm updates, and exclusive discounts delivered straight to your inbox.'}
                </p>
              </div>

              {/* Form Input + Button Wrapper */}
              <form onSubmit={handleSubmit} className="w-full max-w-lg mt-4" data-aos="fade-up" data-aos-delay="100">
                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                  <div className="flex-1 text-left">
                    <Input
                      label={t('newsletter.placeholder', 'Enter your email')}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={error}
                      disabled={loading}
                      className="text-neutral-900 bg-white border-white/20 focus:ring-secondary-400"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="cta"
                    size="lg"
                    isLoading={loading}
                    className="h-12 bg-secondary-500 hover:bg-secondary-600 border-none text-white font-bold sm:min-w-[140px]"
                  >
                    {t('newsletter.subscribe', 'Subscribe')}
                  </Button>
                </div>
              </form>

              {/* Privacy text */}
              <span className="text-xs text-neutral-200 mt-2 flex items-center gap-1.5 justify-center" data-aos="fade-up" data-aos-delay="150">
                {t('newsletter.privacy', 'We care about your privacy. Unsubscribe anytime.')}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="newsletter-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="flex flex-col items-center gap-3 p-6 max-w-md bg-white/10 backdrop-blur-md border border-white/25 rounded-feature"
            >
              <CheckCircle2 className="w-14 h-14 text-white" />
              <h3 className="text-xl font-bold font-heading">
                {currentLang === 'ta' ? 'சந்தா சேர்ந்ததற்கு நன்றி!' : 'Thank You for Subscribing!'}
              </h3>
              <p className="text-sm text-neutral-100">
                {currentLang === 'ta'
                  ? 'வழக்கமான அறிவிப்புகள் மற்றும் சிறப்பு தள்ளுபடி விவரங்கள் உங்கள் மின்னஞ்சலுக்கு விரைவில் வரும்.'
                  : 'You have been successfully added to our mailing list. Watch your inbox for a 20% coupon code!'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
