"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Search, 
  MapPin, 
  Truck, 
  Calendar, 
  Phone, 
  CheckCircle2, 
  Loader2,
  Package,
  Clock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import 'aos/dist/aos.css';

interface TrackingData {
  orderId: string;
  phone: string;
  estDelivery: string;
  estDeliveryTamil: string;
  carrierName: string;
  trackingNo: string;
  currentStep: number; // 0: Ordered, 1: Processing, 2: Shipped, 3: Out for Delivery, 4: Delivered
  steps: {
    title: string;
    titleTamil: string;
    desc: string;
    descTamil: string;
    time: string;
    timeTamil: string;
  }[];
}

export default function TrackOrderPage() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  useEffect(() => {
    import('aos').then((AOS) => {
      AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
      });
    });
  }, []);

  const [orderIdInput, setOrderIdInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  
  const [isSearching, setIsSearching] = useState(false);
  const [trackingResult, setTrackingResult] = useState<TrackingData | null>(null);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderIdInput.trim()) {
      toast.warning('Please enter an Order ID.');
      return;
    }
    if (!phoneInput.match(/^\d{10}$/)) {
      toast.warning('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSearching(true);
    setTrackingResult(null);

    // Simulate database tracking query latency
    setTimeout(() => {
      setIsSearching(false);
      
      const mockResult: TrackingData = {
        orderId: orderIdInput.toUpperCase().startsWith('#') ? orderIdInput.toUpperCase() : `#${orderIdInput.toUpperCase()}`,
        phone: phoneInput,
        estDelivery: 'July 3, 2026',
        estDeliveryTamil: 'ஜூலை 3, 2026',
        carrierName: 'Delhivery Courier',
        trackingNo: 'DEL9871625341',
        currentStep: 2, // Shipped state active
        steps: [
          {
            title: 'Order Placed',
            titleTamil: 'ஆர்டர் செய்யப்பட்டது',
            desc: 'We received your organic order reference.',
            descTamil: 'உங்கள் ஆர்டர் குறிப்பு பெறப்பட்டது.',
            time: 'June 29, 2026, 09:30 AM',
            timeTamil: 'ஜூன் 29, 2026, 09:30 முற்பகல்'
          },
          {
            title: 'Processing & Packing',
            titleTamil: 'தயாரிக்கப்படுகிறது',
            desc: 'Direct-farm products packed and lab-tested.',
            descTamil: 'தயாரிப்புகள் பேக் செய்யப்பட்டு பரிசோதிக்கப்பட்டது.',
            time: 'June 29, 2026, 02:45 PM',
            timeTamil: 'ஜூன் 29, 2026, 02:45 பிற்பகல்'
          },
          {
            title: 'Shipped',
            titleTamil: 'அனுப்பப்பட்டது',
            desc: 'In transit via carrier partner hub.',
            descTamil: 'கூரியர் நிறுவனம் மூலம் அனுப்பப்பட்டது.',
            time: 'June 30, 2026, 10:15 AM',
            timeTamil: 'ஜூன் 30, 2026, 10:15 முற்பகல்'
          },
          {
            title: 'Out for Delivery',
            titleTamil: 'டெலிவரிக்கு தயாராக உள்ளது',
            desc: 'Local delivery courier will contact you.',
            descTamil: 'உள்ளூர் டெலிவரி முகவர் உங்களை தொடர்பு கொள்வார்.',
            time: 'Pending Delivery Route',
            timeTamil: 'விநியோகப் பாதையில் உள்ளது'
          },
          {
            title: 'Delivered',
            titleTamil: 'டெலிவரி செய்யப்பட்டது',
            desc: 'Parcel handed over to customer.',
            descTamil: 'பார்சல் வாடிக்கையாளரிடம் ஒப்படைக்கப்பட்டது.',
            time: 'Pending Delivery Signature',
            timeTamil: 'கையொப்பம் நிலுவையில் உள்ளது'
          }
        ]
      };

      setTrackingResult(mockResult);
      toast.success('Order details located successfully!');
    }, 1200);
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
              {t('track.title', 'Track Order')}
            </span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-10 text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-2">
          <h1 className="text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
            {t('track.title', 'Track Your Order')}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-400">
            {t('track.subtitle', 'Check the status of your shipment in real-time.')}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-12 space-y-8">
        
        {/* Verification Form Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 sm:p-8 shadow-sm space-y-6">
          <form onSubmit={handleTrackSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            
            {/* Order Ref */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                {t('track.order_id', 'Order Reference')} *
              </label>
              <input
                type="text"
                required
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder={t('track.order_placeholder', 'Order Number (e.g. AETH-123456)')}
                className="w-full text-xs font-semibold px-3.5 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                {t('contact.form_phone', 'Phone Number')} *
              </label>
              <input
                type="tel"
                required
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder={t('track.phone_placeholder', '10-Digit Mobile Number')}
                className="w-full text-xs font-semibold px-3.5 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={isSearching}
                className="w-full font-bold text-xs py-3"
                isLoading={isSearching}
              >
                {isSearching ? t('track.searching', 'Locating details...') : t('track.button', 'Track Order Status')}
              </Button>
            </div>
          </form>
        </div>

        {/* TIMELINE DASHBOARD DISPLAY */}
        <AnimatePresence mode="wait">
          {trackingResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 sm:p-8 shadow-md space-y-6"
            >
              {/* Order Metadata summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-b border-neutral-50 dark:border-neutral-850 pb-5 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Order ID</span>
                  <span className="font-bold text-neutral-900 dark:text-white block mt-1">{trackingResult.orderId}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                    {t('track.est_delivery', 'Estimated Delivery')}
                  </span>
                  <span className="font-bold text-primary-500 block mt-1">
                    {currentLang === 'ta' ? trackingResult.estDeliveryTamil : trackingResult.estDelivery}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">
                    {t('track.carrier', 'Courier Partner')}
                  </span>
                  <a
                    href="https://www.delhivery.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-neutral-900 dark:text-white mt-1 hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{trackingResult.carrierName}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-primary-500" />
                  </a>
                </div>
              </div>

              {/* Status Timelines */}
              <div className="relative pl-8 space-y-8">
                
                {/* Vertical tracking pipe line */}
                <div className="absolute left-[13px] top-2 bottom-2 w-1 bg-neutral-100 dark:bg-neutral-800" />

                {trackingResult.steps.map((step, idx) => {
                  const isCompleted = idx < trackingResult.currentStep;
                  const isActive = idx === trackingResult.currentStep;
                  const isPending = idx > trackingResult.currentStep;

                  return (
                    <div key={step.title} className="relative flex flex-col sm:flex-row justify-between gap-2">
                      
                      {/* Timeline dot */}
                      <div className="absolute -left-[28px] top-1">
                        {isCompleted && (
                          <div className="w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center border-4 border-white dark:border-neutral-900 shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                        )}
                        {isActive && (
                          <div className="relative flex items-center justify-center">
                            <div className="w-5 h-5 rounded-full bg-primary-500/20 absolute animate-ping" />
                            <div className="w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center border-4 border-white dark:border-neutral-900 shadow relative z-10" />
                          </div>
                        )}
                        {isPending && (
                          <div className="w-4 h-4 rounded-full bg-neutral-200 dark:bg-neutral-800 border-4 border-white dark:border-neutral-900" />
                        )}
                      </div>

                      {/* Title & Desc */}
                      <div className="space-y-1">
                        <h4 className={`font-bold text-sm leading-none ${
                          isActive ? 'text-primary-500' : isCompleted ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'
                        }`}>
                          {currentLang === 'ta' ? step.titleTamil : step.title}
                        </h4>
                        <p className={`text-xs font-semibold leading-relaxed ${
                          isActive ? 'text-neutral-700 dark:text-neutral-300' : isCompleted ? 'text-neutral-600 dark:text-neutral-400' : 'text-neutral-400/80'
                        }`}>
                          {currentLang === 'ta' ? step.descTamil : step.desc}
                        </p>
                      </div>

                      {/* Timestamp */}
                      <span className={`text-[10px] font-bold uppercase tracking-wider self-start sm:self-center whitespace-nowrap px-2 py-0.5 rounded ${
                        isActive ? 'bg-primary-500/10 text-primary-500' : isCompleted ? 'text-neutral-500' : 'text-neutral-400/60'
                      }`}>
                        {currentLang === 'ta' ? step.timeTamil : step.time}
                      </span>

                    </div>
                  );
                })}

              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
