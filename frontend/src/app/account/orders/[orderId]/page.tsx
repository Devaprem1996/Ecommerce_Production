"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatPrice } from '@/utils/formatPrice';
import { accountService, CustomerOrder } from '@/services/account.service';
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
  Info,
  XCircle,
  AlertTriangle,
  X,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/Toast';
import { motion } from 'framer-motion';

// Timeline definition
const TIMELINE_STEPS = [
  { key: 'pending', label: 'Ordered', desc: 'Order received & pending verification' },
  { key: 'confirmed', label: 'Confirmed', desc: 'Payment verified & order approved' },
  { key: 'packed', label: 'Packed', desc: 'Items packed in eco-friendly wraps' },
  { key: 'shipped', label: 'Shipped', desc: 'Dispatched via our logistics partner' },
  { key: 'delivered', label: 'Delivered', desc: 'Handed over to customer' }
];

const CANCELLATION_REASONS = [
  'Ordered by mistake',
  'Found a better price or alternative elsewhere',
  'Incorrect delivery address or contact number',
  'Delivery time is too long',
  'Item no longer needed',
  'Other reason',
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  // Cancellation modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>(CANCELLATION_REASONS[0]);
  const [customReasonNote, setCustomReasonNote] = useState<string>('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const data = await accountService.getOrderById(orderId);
      setOrder(data);
    } catch (err: any) {
      console.error('Failed to load order:', err);
      // Fallback: check localStorage for legacy demo orders
      if (typeof window !== 'undefined') {
        const storedOrders = localStorage.getItem('user_orders');
        if (storedOrders) {
          try {
            const list = JSON.parse(storedOrders);
            const found = list.find((o: any) => o.id === orderId);
            if (found) {
              setOrder(found);
              return;
            }
          } catch (_) {}
        }
      }
      toast.error(err?.message || 'Could not load order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Determine current timeline index
  const getTimelineIndex = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'PENDING' || s === 'PENDING_PAYMENT' || s === 'DRAFT') return 0;
    if (s === 'CONFIRMED' || s === 'PAYMENT_VERIFIED') return 1;
    if (s === 'PACKED' || s === 'PROCESSING') return 2;
    if (s === 'SHIPPED' || s === 'OUT_FOR_DELIVERY') return 3;
    if (s === 'DELIVERED') return 4;
    return -1;
  };

  // Action: Confirm Cancellation
  const handleConfirmCancel = async () => {
    if (!order) return;
    const finalReason = selectedReason === 'Other reason' && customReasonNote.trim()
      ? customReasonNote.trim()
      : selectedReason;

    setIsSubmittingCancel(true);
    try {
      await accountService.cancelOrder(order.id, finalReason);
      toast.success('Order has been cancelled successfully.');
      setShowCancelModal(false);
      await fetchOrder();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to cancel order.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // Action: Print Invoice
  const handlePrintInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="text-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
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
            The requested order ID does not exist or you do not have permission to view it.
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

  const upperStatus = (order.status || '').toUpperCase();
  const isCancelled = upperStatus === 'CANCELLED';
  const isRefunded = upperStatus === 'REFUNDED';
  const isCancellable = ['DRAFT', 'PENDING', 'PENDING_PAYMENT', 'CONFIRMED', 'PAYMENT_VERIFIED'].includes(upperStatus);
  const currentStepIndex = getTimelineIndex(upperStatus);

  const capturedPayment = order.payments?.find(
    (p) =>
      (p.provider === 'razorpay' || p.provider === 'online') &&
      (p.status.toUpperCase() === 'SUCCESSFUL' || p.status.toUpperCase() === 'CAPTURED')
  );

  const refundedPayment = order.payments?.find(
    (p) => p.status.toUpperCase() === 'REFUNDED'
  );

  const orderDateFormatted = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

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
          {/* Cancel Order Action */}
          {isCancellable && (
            <button
              onClick={() => {
                setShowCancelModal(true);
                setSelectedReason(CANCELLATION_REASONS[0]);
                setCustomReasonNote('');
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 border border-red-200 hover:border-red-300 dark:border-red-950 bg-red-500/5 hover:bg-red-500/10 text-xs font-bold text-red-500 rounded-card transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Order</span>
            </button>
          )}

          {/* Download/Print Invoice */}
          <button
            onClick={handlePrintInvoice}
            className="flex items-center space-x-1.5 px-3.5 py-2 border border-neutral-250 hover:border-primary-500/30 dark:border-neutral-750 bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-750 dark:text-neutral-300 rounded-card hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Invoice Layout Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-6">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block select-none">
            YATHU AROKIYAGAM ORDER DETAILS
          </span>
          <h2 className="text-xl font-black font-heading text-neutral-900 dark:text-white">
            Order #{order.orderNumber || order.id.slice(0, 8)}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-450 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>Placed on: {orderDateFormatted}</span>
          </div>
        </div>
        <div className="text-left sm:text-right space-y-1">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block select-none">
            ORDER STATUS
          </span>
          <div className="inline-block">
            {isRefunded ? (
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wide flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Refunded
              </span>
            ) : isCancelled ? (
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-wide">
                Cancelled
              </span>
            ) : upperStatus === 'DELIVERED' ? (
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-500/10 text-green-500 border border-green-500/20 uppercase tracking-wide">
                Delivered
              </span>
            ) : (
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-primary-500/10 text-primary-500 border border-primary-500/20 uppercase tracking-wide">
                {upperStatus}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Refund Banner Notice (if refunded) */}
      {(isRefunded || refundedPayment) && (
        <div className="bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/60 rounded-feature p-4 flex items-start space-x-3 text-emerald-900 dark:text-emerald-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-sm">Refund Initiated &amp; Processed</p>
            <p className="text-emerald-800 dark:text-emerald-300">
              A full refund of <strong>{formatPrice(Number(order.grandTotal))}</strong> has been dispatched back to your original payment account via Razorpay. It typically reflects on your bank or card statement within 5 to 7 business days.
            </p>
          </div>
        </div>
      )}

      {/* Timeline Section */}
      {!isCancelled && !isRefunded && (
        <div id="tracker" className="bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 sm:p-8 space-y-6 print:hidden">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2 select-none">
            <Truck className="w-4 h-4 text-primary-500 animate-bounce" /> Shipment Tracker
          </h3>
          
          <div className="relative flex justify-between select-none">
            {/* Progress line */}
            <div className="absolute top-[18px] left-[5%] right-[5%] h-1 bg-neutral-200 dark:bg-neutral-800 z-0">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, (currentStepIndex / (TIMELINE_STEPS.length - 1)) * 100)}%` }}
                className="h-full bg-success"
                transition={{ duration: 0.6 }}
              />
            </div>

            {TIMELINE_STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              
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
                  <p className="text-[10px] font-medium text-neutral-500 dark:text-neutral-450 mt-1 hidden sm:block leading-tight">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-neutral-900 dark:text-white select-none">
          Ordered Items
        </h3>
        
        <div className="border border-neutral-150 dark:border-neutral-800 rounded-feature overflow-hidden bg-white dark:bg-neutral-900 shadow-sm">
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {order.orderItems?.map((item, idx) => {
              const thumb = item.variant?.product?.thumbnailUrl || '/placeholder.png';
              return (
                <div key={item.id || idx} className="flex items-center space-x-4 p-5 text-xs sm:text-sm">
                  <div className="relative w-14 h-14 bg-neutral-100 dark:bg-neutral-850 rounded-feature overflow-hidden shrink-0 border border-neutral-200/50">
                    <img 
                      src={thumb} 
                      alt={item.productName} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-neutral-900 dark:text-white truncate">
                      {item.productName}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-450 font-semibold mt-0.5">
                      Price: {formatPrice(Number(item.unitPrice))} &bull; SKU: {item.sku}
                    </p>
                  </div>
                  <div className="font-bold text-neutral-500 dark:text-neutral-400 select-none text-center">
                    x{item.quantity}
                  </div>
                  <div className="font-bold text-neutral-900 dark:text-white w-24 text-right">
                    {formatPrice(Number(item.subtotal))}
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
                <span className="text-neutral-900 dark:text-white font-bold">{formatPrice(Number(order.subtotal))}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-bold">-{formatPrice(Number(order.discount))}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="text-neutral-900 dark:text-white font-bold">
                  {Number(order.shippingCharge) > 0 ? formatPrice(Number(order.shippingCharge)) : 'FREE'}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-neutral-200 dark:border-neutral-850 pt-2 font-black text-neutral-900 dark:text-white">
                <span>Grand Total</span>
                <span className="text-primary-750 dark:text-primary-400">{formatPrice(Number(order.grandTotal))}</span>
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
            {order.address ? (
              <>
                <h4 className="font-bold text-neutral-900 dark:text-white">
                  {order.address.fullName}
                </h4>
                <p>{order.address.addressLine1}</p>
                {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                <p>
                  {order.address.city}, {order.address.state} - {order.address.postalCode}
                </p>
                <p className="pt-2 text-neutral-500 font-medium">
                  Phone: {order.address.phone}
                </p>
              </>
            ) : (
              <p className="text-neutral-500 italic">No delivery address saved for this order.</p>
            )}
          </div>
        </div>

        {/* Payment Summary Card */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-feature p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-2.5 select-none">
            <CreditCard className="w-4 h-4 text-primary-500" /> Payment Summary
          </h3>
          <div className="text-xs space-y-2 text-neutral-700 dark:text-neutral-355 font-semibold">
            {order.payments && order.payments.length > 0 ? (
              order.payments.map((p) => (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex justify-between">
                    <span>Payment Channel:</span>
                    <span className="font-bold text-neutral-900 dark:text-white uppercase">
                      {p.provider === 'cod' ? 'Cash on Delivery (COD)' : `Online (${p.provider})`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <span>
                      {p.status.toUpperCase() === 'REFUNDED' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                          Refunded
                        </span>
                      ) : p.status.toUpperCase() === 'SUCCESSFUL' || p.status.toUpperCase() === 'CAPTURED' ? (
                        <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-550 border border-green-500/15 text-[10px] font-bold uppercase tracking-wider">
                          Paid
                        </span>
                      ) : p.status.toUpperCase() === 'FAILED' ? (
                        <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/15 text-[10px] font-bold uppercase tracking-wider">
                          Failed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/15 text-[10px] font-bold uppercase tracking-wider">
                          {p.status}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex justify-between">
                <span>Payment Channel:</span>
                <span className="font-bold text-neutral-900 dark:text-white">Cash on Delivery</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800 font-bold text-neutral-900 dark:text-white">
              <span>Settled Amount:</span>
              <span className="text-primary-750 dark:text-primary-400 font-black">{formatPrice(Number(order.grandTotal))}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Cancel Order #{order.orderNumber || order.id.slice(0, 8)}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Are you sure you want to cancel this order?
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowCancelModal(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
                disabled={isSubmittingCancel}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Online payment refund alert notice */}
            {capturedPayment && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl p-3.5 flex items-start space-x-3">
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 dark:text-blue-200 space-y-1">
                  <p className="font-bold">Instant Automated Refund</p>
                  <p className="text-blue-800 dark:text-blue-300">
                    Your payment of <strong>{formatPrice(Number(order.grandTotal))}</strong> will be automatically refunded through Razorpay to your original bank/UPI/card account within 5-7 business days.
                  </p>
                </div>
              </div>
            )}

            {/* Reason selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                Please select a reason for cancellation:
              </label>
              <div className="space-y-2">
                {CANCELLATION_REASONS.map((reason) => (
                  <label 
                    key={reason}
                    className={`flex items-center space-x-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedReason === reason 
                        ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-950/20 font-bold text-neutral-900 dark:text-white' 
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-850'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="cancel_reason" 
                      value={reason} 
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              {selectedReason === 'Other reason' && (
                <div className="pt-1">
                  <textarea
                    rows={3}
                    placeholder="Please specify why you are cancelling..."
                    value={customReasonNote}
                    onChange={(e) => setCustomReasonNote(e.target.value)}
                    className="w-full text-xs p-3 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isSubmittingCancel}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isSubmittingCancel}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center space-x-2 transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmittingCancel ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Cancellation...</span>
                  </>
                ) : (
                  <span>Confirm Cancellation</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
