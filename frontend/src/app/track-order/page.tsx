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
  Check, 
  Loader2,
  Package,
  ClipboardList,
  Home,
  XCircle,
  RotateCcw,
  Smartphone,
  ChevronDown,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/services/api-client';
import { accountService, CustomerOrder } from '@/services/account.service';

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
  currentStep: number;
  steps: TrackingStep[];
  address: string;
  items: OrderItem[];
  grandTotal: number;
}

export default function TrackOrderPage() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const { isLoggedIn, user } = useAuthStore();

  // Guest Phone OTP States
  const [mobileInput, setMobileInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);
  const [isSearching, setIsSearching] = useState(false);

  // Result States
  const [fetchedOrders, setFetchedOrders] = useState<any[]>([]);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const [activeTracking, setActiveTracking] = useState<TrackingData | null>(null);

  // Logged-in Customer orders
  const [userOrders, setUserOrders] = useState<CustomerOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');

  // OTP Countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOtpSent && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, otpTimer]);

  // Load orders for logged-in user from backend database
  useEffect(() => {
    if (isLoggedIn) {
      accountService
        .getOrders()
        .then((orders) => {
          setUserOrders(orders);
          if (orders.length > 0) {
            const firstId = orders[0].id || orders[0].orderNumber;
            setSelectedOrderId(firstId);
            setActiveTracking(formatOrderToTrackingData(orders[0]));
          }
        })
        .catch((err) => {
          console.error("Failed to load customer orders:", err);
        });
    }
  }, [isLoggedIn]);

  // Transform backend order object into visual timeline TrackingData
  const formatOrderToTrackingData = (order: any): TrackingData => {
    const rawStatus = (order.status || 'CONFIRMED').toUpperCase();
    let currentStep = 1;
    let statusLabel = 'Confirmed';

    if (rawStatus === 'PENDING_PAYMENT' || rawStatus === 'DRAFT') {
      currentStep = 0;
      statusLabel = 'Placed';
    } else if (rawStatus === 'PAYMENT_VERIFIED' || rawStatus === 'CONFIRMED') {
      currentStep = 1;
      statusLabel = 'Confirmed';
    } else if (rawStatus === 'PACKED') {
      currentStep = 2;
      statusLabel = 'Packed';
    } else if (rawStatus === 'SHIPPED') {
      currentStep = 3;
      statusLabel = 'Shipped';
    } else if (rawStatus === 'OUT_FOR_DELIVERY') {
      currentStep = 4;
      statusLabel = 'Out for Delivery';
    } else if (rawStatus === 'DELIVERED') {
      currentStep = 5;
      statusLabel = 'Delivered';
    } else if (rawStatus === 'CANCELLED') {
      currentStep = -1;
      statusLabel = 'Cancelled';
    } else if (rawStatus === 'RETURNED') {
      currentStep = -2;
      statusLabel = 'Returned';
    }

    const orderDate = order.orderedAt || order.createdAt
      ? new Date(order.orderedAt || order.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'Recently';

    const steps: TrackingStep[] = [
      {
        title: 'Order Placed',
        titleTamil: 'ஆர்டர் செய்யப்பட்டது',
        desc: 'Your order was received successfully',
        descTamil: 'உங்கள் ஆர்டர் வெற்றிகரமாக பெறப்பட்டது',
        time: `${orderDate}`,
        timeTamil: `${orderDate}`,
        status: 'placed',
      },
      {
        title: 'Order Confirmed',
        titleTamil: 'ஆர்டர் உறுதி செய்யப்பட்டது',
        desc: 'Order verified & sent to organic fulfillment center',
        descTamil: 'ஆர்டர் சரிபார்க்கப்பட்டு அனுப்ப தயாராகிறது',
        time: `${orderDate}`,
        timeTamil: `${orderDate}`,
        status: 'confirmed',
      },
      {
        title: 'Packed & Quality Checked',
        titleTamil: 'பேக் செய்யப்பட்டு தயாராக உள்ளது',
        desc: 'Items carefully packed in eco-friendly packaging',
        descTamil: 'பொருட்கள் ஆய்வு செய்யப்பட்டு பேக் செய்யப்பட்டுள்ளது',
        time: 'Within 24 Hours',
        timeTamil: '24 மணி நேரத்திற்குள்',
        status: 'packed',
      },
      {
        title: 'Shipped',
        titleTamil: 'அனுப்பப்பட்டது',
        desc: `In transit via courier partner ${order.carrierName || 'Delhivery'}`,
        descTamil: `கூரியர் நிறுவனம் ${order.carrierName || 'Delhivery'} மூலம் அனுப்பப்பட்டது`,
        time: 'In transit',
        timeTamil: 'வழியில் உள்ளது',
        status: 'shipped',
      },
      {
        title: 'Out for Delivery',
        titleTamil: 'டெலிவரிக்கு வெளியேறியது',
        desc: 'Courier associate will contact you on delivery day',
        descTamil: 'டெலிவரி முகவர் உங்களை தொடர்பு கொள்வார்',
        time: 'Expected Soon',
        timeTamil: 'விரைவில் எதிர்பார்க்கப்படுகிறது',
        status: 'out_for_delivery',
      },
      {
        title: 'Delivered',
        titleTamil: 'டெலிவரி செய்யப்பட்டது',
        desc: 'Parcel safely delivered to your doorstep',
        descTamil: 'பார்சல் வாடிக்கையாளரிடம் ஒப்படைக்கப்பட்டது',
        time: 'Delivered',
        timeTamil: 'டெலிவரி செய்யப்பட்டது',
        status: 'delivered',
      },
    ];

    const rawItems = order.items || order.orderItems || [];
    const items: OrderItem[] = rawItems.map((item: any) => ({
      productId: item.id || item.productId || 'p1',
      name: item.name || item.productName || 'Organic Product',
      price: Number(item.price || item.unitPrice || 0),
      quantity: Number(item.quantity || 1),
      unit: item.sku || '1 pack',
      image:
        item.image ||
        item.variant?.product?.thumbnailUrl ||
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=200&auto=format&fit=crop',
    }));

    let formattedAddress = 'Delivery Address';
    if (order.deliveryAddress) {
      formattedAddress = order.deliveryAddress;
    } else if (order.address) {
      formattedAddress = `${order.address.fullName}, ${order.address.addressLine1}, ${order.address.city} - ${order.address.postalCode}`;
    }

    return {
      orderId: order.orderNumber || order.id,
      phone: order.address?.phone || '',
      status: statusLabel,
      estDelivery: '3-5 Business Days',
      estDeliveryTamil: '3-5 வேலை நாட்கள்',
      carrierName: order.carrierName || 'Delhivery',
      trackingNo: order.trackingNumber || `DEL-${(order.orderNumber || '0000').replace(/\D/g, '')}`,
      currentStep,
      steps,
      address: formattedAddress,
      items,
      grandTotal: Number(order.grandTotal || 0),
    };
  };

  // 1. Send OTP to Guest Mobile Number
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobileInput.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      toast.warning('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsOtpSending(true);
    try {
      const res = await apiClient.post('/auth/otp/send', {
        phone: cleanMobile,
        purpose: 'ORDER_TRACKING',
      });

      if (res.success) {
        setIsOtpSent(true);
        setOtpTimer(30);
        if ((res as any).devOtp) {
          toast.info(`Test OTP: ${(res as any).devOtp}`);
        } else {
          toast.success(`OTP sent to +91 ${cleanMobile}`);
        }
      } else {
        toast.error(res.message || 'Failed to send OTP.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send verification SMS.');
    } finally {
      setIsOtpSending(false);
    }
  };

  // 2. Verify OTP and Fetch Orders for this Mobile Number
  const handleVerifyOtpAndTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobileInput.replace(/\D/g, '').slice(-10);
    if (otpInput.length !== 6) {
      toast.warning('Please enter the 6-digit OTP code.');
      return;
    }

    setIsSearching(true);
    try {
      const res = await apiClient.post('/user/orders/track-by-otp', {
        phone: cleanMobile,
        otp: otpInput,
      });

      if (res.success && res.data?.orders) {
        const orders = res.data.orders;
        setFetchedOrders(orders);

        if (orders.length === 0) {
          toast.info(`No orders found associated with +91 ${cleanMobile}.`);
          setActiveTracking(null);
        } else {
          toast.success(`Found ${orders.length} order(s)!`);
          setSelectedOrderIndex(0);
          setActiveTracking(formatOrderToTrackingData(orders[0]));
        }
      } else {
        toast.error(res.message || 'Failed to retrieve orders.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Invalid OTP code. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Switch between orders if multiple orders exist
  const handleSelectOrderTab = (index: number) => {
    setSelectedOrderIndex(index);
    setActiveTracking(formatOrderToTrackingData(fetchedOrders[index]));
  };

  // Logged-in order selection
  const handleSelectLoggedInOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    const found = userOrders.find((o) => (o.orderNumber || o.id) === orderId);
    if (found) {
      setActiveTracking(formatOrderToTrackingData(found));
    }
  };

  // Timeline Styling
  const getTimelineStepStyle = (idx: number, currentStep: number) => {
    if (currentStep === -1) {
      return {
        color: 'text-red-500',
        borderColor: 'border-red-200 dark:border-red-900',
        bg: 'bg-red-500/15',
        completed: false,
        active: idx === 0,
        pending: idx > 0,
      };
    }
    if (currentStep === -2) {
      return {
        color: 'text-purple-500',
        borderColor: 'border-purple-200 dark:border-purple-900',
        bg: 'bg-purple-500/15',
        completed: false,
        active: idx === 0,
        pending: idx > 0,
      };
    }

    const isCompleted = idx < currentStep;
    const isActive = idx === currentStep;
    const isPending = idx > currentStep;

    let color = 'text-neutral-400';
    let bg = 'bg-neutral-100 dark:bg-neutral-800';
    let borderColor = 'border-neutral-200 dark:border-neutral-800';

    if (isCompleted) {
      color = 'text-primary-600 dark:text-primary-400';
      bg = 'bg-primary-500 text-white';
      borderColor = 'border-primary-500';
    } else if (isActive) {
      color = 'text-primary-600 dark:text-primary-400 font-bold';
      bg = 'bg-primary-500 text-white animate-pulse';
      borderColor = 'border-primary-500 ring-4 ring-primary-500/20';
    }

    return { color, bg, borderColor, completed: isCompleted, active: isActive, pending: isPending };
  };

  const getTimelineIcon = (status: string, style: any) => {
    const iconClass = `w-4 h-4 ${style.active || style.completed ? 'text-white' : 'text-neutral-400'}`;
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
              {t('track.title', 'Track Orders')}
            </span>
          </nav>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-10 text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-3">
          <div className="inline-flex p-3 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-full mb-1">
            <Truck className="w-7 h-7" />
          </div>
          <h1 className="text-2.5xl sm:text-3.5xl font-black font-heading text-neutral-900 dark:text-white tracking-tight">
            Track Your Orders
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
            Enter your mobile number to view shipment status, delivery timeline, and courier details via secure SMS OTP.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8 space-y-6">
        {/* LOGGED-IN CUSTOMER VIEW */}
        {isLoggedIn ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 sm:p-7 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Select Order to Track
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Logged in as <span className="font-bold text-primary-500">{user?.name || user?.email}</span>
              </p>
            </div>

            {userOrders.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-card space-y-3">
                <AlertTriangle className="w-8 h-8 text-neutral-400 mx-auto" />
                <p className="text-xs text-neutral-500">
                  No orders found in your account history yet.
                </p>
                <Link href="/shop" className="inline-block">
                  <Button variant="primary" size="sm" className="font-bold text-[11px]">
                    Browse Products
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block">
                  Your Recent Orders
                </label>
                <div className="relative">
                  <select
                    value={selectedOrderId}
                    onChange={(e) => handleSelectLoggedInOrder(e.target.value)}
                    className="appearance-none w-full text-xs font-bold px-4 py-3 border border-neutral-200 dark:border-neutral-750 bg-transparent rounded-card text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                  >
                    {userOrders.map((o) => (
                      <option key={o.id} value={o.orderNumber || o.id}>
                        Order #{o.orderNumber || o.id} — ₹{o.grandTotal} ({o.status})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* GUEST / UNREGISTERED CUSTOMER OTP FORM */
          <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 sm:p-8 shadow-sm space-y-5">
            <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary-500" />
                  Guest Order Tracking
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Verify your phone with SMS OTP to track your orders securely without logging in.
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" />
                Safe & Private
              </span>
            </div>

            {/* Step 1: Request OTP */}
            {!isOtpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    Mobile Number *
                  </label>
                  <div className="flex gap-2.5">
                    <div className="flex items-center px-3 border border-neutral-250 dark:border-neutral-700 rounded-card bg-neutral-50 dark:bg-neutral-800 text-xs font-bold text-neutral-600 dark:text-neutral-400">
                      +91
                    </div>
                    <input
                      type="tel"
                      required
                      value={mobileInput}
                      onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit mobile used while buying"
                      maxLength={10}
                      className="flex-1 text-xs font-semibold px-4 py-3 border border-neutral-250 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isOtpSending || mobileInput.length !== 10}
                  className="w-full font-bold text-xs py-3"
                  leftIcon={isOtpSending ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                >
                  {isOtpSending ? 'Sending SMS OTP...' : 'Send SMS Verification Code 📲'}
                </Button>
              </form>
            ) : (
              /* Step 2: Verify OTP */
              <form onSubmit={handleVerifyOtpAndTrack} className="space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between bg-primary-500/5 p-3 rounded-card border border-primary-500/20">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    OTP sent to: <strong>+91 {mobileInput}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpSent(false);
                      setOtpInput('');
                    }}
                    className="text-[11px] font-bold text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Change Number
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                      Enter 6-Digit OTP Code *
                    </label>
                    <button
                      type="button"
                      disabled={otpTimer > 0 || isOtpSending}
                      onClick={handleSendOtp}
                      className="text-[11px] font-bold text-primary-500 disabled:text-neutral-400 hover:underline flex items-center gap-1"
                    >
                      <Clock className="w-3 h-3" />
                      {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend Code'}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit code (e.g. 123456)"
                    className="w-full text-center text-base font-bold tracking-widest px-4 py-3 border border-primary-400 dark:border-primary-800 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSearching || otpInput.length !== 6}
                  className="w-full font-bold text-xs py-3"
                  leftIcon={isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                >
                  {isSearching ? 'Verifying & Loading Orders...' : 'Verify & Track Orders 🔍'}
                </Button>
              </form>
            )}

            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 text-center">
              <Link href="/login" className="text-xs font-bold text-neutral-500 hover:text-primary-500 transition-colors">
                Already have a registered account? Sign In &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* ORDER SELECTOR TABS (If guest has multiple orders) */}
        {!isLoggedIn && fetchedOrders.length > 1 && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
              Found {fetchedOrders.length} orders for +91 {mobileInput}:
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {fetchedOrders.map((o, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOrderTab(idx)}
                  className={`px-3.5 py-2 rounded-card text-xs font-bold whitespace-nowrap transition-all ${
                    selectedOrderIndex === idx
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-primary-500'
                  }`}
                >
                  Order #{o.orderNumber || o.id} (₹{o.grandTotal})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TIMELINE DASHBOARD */}
        <AnimatePresence mode="wait">
          {activeTracking && !isSearching && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Order Status Timeline Card */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 sm:p-8 shadow-sm space-y-8">
                {/* Meta Details Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-neutral-900 dark:text-white">
                        Order #{activeTracking.orderId}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400">
                        {activeTracking.status}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-neutral-500">
                      Placed on: <span className="text-neutral-800 dark:text-neutral-200 font-bold">{activeTracking.steps[0].time}</span>
                    </p>
                  </div>

                  <div className="bg-primary-500/5 dark:bg-primary-500/10 border border-primary-500/20 rounded-card px-4 py-2.5 text-right">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">Expected Delivery</span>
                    <span className="text-xs sm:text-sm font-black text-primary-600 dark:text-primary-400">
                      {currentLang === 'ta' ? activeTracking.estDeliveryTamil : activeTracking.estDelivery}
                    </span>
                  </div>
                </div>

                {/* Cancelled / Returned Notices */}
                {activeTracking.currentStep === -1 && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-card flex items-center gap-3 text-red-800 dark:text-red-400">
                    <XCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider">This Order Was Cancelled</h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">This order has been cancelled.</p>
                    </div>
                  </div>
                )}

                {/* Vertical Timeline Track */}
                <div className="relative pl-10 space-y-8 select-none">
                  {/* Progress Line */}
                  {activeTracking.currentStep >= 0 && (
                    <div className="absolute left-[17px] top-3.5 bottom-3.5 w-1 bg-neutral-200 dark:bg-neutral-800 rounded-full">
                      <div
                        className="w-full bg-primary-500 rounded-full transition-all duration-slow"
                        style={{
                          height: `${(Math.min(activeTracking.currentStep, 5) / 5) * 100}%`,
                        }}
                      />
                    </div>
                  )}

                  {activeTracking.steps.map((step, idx) => {
                    const style = getTimelineStepStyle(idx, activeTracking.currentStep);
                    return (
                      <div key={idx} className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        {/* Circle Indicator */}
                        <div className="absolute -left-[35px] top-0 flex items-center justify-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white dark:border-neutral-900 shadow-sm transition-all duration-normal ${style.bg} ${style.borderColor}`}>
                            {getTimelineIcon(step.status, style)}
                          </div>
                        </div>

                        {/* Step Description */}
                        <div className="space-y-1">
                          <h4 className={`text-sm font-bold leading-tight ${style.color}`}>
                            {currentLang === 'ta' ? step.titleTamil : step.title}
                          </h4>
                          <p className={`text-xs font-semibold leading-relaxed ${style.active ? 'text-neutral-900 dark:text-white' : style.completed ? 'text-neutral-600 dark:text-neutral-400' : 'text-neutral-400'}`}>
                            {currentLang === 'ta' ? step.descTamil : step.desc}
                          </p>

                          {step.status === 'shipped' && idx <= activeTracking.currentStep && activeTracking.currentStep >= 3 && (
                            <div className="mt-2.5 flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                                Courier: {activeTracking.carrierName}
                              </span>
                              <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                                Tracking: {activeTracking.trackingNo}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Timestamp badge */}
                        <div className="sm:text-right whitespace-nowrap self-start">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-card ${style.active ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold' : style.completed ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500' : 'text-neutral-400/50'}`}>
                            {currentLang === 'ta' ? step.timeTamil : step.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                    Ordered Products ({activeTracking.items.length})
                  </h3>
                  <span className="text-xs font-black text-primary-600 dark:text-primary-400">
                    Total: ₹{activeTracking.grandTotal}
                  </span>
                </div>

                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {activeTracking.items.map((item, idx) => (
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
                          <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 block mt-0.5">
                            ₹{item.price} &bull; Qty: {item.quantity}
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

              {/* Delivery Address Card */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 sm:p-8 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-800 pb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  Shipping Destination
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed">
                  {activeTracking.address}
                </p>

                {/* Privacy Badge for Guest Mode */}
                {!isLoggedIn && (
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-1.5 text-[11px] text-neutral-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Viewing in guest read-only tracking mode. Your profile remains protected.</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
