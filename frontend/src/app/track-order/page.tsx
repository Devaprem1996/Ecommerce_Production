"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
  Check, 
  Loader2,
  Package,
  ClipboardList,
  Home,
  XCircle,
  RotateCcw,
  ShoppingBag, 
  ExternalLink,
  ChevronDown,
  FileText,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth-store';
import { mockProducts } from '@/constants/mockData';
import { formatPrice } from '@/utils/formatPrice';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
}

interface TrackingStep {
  title: string;
  titleTamil: string;
  desc: string;
  descTamil: string;
  time: string;
  timeTamil: string;
  status: string;
}

interface TrackingData {
  orderId: string;
  phone: string;
  status: string;
  estDelivery: string;
  estDeliveryTamil: string;
  carrierName: string;
  trackingNo: string;
  currentStep: number; // 0: Placed, 1: Confirmed, 2: Packed, 3: Shipped, 4: Out for Delivery, 5: Delivered
  steps: TrackingStep[];
  address: string;
  items: OrderItem[];
}

export default function TrackOrderPage() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const { isLoggedIn, user } = useAuthStore();

  const [orderIdInput, setOrderIdInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [trackingResult, setTrackingResult] = useState<TrackingData | null>(null);
  
  // User orders for logged-in dropdown selection
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');

  // Load orders on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedOrders = localStorage.getItem('user_orders');
      if (storedOrders) {
        const parsed = JSON.parse(storedOrders);
        setUserOrders(parsed);
        if (parsed.length > 0) {
          // Default to select first order
          setSelectedOrderId(parsed[0].id);
        }
      }
    }
  }, [isLoggedIn]);

  // Load tracking information for selected order if logged-in
  const handleSelectOrderTrack = (orderId: string) => {
    if (!orderId) return;
    setIsSearching(true);
    setTrackingResult(null);

    setTimeout(() => {
      setIsSearching(false);
      const tracking = generateTrackingResult(orderId, user?.mobile || '9876543210');
      setTrackingResult(tracking);
      toast.success(currentLang === 'ta' ? 'விவரங்கள் பெறப்பட்டன!' : 'Tracking details retrieved!');
    }, 800);
  };

  // Generate tracking result based on order history or default mock
  const generateTrackingResult = (orderId: string, phone: string): TrackingData => {
    // Check if order exists in localStorage
    const storedOrders = typeof window !== 'undefined' ? localStorage.getItem('user_orders') : null;
    let matchingOrder: any = null;
    if (storedOrders) {
      const parsed = JSON.parse(storedOrders);
      matchingOrder = parsed.find((o: any) => o.id === orderId || o.id === `#${orderId}` || `#${o.id}` === orderId);
    }

    // Default dates/items
    let status = 'Shipped';
    let currentStep = 3;
    let orderDate = '12 Jan 2025';
    let total = 698;
    let address = 'John D, 123 Anna Nagar, Chennai - 600040';
    let items: OrderItem[] = [
      { productId: 'p1', name: 'Organic Red Rice', price: 299, quantity: 1, unit: '1kg', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=200&auto=format&fit=crop' },
      { productId: 'p2', name: 'Cold Pressed Sesame Oil', price: 399, quantity: 1, unit: '500ml', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=200&auto=format&fit=crop' }
    ];

    if (matchingOrder) {
      status = matchingOrder.status;
      orderDate = matchingOrder.date || 'Today';
      total = matchingOrder.total;
      address = matchingOrder.shippingAddress || '123 Anna Nagar, Chennai - 600040';
      
      // Map matching order status to step numbers
      const statusLower = status.toLowerCase();
      if (statusLower === 'pending') {
        currentStep = 0;
      } else if (statusLower === 'processing') {
        currentStep = 2; // Packed & Ready
      } else if (statusLower === 'shipped') {
        currentStep = 3;
      } else if (statusLower === 'delivered') {
        currentStep = 5;
      } else if (statusLower === 'cancelled') {
        currentStep = -1; // Cancelled code
      } else if (statusLower === 'returned') {
        currentStep = -2; // Returned code
      }

      // Map matching items
      items = matchingOrder.items.map((item: any) => {
        const prod = mockProducts.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          name: prod?.name || item.name || 'Organic Product',
          price: item.price,
          quantity: item.quantity,
          unit: prod?.unit || '1 unit',
          image: prod?.images[0] || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=200&auto=format&fit=crop'
        };
      });
    } else {
      // Custom states based on query terms (e.g. DEL for delivered)
      const cleanId = orderId.toUpperCase();
      if (cleanId.includes('DEL')) {
        currentStep = 5;
        status = 'Delivered';
      } else if (cleanId.includes('CAN')) {
        currentStep = -1;
        status = 'Cancelled';
      } else if (cleanId.includes('RET')) {
        currentStep = -2;
        status = 'Returned';
      } else if (cleanId.includes('PEN')) {
        currentStep = 0;
        status = 'Pending';
      } else if (cleanId.includes('PRO')) {
        currentStep = 2;
        status = 'Processing';
      }
    }

    const steps: TrackingStep[] = [
      {
        title: 'Order Placed',
        titleTamil: 'ஆர்டர் செய்யப்பட்டது',
        desc: 'Your order was received successfully',
        descTamil: 'உங்கள் ஆர்டர் வெற்றிகரமாக பெறப்பட்டது',
        time: `${orderDate}, 10:30 AM`,
        timeTamil: `${orderDate}, முற்பகல் 10:30`,
        status: 'placed',
      },
      {
        title: 'Order Confirmed',
        titleTamil: 'ஆர்டர் உறுதி செய்யப்பட்டது',
        desc: 'Payment confirmed, preparing your order',
        descTamil: 'பணம் உறுதி செய்யப்பட்டது, தயாரிப்பு தயாராகிறது',
        time: `${orderDate}, 11:00 AM`,
        timeTamil: `${orderDate}, முற்பகல் 11:00`,
        status: 'confirmed',
      },
      {
        title: 'Packed & Ready',
        titleTamil: 'பேக் செய்யப்பட்டு தயாராக உள்ளது',
        desc: 'Your items are packed and lab-tested',
        descTamil: 'பொருட்கள் பேக் செய்யப்பட்டு ஆய்வு செய்யப்பட்டது',
        time: '13 Jan, 02:00 PM',
        timeTamil: '13 ஜனவரி, பிற்பகல் 02:00',
        status: 'packed',
      },
      {
        title: 'Shipped',
        titleTamil: 'அனுப்பப்பட்டது',
        desc: 'In transit via courier partner Delhivery',
        descTamil: 'கூரியர் நிறுவனம் டெல்லிவரி மூலம் அனுப்பப்பட்டது',
        time: '14 Jan, 09:00 AM',
        timeTamil: '14 ஜனவரி, முற்பகல் 09:00',
        status: 'shipped',
      },
      {
        title: 'Out for Delivery',
        titleTamil: 'டெலிவரிக்கு வெளியேறியது',
        desc: 'Courier agent will contact you shortly',
        descTamil: 'டெலிவரி முகவர் உங்களை விரைவில் தொடர்பு கொள்வார்',
        time: 'Expected: 15 Jan',
        timeTamil: 'எதிர்பார்ப்பு: 15 ஜனவரி',
        status: 'out_for_delivery',
      },
      {
        title: 'Delivered',
        titleTamil: 'டெலிவரி செய்யப்பட்டது',
        desc: 'Parcel handed over to customer',
        descTamil: 'பார்சல் வாடிக்கையாளரிடம் ஒப்படைக்கப்பட்டது',
        time: '15 Jan, 04:30 PM',
        timeTamil: '15 ஜனவரி, பிற்பகல் 04:30',
        status: 'delivered',
      }
    ];

    return {
      orderId: orderId.startsWith('#') ? orderId : `#${orderId}`,
      phone,
      status,
      estDelivery: '15 Jan 2025',
      estDeliveryTamil: '15 ஜனவரி 2025',
      carrierName: 'Delhivery',
      trackingNo: 'DEL-9876543210',
      currentStep,
      steps,
      address,
      items
    };
  };

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

    // Simulate lookup API
    setTimeout(() => {
      setIsSearching(false);
      // For demo, if order id is wrong (e.g. less than 5 characters or random) let's give error state if desired,
      // but otherwise match.
      if (orderIdInput.toLowerCase() === 'error') {
        toast.error('Unable to fetch. Please try again');
        return;
      }
      
      const tracking = generateTrackingResult(orderIdInput.trim().toUpperCase(), phoneInput);
      setTrackingResult(tracking);
      toast.success(currentLang === 'ta' ? 'ஆர்டர் கண்டறியப்பட்டது!' : 'Order details located successfully!');
    }, 1000);
  };

  // Helper to get status color and icon
  const getTimelineStepStyle = (idx: number, currentStep: number) => {
    // Handle cancelled/returned orders specially
    if (currentStep === -1) { // Cancelled
      return {
        color: 'text-red-500',
        borderColor: 'border-red-200 dark:border-red-900',
        bg: 'bg-red-500/15',
        completed: false,
        active: idx === 0,
        pending: idx > 0,
        lineColor: 'bg-neutral-200 dark:bg-neutral-800'
      };
    }
    if (currentStep === -2) { // Returned
      return {
        color: 'text-purple-500',
        borderColor: 'border-purple-200 dark:border-purple-900',
        bg: 'bg-purple-500/15',
        completed: false,
        active: idx === 0,
        pending: idx > 0,
        lineColor: 'bg-neutral-200 dark:bg-neutral-800'
      };
    }

    const isCompleted = idx < currentStep;
    const isActive = idx === currentStep;
    const isPending = idx > currentStep;

    let color = 'text-neutral-400';
    let bg = 'bg-neutral-100 dark:bg-neutral-800';
    let borderColor = 'border-neutral-200 dark:border-neutral-700';
    let lineColor = 'bg-neutral-200 dark:bg-neutral-800';

    if (isCompleted) {
      color = 'text-primary-600 dark:text-primary-400';
      bg = 'bg-primary-500';
      borderColor = 'border-primary-100 dark:border-primary-900';
      lineColor = 'bg-primary-500';
    } else if (isActive) {
      if (idx === 4) { // Out for delivery (Orange)
        color = 'text-orange-500';
        bg = 'bg-orange-500';
        borderColor = 'border-orange-200 dark:border-orange-900';
      } else if (idx === 3) { // Shipped (Blue)
        color = 'text-blue-500';
        bg = 'bg-blue-500';
        borderColor = 'border-blue-200 dark:border-blue-900';
      } else { // Others (Green/Primary)
        color = 'text-primary-600 dark:text-primary-400';
        bg = 'bg-primary-500';
        borderColor = 'border-primary-100 dark:border-primary-900';
      }
    }

    return {
      color,
      bg,
      borderColor,
      lineColor,
      completed: isCompleted,
      active: isActive,
      pending: isPending
    };
  };

  const getTimelineIcon = (status: string, style: any) => {
    const iconClass = `w-4.5 h-4.5 ${style.active || style.completed ? 'text-white' : 'text-neutral-450 dark:text-neutral-500'}`;
    
    switch (status) {
      case 'placed':
        return <ClipboardList className={iconClass} />;
      case 'confirmed':
        return <Check className={iconClass} />;
      case 'packed':
        return <Package className={iconClass} />;
      case 'shipped':
        return <Truck className={iconClass} />;
      case 'out_for_delivery':
        return <Truck className={`${iconClass} -scale-x-100`} />;
      case 'delivered':
        return <Home className={iconClass} />;
      default:
        return <Package className={iconClass} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans pb-20 transition-colors duration-normal">
      
      {/* Breadcrumbs */}
      <div className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            <Link href="/" className="hover:text-primary-500 transition-colors">
              {t('shop.breadcrumb_home', 'Home')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary-500 select-none">
              {t('track.title', 'Track Order')}
            </span>
          </nav>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-12 text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-3">
          <div className="inline-flex p-3 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-full mb-2">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading text-neutral-900 dark:text-white tracking-tight">
            {t('track.title', 'Track Your Order')}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-neutral-500 dark:text-neutral-400 max-w-md mx-auto leading-relaxed">
            {t('track.subtitle', 'Check the status of your shipment in real-time by entering order details.')}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-10 space-y-8">
        
        {/* LOGGED IN USER INTERFACE */}
        {isLoggedIn ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                {t('track.logged_in_title', 'Select Order to Track')}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                You are logged in as <span className="font-bold text-primary-500">{user?.name || user?.email}</span>. Click below to view and track your orders.
              </p>
            </div>

            {userOrders.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-card space-y-3">
                <AlertTriangle className="w-8 h-8 text-neutral-400 mx-auto" />
                <p className="text-xs text-neutral-500">
                  {t('track.no_orders', 'No recent orders found in your history.')}
                </p>
                <Link href="/shop" className="inline-block">
                  <Button variant="primary" size="sm" className="font-bold text-[11px]">
                    {t('search_page.browse_all', 'Browse Products')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
                <div className="flex-1 space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block">
                    Choose Order
                  </label>
                  <div className="relative">
                    <select
                      value={selectedOrderId}
                      onChange={(e) => setSelectedOrderId(e.target.value)}
                      className="appearance-none w-full text-xs font-bold px-4 py-3 border border-neutral-200 dark:border-neutral-750 bg-transparent rounded-card text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                    >
                      {userOrders.map((o) => (
                        <option key={o.id} value={o.id}>
                          Order #{o.id} — {o.date} (₹{o.total})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <Button
                  onClick={() => handleSelectOrderTrack(selectedOrderId)}
                  variant="primary"
                  className="font-bold text-xs py-3 px-6 whitespace-nowrap"
                  disabled={isSearching || !selectedOrderId}
                  leftIcon={isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                >
                  {isSearching ? t('track.searching', 'Locating...') : t('track.button', 'Track Order')}
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* GUEST USER INTERFACE */
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-neutral-50 dark:border-neutral-850 pb-3">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                {t('track.guest_title', 'Enter Order Details')}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Enter your order credentials to trace shipping details without logging in.
              </p>
            </div>

            <form onSubmit={handleTrackSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-450 uppercase tracking-widest block">
                  {t('track.order_id', 'Order ID')} *
                </label>
                <input
                  type="text"
                  required
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  placeholder="e.g. ORD-2025-00123"
                  className="w-full text-xs font-semibold px-4 py-3 border border-neutral-250 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-450 uppercase tracking-widest block">
                  {t('contact.form_phone', 'Mobile Number')} *
                </label>
                <input
                  type="tel"
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Number used while ordering"
                  className="w-full text-xs font-semibold px-4 py-3 border border-neutral-250 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              <div className="sm:col-span-2 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSearching}
                  className="w-full font-bold text-xs py-3"
                  leftIcon={isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                >
                  {isSearching ? t('track.searching', 'Locating details...') : t('track.button', 'Track My Order 🔍')}
                </Button>
              </div>
            </form>

            <div className="flex flex-col items-center justify-center pt-4 border-t border-neutral-100 dark:border-neutral-850">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                — Already have an account? —
              </span>
              <Link href="/login" className="mt-2 text-xs font-bold text-primary-500 hover:text-primary-600 transition-colors">
                Login to see all your orders
              </Link>
            </div>
          </div>
        )}

        {/* TIMELINE DISPLAY */}
        <AnimatePresence mode="wait">
          {isSearching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature shadow-sm"
            >
              <Loader2 className="w-9 h-9 animate-spin text-primary-500 mb-3" />
              <p className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest animate-pulse">
                Retrieving tracking information...
              </p>
            </motion.div>
          )}

          {trackingResult && !isSearching && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Order Status Timeline Dashboard Card */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 sm:p-8 shadow-md space-y-8">
                
                {/* Meta details header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-5">
                  <div className="space-y-1">
                    <h3 className="text-base font-black text-neutral-900 dark:text-white">
                      Order {trackingResult.orderId}
                    </h3>
                    <p className="text-[11px] font-bold text-neutral-500">
                      Placed on: <span className="text-neutral-850 dark:text-neutral-300">{trackingResult.steps[0].time.split(',')[0]}</span>
                    </p>
                  </div>

                  <div className="bg-primary-500/5 dark:bg-primary-500/10 border border-primary-500/15 rounded-card px-4 py-2.5 text-right">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Expected Delivery</span>
                    <span className="text-xs sm:text-sm font-black text-primary-600 dark:text-primary-400">
                      {currentLang === 'ta' ? trackingResult.estDeliveryTamil : trackingResult.estDelivery}
                    </span>
                  </div>
                </div>

                {/* Cancelled / Returned Special Messages */}
                {trackingResult.currentStep === -1 && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-card flex items-center gap-3 text-red-800 dark:text-red-400">
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider">This Order Was Cancelled</h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">We processed a refund or cancelled this order at your request.</p>
                    </div>
                  </div>
                )}
                {trackingResult.currentStep === -2 && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 rounded-card flex items-center gap-3 text-purple-800 dark:text-purple-400">
                    <RotateCcw className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider">This Order Was Returned</h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">The items were returned and the return status is closed.</p>
                    </div>
                  </div>
                )}

                {/* Custom status timeline track */}
                <div className="relative pl-10 space-y-8 select-none">
                  
                  {/* Vertical Track lines */}
                  {trackingResult.currentStep >= 0 && (
                    <div className="absolute left-[17px] top-3.5 bottom-3.5 w-1 bg-neutral-200 dark:bg-neutral-850 rounded-full">
                      {/* Completed track progress overlay */}
                      <div 
                        className="w-full bg-primary-500 rounded-full transition-all duration-slow" 
                        style={{ 
                          height: `${(Math.min(trackingResult.currentStep, 5) / 5) * 100}%` 
                        }}
                      />
                    </div>
                  )}

                  {/* Render steps */}
                  {trackingResult.steps.map((step, idx) => {
                    const style = getTimelineStepStyle(idx, trackingResult.currentStep);
                    
                    return (
                      <div key={idx} className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        
                        {/* Dot container */}
                        <div className="absolute -left-[35px] top-0 flex items-center justify-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white dark:border-neutral-900 shadow-sm transition-all duration-normal ${style.bg} ${style.borderColor}`}>
                            {getTimelineIcon(step.status, style)}
                          </div>
                        </div>

                        {/* Title & Desc details */}
                        <div className="space-y-1">
                          <h4 className={`text-sm font-bold leading-tight ${style.color}`}>
                            {currentLang === 'ta' ? step.titleTamil : step.title}
                          </h4>
                          <p className={`text-xs font-semibold leading-relaxed ${
                            style.active 
                              ? 'text-neutral-805 dark:text-neutral-200' 
                              : style.completed 
                              ? 'text-neutral-505 dark:text-neutral-400' 
                              : 'text-neutral-400'
                          }`}>
                            {currentLang === 'ta' ? step.descTamil : step.desc}
                          </p>

                          {/* Courier tracking helper */}
                          {step.status === 'shipped' && idx <= trackingResult.currentStep && trackingResult.currentStep >= 3 && (
                            <div className="mt-3 flex flex-wrap items-center gap-3">
                              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                                Courier: {trackingResult.carrierName}
                              </span>
                              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                                Tracking: {trackingResult.trackingNo}
                              </span>
                              <a
                                href="https://www.delhivery.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-primary-500 hover:text-primary-600 inline-flex items-center gap-1 cursor-pointer"
                              >
                                {t('track.courier_link', 'Track on Courier Site')}
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Timestamp */}
                        <div className="sm:text-right whitespace-nowrap self-start">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-card ${
                            style.active 
                              ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold' 
                              : style.completed 
                              ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500' 
                              : 'text-neutral-400/50'
                          }`}>
                            {currentLang === 'ta' ? step.timeTamil : step.time}
                          </span>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items In This Order Card */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 sm:p-8 shadow-sm space-y-5">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider border-b border-neutral-50 dark:border-neutral-850 pb-3">
                  {t('track.items_title', 'Items In This Order')}
                </h3>
                
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {trackingResult.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-12 h-12 bg-neutral-50 dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-800 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-neutral-900 dark:text-white">
                            {item.name}
                          </h4>
                          <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-450 block mt-0.5">
                            ₹{item.price} per {item.unit} &bull; Qty: {item.quantity}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-neutral-900 dark:text-white">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address and Actions Card */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider border-b border-neutral-50 dark:border-neutral-850 pb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    {t('track.delivery_address', 'Delivery Address')}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-350 mt-3 font-medium leading-relaxed">
                    {trackingResult.address}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3.5 pt-4 border-t border-neutral-100 dark:border-neutral-850">
                  <Link 
                    href={`/account/orders/${trackingResult.orderId.replace('#', '')}/invoice`}
                    className="flex-1 min-w-[140px]"
                  >
                    <Button
                      variant="secondary"
                      size="md"
                      className="w-full font-bold text-xs py-2.5 border border-neutral-200 dark:border-neutral-750"
                      leftIcon={<FileText className="w-4 h-4 text-primary-500" />}
                    >
                      {t('track.download_invoice', 'Download Invoice 📄')}
                    </Button>
                  </Link>

                  <Link 
                    href="/contact"
                    className="flex-1 min-w-[140px]"
                  >
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full font-bold text-xs py-2.5"
                      leftIcon={<MessageSquare className="w-4 h-4" />}
                    >
                      {t('contact.title', 'Need Help? 💬')}
                    </Button>
                  </Link>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
