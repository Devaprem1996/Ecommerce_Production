"use client";

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useParams, useRouter } from 'next/navigation';
import { mockProducts } from '@/constants/mockData';
import { formatPrice } from '@/utils/formatPrice';
import { 
  ArrowLeft, 
  Printer, 
  Truck, 
  MapPin, 
  CreditCard, 
  HelpCircle, 
  Check, 
  Loader2,
  Calendar,
  AlertCircle,
  Copy,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/Toast';
import { motion } from 'framer-motion';

// Timeline definition
const TIMELINE_STEPS = [
  { key: 'ordered', label: 'Ordered', desc: 'Order received & pending verification' },
  { key: 'confirmed', label: 'Confirmed', desc: 'Payment verified & order approved' },
  { key: 'packed', label: 'Packed', desc: 'Items packed in eco-friendly wraps' },
  { key: 'shipped', label: 'Shipped', desc: 'Dispatched via our logistics partner' },
  { key: 'delivered', label: 'Delivered', desc: 'Handed over to customer' }
];

export default function OrderDetailPage() {
  const { user } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  // Load specific order from localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !orderId) return;

    const storedOrders = localStorage.getItem('user_orders');
    if (storedOrders) {
      const ordersList = JSON.parse(storedOrders);
      const foundOrder = ordersList.find((o: any) => o.id === orderId);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    }
    setLoading(false);
  }, [orderId]);

  if (loading) {
    return (
      <div className="text-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin mx-auto" />
        <p className="text-xs font-bold text-neutral-450 uppercase tracking-widest">
          Loading order details...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16 px-4 bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-150 dark:border-neutral-850 rounded-feature space-y-6">
        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Order Not Found</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-450 max-w-xs mx-auto">
            The requested order ID does not exist or has been deleted from your account.
          </p>
        </div>
        <Link href="/account/orders" className="inline-block">
          <button className="flex items-center space-x-1.5 px-4 py-2 border border-neutral-300 dark:border-neutral-700 bg-transparent text-xs font-bold text-neutral-700 dark:text-neutral-300 rounded-card hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </button>
        </Link>
      </div>
    );
  }

  // Determine current timeline index
  const getTimelineIndex = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 0; // Ordered
      case 'processing':
        return 2; // Packed (includes Confirmed)
      case 'shipped':
        return 3; // Shipped
      case 'delivered':
        return 4; // Delivered
      case 'cancelled':
      default:
        return -1; // Special check
    }
  };

  const currentStepIndex = getTimelineIndex(order.status);
  const isCancelled = order.status.toLowerCase() === 'cancelled';

  // Action: Print Invoice
  const handlePrintInvoice = () => {
    window.print();
  };

  // Action: Copy tracking number
  const handleCopyTracking = () => {
    if (order.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber);
      setIsCopied(true);
      toast.success('Tracking number copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  // Action: Request return
  const handleReturnRequest = () => {
    toast.success('Return request submitted! An agent will contact you shortly to coordinate.');
  };

  return (
    <div className="space-y-8 print:p-0 print:border-none">
      
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4 print:hidden">
        <Link 
          href="/account/orders" 
          className="text-xs font-bold text-neutral-450 hover:text-primary-500 transition-colors flex items-center gap-1.5 select-none"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
        </Link>
        
        <div className="flex items-center gap-2">
          {/* Download/Print Invoice */}
          <button
            onClick={handlePrintInvoice}
            className="flex items-center space-x-1.5 px-3.5 py-2 border border-neutral-250 hover:border-primary-500/30 dark:border-neutral-750 bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-750 dark:text-neutral-300 rounded-card hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>

          {/* Return Request (if delivered) */}
          {order.status.toLowerCase() === 'delivered' && (
            <button
              onClick={handleReturnRequest}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-primary-500 hover:bg-primary-600 border-none text-xs font-bold text-white rounded-card cursor-pointer shadow-sm"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Return / Refund</span>
            </button>
          )}
        </div>
      </div>

      {/* Invoice Layout Header (Always shown, clean print format) */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-6">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block select-none">
            AETHER ORGANIC ORDER DETAILS
          </span>
          <h2 className="text-xl font-black font-heading text-neutral-900 dark:text-white">
            Order #{order.id}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-450 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>Placed on: {order.date}</span>
          </div>
        </div>
        <div className="text-left sm:text-right space-y-1">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block select-none">
            ORDER STATUS
          </span>
          <div className="inline-block">
            {isCancelled ? (
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-wide">
                Cancelled
              </span>
            ) : order.status.toLowerCase() === 'delivered' ? (
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-500/10 text-green-500 border border-green-500/20 uppercase tracking-wide">
                Delivered
              </span>
            ) : (
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-primary-500/10 text-primary-500 border border-primary-500/20 uppercase tracking-wide">
                {order.status}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      {!isCancelled && (
        <div id="tracker" className="bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 sm:p-8 space-y-6 print:hidden">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2 select-none">
            <Truck className="w-4 h-4 text-primary-500 animate-bounce" /> Shipment Tracker
          </h3>
          
          {/* Desktop Timeline */}
          <div className="relative flex justify-between select-none">
            {/* Progress line */}
            <div className="absolute top-[18px] left-[5%] right-[5%] h-1 bg-neutral-200 dark:bg-neutral-800 z-0">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(currentStepIndex / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                className="h-full bg-success"
                transition={{ duration: 0.6 }}
              />
            </div>

            {TIMELINE_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const isPending = idx > currentStepIndex;
              
              return (
                <div key={step.key} className="flex flex-col items-center text-center w-[16%] relative z-10">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border font-bold text-xs transition-colors ${
                    isCompleted 
                      ? 'bg-success text-white border-success' 
                      : isCurrent 
                        ? 'bg-white dark:bg-neutral-900 border-primary-500 text-primary-500 ring-4 ring-primary-500/10' 
                        : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-400'
                  }`}>
                    {isCompleted ? <Check className="w-4.5 h-4.5 stroke-[3px]" /> : <span>{idx + 1}</span>}
                  </div>
                  <h4 className={`text-xs font-bold mt-2.5 ${isCurrent ? 'text-primary-500' : 'text-neutral-700 dark:text-neutral-300'}`}>
                    {step.label}
                  </h4>
                  <p className="text-[9px] font-medium text-neutral-500 dark:text-neutral-450 mt-1 hidden sm:block leading-tight">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Courier Details (if Shipped/Processing) */}
          {order.trackingNumber && (
            <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-neutral-550 shrink-0" />
                <span className="font-semibold text-neutral-600 dark:text-neutral-400">
                  Shipped via <span className="font-bold text-neutral-900 dark:text-white">{order.courier || 'Logistics Partner'}</span>
                </span>
                <span className="text-neutral-400">&bull;</span>
                <span className="font-bold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded border border-neutral-200/50">
                  {order.trackingNumber}
                </span>
              </div>
              <button
                onClick={handleCopyTracking}
                className="flex items-center space-x-1.5 px-3 py-1.5 border border-neutral-300 dark:border-neutral-750 bg-white dark:bg-neutral-850 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-[10px] font-bold text-neutral-700 dark:text-neutral-300 rounded cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Items Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-neutral-900 dark:text-white select-none">
          Ordered Items
        </h3>
        
        <div className="border border-neutral-150 dark:border-neutral-800 rounded-feature overflow-hidden bg-white dark:bg-neutral-900 shadow-sm">
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {order.items.map((item: any, idx: number) => {
              const product = mockProducts.find((p) => p.id === item.productId);
              if (!product) return null;
              return (
                <div key={idx} className="flex items-center space-x-4 p-5 text-xs sm:text-sm">
                  <div className="relative w-14 h-14 bg-neutral-100 dark:bg-neutral-850 rounded-feature overflow-hidden shrink-0 border border-neutral-200/50">
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-neutral-900 dark:text-white truncate">
                      {product.name}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-450 font-semibold mt-0.5">
                      Price: {formatPrice(item.price)} &bull; Unit: {product.unit}
                    </p>
                  </div>
                  <div className="font-bold text-neutral-500 dark:text-neutral-400 select-none text-center">
                    x{item.quantity}
                  </div>
                  <div className="font-bold text-neutral-900 dark:text-white w-20 text-right">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing totals */}
          <div className="bg-neutral-50 dark:bg-neutral-950/20 p-5 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-xs font-semibold text-neutral-600 dark:text-neutral-450">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-neutral-900 dark:text-white font-bold">{formatPrice(order.total - 40)}</span>
              </div>
              <div className="flex justify-between">
                <span>Eco-Friendly Delivery Charge</span>
                <span className="text-neutral-900 dark:text-white font-bold">{formatPrice(40)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-neutral-200 dark:border-neutral-850 pt-2 font-black text-neutral-900 dark:text-white">
                <span>Grand Total</span>
                <span className="text-primary-750 dark:text-primary-400">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address & Payment Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Delivery Address Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-feature p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2.5 select-none">
            <MapPin className="w-4 h-4 text-primary-500" /> Delivery Address
          </h3>
          <div className="text-xs space-y-1.5 text-neutral-700 dark:text-neutral-350 font-semibold">
            <h4 className="font-bold text-neutral-900 dark:text-white">
              {order.shippingAddress?.name || user?.name || 'Customer Name'}
            </h4>
            <p>{order.shippingAddress?.street || '12, Green Meadow Avenue, Alwarpet'}</p>
            <p>{order.shippingAddress?.city || 'Chennai'}, {order.shippingAddress?.state || 'Tamil Nadu'} - {order.shippingAddress?.pincode || '600018'}</p>
            <p className="pt-2 text-neutral-500 font-medium">
              Phone: {order.shippingAddress?.mobile || order.mobile || user?.mobile || 'N/A'}
            </p>
          </div>
        </div>

        {/* Payment Summary Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-feature p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2.5 select-none">
            <CreditCard className="w-4 h-4 text-primary-500" /> Payment Summary
          </h3>
          <div className="text-xs space-y-2 text-neutral-700 dark:text-neutral-355 font-semibold">
            <div className="flex justify-between">
              <span>Payment Channel:</span>
              <span className="font-bold text-neutral-900 dark:text-white uppercase">
                {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment (UPI/Card)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Receipt Status:</span>
              <span>
                {order.paymentStatus === 'paid' ? (
                  <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-550 border border-green-500/15 text-[10px] font-bold uppercase tracking-wider">
                    Paid
                  </span>
                ) : order.paymentStatus === 'failed' ? (
                  <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/15 text-[10px] font-bold uppercase tracking-wider">
                    Failed
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-550 border border-yellow-500/15 text-[10px] font-bold uppercase tracking-wider">
                    Pending
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 font-bold text-neutral-900 dark:text-white">
              <span>Settled Amount:</span>
              <span className="text-primary-750 dark:text-primary-400 font-black">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
