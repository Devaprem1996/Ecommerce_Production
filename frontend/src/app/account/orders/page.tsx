"use client";

import React, { useEffect, useState } from 'react';
import { useCartStore as useActualCartStore } from '@/store/cartStore';
import { mockProducts } from '@/constants/mockData';
import { formatPrice } from '@/utils/formatPrice';
import { 
  ShoppingBag, 
  Search, 
  ExternalLink, 
  RotateCcw, 
  XCircle, 
  Truck,
  PackageCheck,
  Calendar,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/Toast';

const TABS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrdersListPage() {
  const addItem = useActualCartStore((state) => state.addItem);
  const openMiniCart = useActualCartStore((state) => state.openMiniCart);

  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('all');

  // Load orders
  const loadOrders = () => {
    if (typeof window === 'undefined') return;
    const storedOrders = localStorage.getItem('user_orders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter orders by active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    return order.status.toLowerCase() === activeTab;
  });

  // Action: Cancel Order (Only if Pending)
  const handleCancelOrder = (orderId: string) => {
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        return { ...order, status: 'cancelled' };
      }
      return order;
    });
    localStorage.setItem('user_orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
    toast.success(`Order #${orderId} has been cancelled successfully.`);
  };

  // Action: Reorder (Only if Delivered)
  const handleReorder = (order: any) => {
    let addedCount = 0;
    order.items.forEach((item: any) => {
      const product = mockProducts.find((p) => p.id === item.productId);
      if (product) {
        addItem(product, item.quantity);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      toast.success('Items from this order have been added to your cart.');
      openMiniCart();
    } else {
      toast.error('Could not find products to reorder.');
    }
  };

  // Helper for status badge design
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-green-500/10 text-green-500 border border-green-500/15 uppercase tracking-wide">
            Delivered
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/15 uppercase tracking-wide">
            Processing
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/15 uppercase tracking-wide">
            Pending
          </span>
        );
      case 'shipped':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/15 uppercase tracking-wide">
            Shipped
          </span>
        );
      case 'cancelled':
      default:
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-red-500/10 text-red-500 border border-red-500/15 uppercase tracking-wide">
            Cancelled
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
          Track and manage your order history.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto scrollbar-none border-b border-neutral-200 dark:border-neutral-800 gap-1 pb-1 select-none">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-card transition-all uppercase tracking-wider ${
              activeTab === tab
                ? 'bg-primary-500 text-white'
                : 'text-neutral-500 dark:text-neutral-450 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-neutral-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List Container */}
      <div className="space-y-6">
        {filteredOrders.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4 bg-neutral-50/50 dark:bg-neutral-950/20 border border-neutral-150 dark:border-neutral-850 rounded-feature space-y-4">
            <div className="w-14 h-14 bg-neutral-200/50 dark:bg-neutral-800 rounded-full flex items-center justify-center text-neutral-450 mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">No Orders Found</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-450 max-w-xs mx-auto">
                We couldn't find any orders matching the filter "{activeTab}".
              </p>
            </div>
            <Link href="/shop" className="inline-block pt-2">
              <button className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs rounded-card border-none cursor-pointer">
                Start Shopping →
              </button>
            </Link>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div 
              key={order.id} 
              className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-feature p-5 shadow-sm space-y-4 hover:shadow transition-shadow"
            >
              {/* Order Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-black text-neutral-950 dark:text-white">
                    #{order.id}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-500 dark:text-neutral-450">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{order.date}</span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
                <div className="text-sm font-black text-primary-700 dark:text-primary-400">
                  Total: {formatPrice(order.total)}
                </div>
              </div>

              {/* Items Preview */}
              <div className="flex flex-col gap-3">
                {order.items.map((item: any, idx: number) => {
                  const product = mockProducts.find((p) => p.id === item.productId);
                  if (!product) return null;
                  return (
                    <div key={idx} className="flex items-center space-x-3 text-xs">
                      <div className="relative w-10 h-10 bg-neutral-100 dark:bg-neutral-850 rounded overflow-hidden shrink-0 border border-neutral-200/50">
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
                        <p className="text-[10px] text-neutral-550 dark:text-neutral-450 font-medium">
                          Quantity: {item.quantity} &bull; Unit: {product.unit}
                        </p>
                      </div>
                      <div className="font-bold text-neutral-900 dark:text-neutral-200">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions row */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                {/* Cancel Trigger */}
                {order.status.toLowerCase() === 'pending' && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 border border-red-200 hover:border-red-300 dark:border-red-950 bg-red-500/5 hover:bg-red-500/10 text-xs font-bold text-red-500 rounded-card transition-colors cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Order</span>
                  </button>
                )}

                {/* Track Trigger */}
                {(order.status.toLowerCase() === 'shipped' || order.status.toLowerCase() === 'processing') && (
                  <Link href={`/account/orders/${order.id}#tracker`}>
                    <button className="flex items-center space-x-1.5 px-3.5 py-2 border border-neutral-250 hover:border-primary-500/30 dark:border-neutral-750 bg-transparent text-xs font-bold text-neutral-750 dark:text-neutral-355 rounded-card hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer">
                      <Truck className="w-3.5 h-3.5 text-primary-500 animate-pulse" />
                      <span>Track Order</span>
                    </button>
                  </Link>
                )}

                {/* Reorder Trigger */}
                {order.status.toLowerCase() === 'delivered' && (
                  <button
                    onClick={() => handleReorder(order)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 border border-primary-500/20 bg-primary-500/5 hover:bg-primary-500/10 text-xs font-bold text-primary-500 rounded-card transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reorder</span>
                  </button>
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
          ))
        )}
      </div>

    </div>
  );
}
