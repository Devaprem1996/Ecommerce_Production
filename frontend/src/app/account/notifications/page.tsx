"use client";

import React, { useEffect, useState } from 'react';
import { accountService, CustomerOrder } from '@/services/account.service';
import Link from 'next/link';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Check, 
  Info,
  Gift,
  FileText,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { toast } from '@/components/ui/Toast';
import { motion } from 'framer-motion';

interface OrderAlert {
  id: string;
  orderId: string;
  orderNumber: string;
  title: string;
  message: string;
  type: 'logistics' | 'confirmed' | 'delivered' | 'refunded' | 'pending';
  timestamp: string;
  trackingUrl?: string | null;
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'settings'>('feed');
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

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

  // Load orders and generate live alerts
  useEffect(() => {
    accountService.getOrders()
      .then((data) => {
        setOrders(data);
      })
      .catch((err) => {
        console.error('Failed to load notifications:', err);
      })
      .finally(() => {
        setLoadingOrders(false);
      });
  }, []);

  // Generate order alerts feed
  const alertsFeed: OrderAlert[] = React.useMemo(() => {
    const list: OrderAlert[] = [];
    orders.forEach((order) => {
      const orderNum = order.orderNumber || order.id.slice(0, 8);
      const upperStatus = order.status.toUpperCase();

      if (upperStatus === 'REFUNDED') {
        list.push({
          id: `${order.id}-refunded`,
          orderId: order.id,
          orderNumber: orderNum,
          title: `Refund Processed for #${orderNum}`,
          message: `Full refund has been credited back to your original payment method via Razorpay. It usually reflects within 5-7 business days.`,
          type: 'refunded',
          timestamp: order.createdAt,
        });
      }

      if (upperStatus === 'DELIVERED') {
        list.push({
          id: `${order.id}-delivered`,
          orderId: order.id,
          orderNumber: orderNum,
          title: `Order #${orderNum} Delivered`,
          message: `Your package has been successfully delivered. We hope you enjoy our pure organic harvest!`,
          type: 'delivered',
          timestamp: order.createdAt,
        });
      }

      if (order.courierPartner || order.trackingNumber || upperStatus === 'SHIPPED' || upperStatus === 'OUT_FOR_DELIVERY') {
        list.push({
          id: `${order.id}-shipped`,
          orderId: order.id,
          orderNumber: orderNum,
          title: `Order #${orderNum} Dispatched & In Transit`,
          message: order.courierPartner
            ? `Your parcel is with ${order.courierPartner}${order.trackingNumber ? ` (AWB: ${order.trackingNumber})` : ''}. Tracking link is active.`
            : `Your order has left our central organic facility and is heading to your delivery location.`,
          type: 'logistics',
          timestamp: order.dispatchedAt || order.createdAt,
          trackingUrl: order.trackingUrl || `/track-order?orderId=${orderNum}`,
        });
      }

      if (upperStatus === 'CONFIRMED' || upperStatus === 'PAYMENT_VERIFIED' || upperStatus === 'PROCESSING') {
        list.push({
          id: `${order.id}-confirmed`,
          orderId: order.id,
          orderNumber: orderNum,
          title: `Order #${orderNum} Confirmed`,
          message: `We have verified your order details and items are being hand-packed with eco-friendly protective materials.`,
          type: 'confirmed',
          timestamp: order.createdAt,
        });
      }
    });

    return list;
  }, [orders]);

  // Load saved preferences
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('user_notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setOrderSms(parsed.orderSms ?? true);
        setOrderEmail(parsed.orderEmail ?? true);
        setOrderWhatsapp(parsed.orderWhatsapp ?? true);
        setPromotions(parsed.promotions ?? false);
        setAlerts(parsed.alerts ?? true);
        setNewsletter(parsed.newsletter ?? false);
      } catch (_) {}
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
    }, 800);
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
      
      {/* Title Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-heading font-black text-neutral-900 dark:text-white">
            Notifications &amp; Activity
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
            Stay informed with real-time dispatch updates and manage your communication preferences.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs font-bold select-none shrink-0">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Activity Feed</span>
            {alertsFeed.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-primary-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Preferences</span>
          </button>
        </div>
      </div>

      {activeTab === 'feed' ? (
        /* LIVE ACTIVITY FEED */
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="text-center py-16 px-4 bg-neutral-50/50 dark:bg-neutral-950/20 border border-neutral-150 dark:border-neutral-850 rounded-feature flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                Checking notifications...
              </p>
            </div>
          ) : alertsFeed.length === 0 ? (
            <div className="text-center py-16 px-4 bg-neutral-50/50 dark:bg-neutral-950/20 border border-neutral-150 dark:border-neutral-850 rounded-feature space-y-3">
              <Bell className="w-10 h-10 text-neutral-400 mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                No New Notifications
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                When you place orders or when our warehouse dispatches shipments with courier tracking, notifications will appear here.
              </p>
              <Link href="/shop" className="inline-block pt-2">
                <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-card border-none cursor-pointer shadow-sm">
                  Browse Store Catalog →
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {alertsFeed.map((alert) => {
                const formattedTime = new Date(alert.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={alert.id}
                    className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-feature p-4.5 shadow-sm hover:shadow transition-shadow flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        alert.type === 'logistics'
                          ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400'
                          : alert.type === 'delivered'
                          ? 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400'
                          : alert.type === 'refunded'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          : 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400'
                      }`}>
                        {alert.type === 'logistics' ? (
                          <Truck className="w-4.5 h-4.5" />
                        ) : alert.type === 'delivered' ? (
                          <CheckCircle2 className="w-4.5 h-4.5" />
                        ) : alert.type === 'refunded' ? (
                          <Check className="w-4.5 h-4.5" />
                        ) : (
                          <Package className="w-4.5 h-4.5" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                            {alert.title}
                          </h4>
                          <span className="text-[10px] text-neutral-400 flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3" />
                            {formattedTime}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed font-normal">
                          {alert.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-center">
                      {alert.trackingUrl ? (
                        <Link href={alert.trackingUrl}>
                          <button className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 hover:bg-primary-100 transition-colors flex items-center gap-1 cursor-pointer">
                            <span>Track</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </Link>
                      ) : (
                        <Link href={`/account/orders/${alert.orderId}`}>
                          <button className="px-3 py-1.5 text-[11px] font-bold rounded-lg border border-neutral-200 dark:border-neutral-750 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                            <span>Details</span>
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* CHANNEL PREFERENCES FORM */
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
                Yathu Arokiyagam Digest
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
      )}

    </div>
  );
}
