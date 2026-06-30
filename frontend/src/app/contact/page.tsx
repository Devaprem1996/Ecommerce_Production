"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import 'aos/dist/aos.css';

const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

// Contact Form Schema
const contactSchema = z.object({
  name: z.string().min(2, { message: 'about.validation_name' }),
  email: z.string().email({ message: 'about.validation_email' }),
  phone: z.string().regex(/^\d{10}$/, { message: 'about.validation_phone' }),
  subject: z.string().min(1, { message: 'about.validation_subject' }),
  message: z.string().min(10, { message: 'about.validation_message' })
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { t } = useTranslation();
  const [isSent, setIsSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // AOS Init
  useEffect(() => {
    import('aos').then((AOS) => {
      AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
      });
    });
  }, []);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    }
  });

  const onSubmit = (data: ContactFormData) => {
    setSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setSubmitting(false);
      setIsSent(true);
      reset();
    }, 1500);
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
              {t('contact.title', 'Contact Us')}
            </span>
          </nav>
        </div>
      </div>

      {/* Header section */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-10 text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-2">
          <h1 className="text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
            {t('contact.title', 'Contact Us')}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-400">
            {t('contact.subtitle', 'Get in touch with our organic team')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column - Contact Form */}
          <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 sm:p-8 shadow-sm">
            <AnimatePresence mode="wait">
              {!isSent ? (
                <motion.form
                  key="contact-form"
                  onSubmit={handleSubmit(onSubmit)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                        {t('contact.form_name', 'Your Name')} *
                      </label>
                      <input
                        type="text"
                        {...register('name')}
                        className="w-full text-xs font-semibold px-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      {errors.name && (
                        <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {t(errors.name.message || '', 'Name is invalid')}
                        </span>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                        {t('contact.form_email', 'Email Address')} *
                      </label>
                      <input
                        type="email"
                        {...register('email')}
                        className="w-full text-xs font-semibold px-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      {errors.email && (
                        <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {t(errors.email.message || '', 'Email is invalid')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                        {t('contact.form_phone', 'Phone Number')} *
                      </label>
                      <input
                        type="tel"
                        {...register('phone')}
                        placeholder="10-digit number"
                        className="w-full text-xs font-semibold px-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      {errors.phone && (
                        <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {t(errors.phone.message || '', 'Phone is invalid')}
                        </span>
                      )}
                    </div>

                    {/* Subject */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                        {t('contact.form_subject', 'Subject')} *
                      </label>
                      <select
                        {...register('subject')}
                        className="w-full text-xs font-semibold px-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                      >
                        <option value="">Choose Subject</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Order Status">Order & Sourcing Status</option>
                        <option value="Farm Sourcing">Direct-Farm Sourcing</option>
                        <option value="Partnerships">Bulk Orders & Partnerships</option>
                      </select>
                      {errors.subject && (
                        <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {t(errors.subject.message || '', 'Subject is required')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                      {t('contact.form_message', 'Your Message')} *
                    </label>
                    <textarea
                      rows={5}
                      {...register('message')}
                      className="w-full text-xs font-semibold px-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 resize-y"
                    />
                    {errors.message && (
                      <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {t(errors.message.message || '', 'Message is invalid')}
                      </span>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                    className="w-full font-bold text-xs"
                    rightIcon={submitting ? undefined : <Send className="w-4 h-4" />}
                    isLoading={submitting}
                  >
                    {submitting ? t('contact.form_submitting', 'Sending...') : t('contact.form_submit', 'Send Message')}
                  </Button>
                </motion.form>
              ) : (
                <motion.div
                  key="contact-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center space-y-4"
                >
                  <div className="w-16 h-16 text-success bg-success/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                      {t('contact.success_title', 'Message Sent!')}
                    </h3>
                    <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto">
                      {t('contact.success_desc', 'Thank you for reaching out. We will get back to you within 24 hours.')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setIsSent(false)}
                    className="font-bold text-xs"
                  >
                    Send Another Message
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Contact Details & Map */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Details Panel */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 shadow-sm space-y-6">
              <h3 className="font-black text-base text-neutral-905 dark:text-white uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-800 pb-3">
                {t('contact.biz_details', 'Business Details')}
              </h3>

              <div className="space-y-4">
                {/* Address */}
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Address</h4>
                    <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                      {t('contact.biz_address', 'OMR Road, Taramani, Chennai, TN - 600113')}
                    </p>
                  </div>
                </div>

                {/* Phones */}
                <div className="flex gap-3">
                  <Phone className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Phone Calls</h4>
                    <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mt-1">
                      +91 98765 43210 / +91 44 2837 4655
                    </p>
                  </div>
                </div>

                {/* Emails */}
                <div className="flex gap-3">
                  <Mail className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Email Addresses</h4>
                    <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mt-1">
                      support@aetherorganic.com / sourcing@aether.org
                    </p>
                  </div>
                </div>

                {/* Working hours */}
                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                      {t('contact.biz_hours', 'Working Hours')}
                    </h4>
                    <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 mt-1">
                      {t('contact.biz_hours_val', 'Monday - Saturday: 9:00 AM - 6:00 PM')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social links */}
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 flex gap-4 items-center">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Connect:</span>
                <div className="flex gap-2">
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-500 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-blue-600/10 hover:bg-blue-600 hover:text-white text-blue-650 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                  >
                    <Facebook className="w-4 h-4 fill-current" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-pink-600/10 hover:bg-pink-600 hover:text-white text-pink-600 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-sky-500/10 hover:bg-sky-500 hover:text-white text-sky-500 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                  >
                    <Twitter className="w-4 h-4 fill-current" />
                  </a>
                </div>
              </div>
            </div>

            {/* Offline SVG Stylized Map */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature overflow-hidden shadow-sm">
              <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500" />
                <span className="text-[10px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                  Our Processing & Sourcing Center
                </span>
              </div>
              <div className="h-48 bg-neutral-100 dark:bg-neutral-950 relative flex items-center justify-center">
                {/* Stylized SVG Map background */}
                <svg viewBox="0 0 400 200" className="w-full h-full text-neutral-200 dark:text-neutral-900">
                  <path d="M50 30 Q 120 80 180 20 T 300 80 T 380 40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
                  <path d="M20 120 Q 90 140 170 110 T 290 160 T 370 120" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" />
                  <circle cx="150" cy="90" r="45" fill="currentColor" opacity="0.3" />
                  <circle cx="280" cy="130" r="30" fill="currentColor" opacity="0.3" />
                  <line x1="200" y1="0" x2="200" y2="200" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1="0" y1="100" x2="400" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
                </svg>

                {/* Pulsing Pin Marker */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center animate-ping absolute" />
                  <MapPin className="w-8 h-8 text-primary-500 relative fill-white dark:fill-neutral-900 drop-shadow-md" />
                  <span className="bg-primary-500 text-white font-bold text-[8px] uppercase tracking-wider py-0.5 px-2 rounded-full mt-1.5 shadow-sm">
                    Taramani, Chennai
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
