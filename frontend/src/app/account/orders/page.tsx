"use client";

import React, { useEffect, useState } from 'react';
import { useCartStore as useActualCartStore } from '@/store/cartStore';
import { accountService, CustomerOrder } from '@/services/account.service';
import { formatPrice } from '@/utils/formatPrice';
import { 
  ShoppingBag, 
  ExternalLink, 
  RotateCcw, 
  XCircle, 
  Truck, 
  Calendar, 
  Loader2,
  AlertTriangle,
  X,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/Toast';

const TABS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const CANCELLATION_REASONS = [
  'Ordered by mistake',
  'Found a better price or alternative elsewhere',
  'Incorrect delivery address or contact number',
  'Delivery time is too long',
  'Item no longer needed',
  'Other reason',
];

export default function OrdersListPage() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Cancel order modal state
  const [cancelModalOrder, setCancelModalOrder] = useState<CustomerOrder | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>(CANCELLATION_REASONS[0]);
  const [customReasonNote, setCustomReasonNote] = useState<string>('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  // Load orders from database
  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await accountService.getOrders();
      setOrders(data);
    } catch (err: any) {
      console.error('Error fetching customer orders:', err);
      toast.error('Unable to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter orders by active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    const status = order.status.toLowerCase();
    if (activeTab === 'pending') {
      return status.includes('pending') || status.includes('draft');
    }
    if (activeTab === 'processing') {
      return status.includes('processing') || status.includes('packed') || status.includes('confirmed');
    }
    if (activeTab === 'shipped') {
      return status.includes('shipped') || status.includes('out_for_delivery');
    }
    if (activeTab === 'cancelled') {
      return status === 'cancelled' || status === 'refunded';
    }
    return status === activeTab;
  });

  // Action: Open Cancel Dialog
  const openCancelModal = (order: CustomerOrder) => {
    setCancelModalOrder(order);
    setSelectedReason(CANCELLATION_REASONS[0]);
    setCustomReasonNote('');
  };

  // Action: Submit Cancel Order
  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;
    const finalReason = selectedReason === 'Other reason' && customReasonNote.trim()
      ? customReasonNote.trim()
      : selectedReason;

    setIsSubmittingCancel(true);
    try {
      await accountService.cancelOrder(cancelModalOrder.id, finalReason);
      toast.success('Order has been cancelled successfully.');
      setCancelModalOrder(null);
      await loadOrders();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to cancel order.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  // Helper for status badge design
  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-green-500/10 text-green-500 border border-green-500/15 uppercase tracking-wide">
            Delivered
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-wide flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Refunded
          </span>
        );
      case 'PROCESSING':
      case 'CONFIRMED':
      case 'PACKED':
      case 'PAYMENT_VERIFIED':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/15 uppercase tracking-wide">
            {status}
          </span>
        );
      case 'PENDING':
      case 'PENDING_PAYMENT':
      case 'DRAFT':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/15 uppercase tracking-wide">
            Pending
          </span>
        );
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/15 uppercase tracking-wide">
            Shipped
          </span>
        );
      case 'CANCELLED':
      default:
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-red-500/10 text-red-500 border border-red-500/15 uppercase tracking-wide">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4">
        <h2 className="text-xl font-black font-heading text-neutral-900 dark:text-white">
          My Orders
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
          Track, cancel, and review your order history.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto scrollbar-none border-b border-neutral-200 dark:border-neutral-800 gap-1 pb-1 select-none">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-card transition-all uppercase tracking-wider cursor-pointer ${
              activeTab === tab
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-neutral-500 dark:text-neutral-450 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List Container */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-16 px-4 bg-neutral-50/50 dark:bg-neutral-950/20 border border-neutral-150 dark:border-neutral-850 rounded-feature flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
              Loading your orders...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-neutral-50/50 dark:bg-neutral-950/20 border border-neutral-150 dark:border-neutral-850 rounded-feature space-y-4">
            <div className="w-14 h-14 bg-neutral-200/50 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-450 mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">No Orders Found</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-450 max-w-xs mx-auto">
                No orders matching filter "{activeTab}".
              </p>
            </div>
            <Link href="/shop" className="inline-block pt-2">
              <button className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-card border-none cursor-pointer shadow-sm">
                Explore Store Catalog →
              </button>
            </Link>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            const upperStatus = order.status.toUpperCase();
            const isCancellable = ['DRAFT', 'PENDING', 'PENDING_PAYMENT', 'CONFIRMED', 'PAYMENT_VERIFIED'].includes(upperStatus);
            
            const refundedPayment = order.payments?.find(
              (p) => p.status.toUpperCase() === 'REFUNDED'
            );

            return (
              <div 
                key={order.id} 
                className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-feature p-5 shadow-sm space-y-4 hover:shadow transition-shadow"
              >
                {/* Order Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-black text-neutral-950 dark:text-white font-mono">
                      #{order.orderNumber || order.id.slice(0, 8)}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-500 dark:text-neutral-450">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formattedDate}</span>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="text-sm font-black text-primary-700 dark:text-primary-400">
                    Total: {formatPrice(Number(order.grandTotal))}
                  </div>
                </div>

                {/* Refund Notice (if refunded) */}
                {refundedPayment && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-850/50 rounded-card p-3 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold">Refund Processed: </span>
                      Full refund of {formatPrice(Number(refundedPayment.amount))} was credited back via Razorpay. It usually reflects in your original account within 5-7 working days.
                    </div>
                  </div>
                )}

                {/* Items Preview */}
                <div className="flex flex-col gap-3">
                  {order.orderItems?.map((item) => {
                    const thumb = item.variant?.product?.thumbnailUrl || '/placeholder.png';
                    return (
                      <div key={item.id} className="flex items-center space-x-3 text-xs">
                        <div className="relative w-10 h-10 bg-neutral-100 dark:bg-neutral-850 rounded overflow-hidden shrink-0 border border-neutral-200/50">
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
                          <p className="text-[10px] text-neutral-550 dark:text-neutral-450 font-medium">
                            Quantity: {item.quantity} &bull; SKU: {item.sku}
                          </p>
                        </div>
                        <div className="font-bold text-neutral-900 dark:text-neutral-200">
                          {formatPrice(Number(item.subtotal))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Actions row */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  {/* Cancel Trigger */}
                  {isCancellable && (
                    <button
                      onClick={() => openCancelModal(order)}
                      className="flex items-center space-x-1.5 px-3.5 py-2 border border-red-200 hover:border-red-300 dark:border-red-950 bg-red-500/5 hover:bg-red-500/10 text-xs font-bold text-red-500 rounded-card transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel Order</span>
                    </button>
                  )}

                  {/* Track Trigger */}
                  {(upperStatus === 'SHIPPED' || upperStatus === 'PROCESSING' || upperStatus === 'OUT_FOR_DELIVERY') && (
                    <Link href={`/account/orders/${order.id}#tracker`}>
                      <button className="flex items-center space-x-1.5 px-3.5 py-2 border border-neutral-250 hover:border-primary-500/30 dark:border-neutral-750 bg-transparent text-xs font-bold text-neutral-750 dark:text-neutral-355 rounded-card hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer">
                        <Truck className="w-3.5 h-3.5 text-primary-500 animate-pulse" />
                        <span>Track Order</span>
                      </button>
                    </Link>
                  )}

                  {/* View Details Trigger */}
                  <Link href={`/account/orders/${order.id}`}>
                    <button className="flex items-center space-x-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-xs font-bold text-white rounded-card cursor-pointer">
                      <span>View Details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      {cancelModalOrder && (
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
                    Cancel Order #{cancelModalOrder.orderNumber || cancelModalOrder.id.slice(0, 8)}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Please confirm if you want to cancel this order.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setCancelModalOrder(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
                disabled={isSubmittingCancel}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Online payment refund alert notice */}
            {cancelModalOrder.payments?.some(
              (p) =>
                (p.provider === 'razorpay' || p.provider === 'online') &&
                (p.status.toUpperCase() === 'SUCCESSFUL' || p.status.toUpperCase() === 'CAPTURED')
            ) && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-xl p-3.5 flex items-start space-x-3">
                <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 dark:text-blue-200 space-y-1">
                  <p className="font-bold">Instant Automated Refund</p>
                  <p className="text-blue-800 dark:text-blue-300">
                    Your payment of <strong>{formatPrice(Number(cancelModalOrder.grandTotal))}</strong> will be automatically refunded through Razorpay to your original bank/UPI/card account within 5-7 business days.
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
                onClick={() => setCancelModalOrder(null)}
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
