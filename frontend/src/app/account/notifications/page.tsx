"use client";

import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Check, 
  Info,
  Gift,
  FileText
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { motion } from 'framer-motion';

export default function NotificationsPage() {
  // Toggle states
  const [orderSms, setOrderSms] = useState(true);
  const [orderEmail, setOrderEmail] = useState(true);
  const [orderWhatsapp, setOrderWhatsapp] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [alerts, setAlerts] = useState(true);
  const [newsletter, setNewsletter] = useState(false);

  // UI state
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('user_notifications');
    if (stored) {
      const parsed = JSON.parse(stored);
      setOrderSms(parsed.orderSms ?? true);
      setOrderEmail(parsed.orderEmail ?? true);
      setOrderWhatsapp(parsed.orderWhatsapp ?? true);
      setPromotions(parsed.promotions ?? false);
      setAlerts(parsed.alerts ?? true);
      setNewsletter(parsed.newsletter ?? false);
    }
  }, []);

  // Save state
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    const preferences = {
      orderSms,
      orderEmail,
      orderWhatsapp,
      promotions,
      alerts,
      newsletter
    };

    localStorage.setItem('user_notifications', JSON.stringify(preferences));

    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      toast.success('Notification preferences updated successfully.');
      setTimeout(() => setSavedSuccess(false), 2000);
    }, 1000);
  };

  // Reusable Switch Component
  const Switch = ({ active, onChange }: { active: boolean; onChange: () => void }) => {
    return (
      <div 
        onClick={onChange}
        className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors duration-250 select-none flex items-center ${
          active ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-neutral-800'
        }`}
      >
        <motion.div 
          layout
          className="w-4 h-4 bg-white rounded-full shadow-sm"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          animate={{ x: active ? 16 : 0 }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <h2 className="text-xl font-heading font-black text-neutral-900 dark:text-white">
          Notification Preferences
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
          Control how and when you receive alerts from Aether Organic.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* GROUP 1: ORDER UPDATES */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-feature p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2.5 select-none">
            <Smartphone className="w-4.5 h-4.5 text-primary-500" /> Order Updates & Delivery Tracking
          </h3>
          
          <div className="space-y-4">
            {/* SMS */}
            <div className="flex items-center justify-between text-xs">
              <div className="space-y-0.5 pr-4">
                <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  SMS Alerts
                </h4>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-450 leading-relaxed font-medium">
                  Receive instant text notifications on order placement, dispatch, and delivery updates.
                </p>
              </div>
              <Switch active={orderSms} onChange={() => setOrderSms(!orderSms)} />
            </div>

            {/* Email */}
            <div className="flex items-center justify-between text-xs border-t border-neutral-100 dark:border-neutral-800/60 pt-4">
              <div className="space-y-0.5 pr-4">
                <h4 className="font-bold text-neutral-900 dark:text-white">
                  Email Notifications
                </h4>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-450 leading-relaxed font-medium">
                  Get PDF invoices, dispatch manifests, and full tracking links delivered to your inbox.
                </p>
              </div>
              <Switch active={orderEmail} onChange={() => setOrderEmail(!orderEmail)} />
            </div>

            {/* WhatsApp */}
            <div className="flex items-center justify-between text-xs border-t border-neutral-100 dark:border-neutral-800/60 pt-4">
              <div className="space-y-0.5 pr-4">
                <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                  WhatsApp Updates
                </h4>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-450 leading-relaxed font-medium">
                  Opt-in to real-time chat updates with direct links to our customer support desk.
                </p>
              </div>
              <Switch active={orderWhatsapp} onChange={() => setOrderWhatsapp(!orderWhatsapp)} />
            </div>
          </div>
        </div>

        {/* GROUP 2: PROMOTIONS & MARKETING */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-feature p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2.5 select-none">
            <Gift className="w-4.5 h-4.5 text-primary-500" /> Promotions & Offers
          </h3>
          
          <div className="space-y-4">
            {/* Promotions */}
            <div className="flex items-center justify-between text-xs">
              <div className="space-y-0.5 pr-4">
                <h4 className="font-bold text-neutral-900 dark:text-white">
                  Deals & Special Offers
                </h4>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-450 leading-relaxed font-medium">
                  Be the first to hear about seasonal sales, discount codes, and organic product bundles.
                </p>
              </div>
              <Switch active={promotions} onChange={() => setPromotions(!promotions)} />
            </div>

            {/* Alerts */}
            <div className="flex items-center justify-between text-xs border-t border-neutral-100 dark:border-neutral-800/60 pt-4">
              <div className="space-y-0.5 pr-4">
                <h4 className="font-bold text-neutral-900 dark:text-white">
                  New Product Announcements
                </h4>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-450 leading-relaxed font-medium">
                  Get notified when limited-batch organic imports or fresh harvest items go live.
                </p>
              </div>
              <Switch active={alerts} onChange={() => setAlerts(!alerts)} />
            </div>
          </div>
        </div>

        {/* GROUP 3: NEWSLETTER */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-feature p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2.5 select-none">
            <FileText className="w-4.5 h-4.5 text-primary-500" /> Newsletter Subscriptions
          </h3>
          
          <div className="flex items-center justify-between text-xs">
            <div className="space-y-0.5 pr-4">
              <h4 className="font-bold text-neutral-900 dark:text-white">
                Aether Organic Digest
              </h4>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-450 leading-relaxed font-medium">
                Our bi-weekly journal covering organic agricultural tips, nutritional chemistry, and kitchen recipes.
                </p>
            </div>
            <Switch active={newsletter} onChange={() => setNewsletter(!newsletter)} />
          </div>
        </div>

        {/* Save button */}
        <div className="pt-2 select-none">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-6 py-2.5 bg-primary-500 hover:bg-primary-600 border-none text-xs font-bold text-white rounded-card cursor-pointer flex items-center justify-center gap-2 shadow-sm min-w-[140px]"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : savedSuccess ? (
              <Check className="w-4 h-4 text-white" />
            ) : null}
            <span>{saving ? 'Saving...' : savedSuccess ? 'Preferences Saved!' : 'Save Notifications'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
