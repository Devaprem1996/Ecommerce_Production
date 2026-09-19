"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useWishlist } from '@/hooks/useWishlist';
import { accountService, CustomerOrder } from '@/services/account.service';
import { 
  ShoppingBag, 
  Heart, 
  Star, 
  MapPin, 
  User, 
  Bell, 
  ArrowRight, 
  TrendingUp, 
  Package, 
  Compass, 
  Loader2 
} from 'lucide-react';
import { formatPrice } from '@/utils/formatPrice';
import Link from 'next/link';

export default function AccountDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const wishlistItems = useWishlist((state) => state.items);

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [addressCount, setAddressCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  // Load customer orders, saved addresses, and wishlist from live database
  useEffect(() => {
    let isMounted = true;
    accountService.getOrders()
      .then((data) => {
        if (isMounted) {
          setOrders(data);
          setLoadingOrders(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load orders:', err);
        if (isMounted) setLoadingOrders(false);
      });

    accountService.getAddresses()
      .then((data) => {
        if (isMounted) {
          setAddressCount(data.length);
        }
      })
      .catch((err) => {
        console.error('Failed to load addresses:', err);
      });

    accountService.getWishlist()
      .then((items) => {
        if (isMounted) {
          setWishlistCount(Array.isArray(items) ? items.length : 0);
          setLoadingWishlist(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load wishlist:', err);
        if (isMounted) setLoadingWishlist(false);
      });

    // Synchronize customer wishlist Zustand store from live database
    useWishlist.getState().syncWithDb().then(() => {
      if (isMounted) {
        setWishlistCount(useWishlist.getState().items.length);
        setLoadingWishlist(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to format status badge
  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-green-500/10 text-green-500 border border-green-500/15 uppercase tracking-wide">
            Delivered
          </span>
        );
      case 'PROCESSING':
      case 'PACKED':
      case 'CONFIRMED':
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
    <div className="space-y-8">
      {/* Welcome Greeting Banner */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 dark:from-neutral-900 dark:to-neutral-850 p-6 sm:p-8 rounded-feature border border-primary-100/30 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h2 className="text-xl sm:text-2xl font-black font-heading text-neutral-900 dark:text-white">
              Hello, {user?.name || user?.email?.split('@')[0] || 'Customer'}! 👋
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Verified Account
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
            Welcome to your personal portal. Manage your orders, delivery addresses, and profile preferences seamlessly.
          </p>
        </div>
        <Link href="/account/profile">
          <button className="flex items-center space-x-1.5 px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-750 text-xs font-bold rounded-card shadow-sm hover:shadow transition-shadow">
            <User className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </Link>
      </div>

      {/* 3 Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 select-none">
        {/* Orders Stats */}
        <Link href="/account/orders" className="block">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-feature p-5 flex items-center space-x-4 shadow-sm hover:shadow transition-shadow cursor-pointer h-full">
            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950/20 border border-primary-100/30 dark:border-primary-900/20 rounded-full flex items-center justify-center text-primary-500">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">Total Orders</span>
              <span className="text-2xl font-black font-heading text-neutral-900 dark:text-white block mt-0.5">
                {loadingOrders ? (
                  <div className="w-8 h-6 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded" />
                ) : (
                  orders.length
                )}
              </span>
            </div>
          </div>
        </Link>

        {/* Wishlist Stats */}
        <Link href="/account/wishlist" className="block">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-feature p-5 flex items-center space-x-4 shadow-sm hover:shadow transition-shadow cursor-pointer h-full">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 border border-red-100/30 dark:border-red-900/20 rounded-full flex items-center justify-center text-red-500">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">Wishlist Items</span>
              <span className="text-2xl font-black font-heading text-neutral-900 dark:text-white block mt-0.5">
                {loadingWishlist ? (
                  <div className="w-8 h-6 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded" />
                ) : (
                  Math.max(wishlistCount, wishlistItems.length)
                )}
              </span>
            </div>
          </div>
        </Link>

        {/* Saved Addresses Stats */}
        <Link href="/account/addresses" className="block">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-feature p-5 flex items-center space-x-4 shadow-sm hover:shadow transition-shadow cursor-pointer h-full">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/30 dark:border-emerald-900/20 rounded-full flex items-center justify-center text-emerald-500">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">Saved Addresses</span>
              <span className="text-2xl font-black font-heading text-neutral-900 dark:text-white block mt-0.5">
                {addressCount}
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-500" /> Recent Orders
          </h3>
          <Link 
            href="/account/orders" 
            className="text-xs font-bold text-primary-500 hover:text-primary-600 hover:underline flex items-center gap-1 transition-colors"
          >
            View All Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="border border-neutral-150 dark:border-neutral-800 rounded-feature overflow-hidden bg-white dark:bg-neutral-900 shadow-sm">
          {loadingOrders ? (
            <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-10 px-4 space-y-3">
              <Package className="w-10 h-10 text-neutral-450 mx-auto" />
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">No orders placed yet</p>
              <Link href="/shop" className="text-xs font-bold text-primary-500 hover:underline inline-block">
                Start shopping now →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-950/40 text-neutral-500 dark:text-neutral-400 font-bold border-b border-neutral-150 dark:border-neutral-800 uppercase tracking-wider select-none">
                    <th className="px-6 py-4">Order Number</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Items</th>
                    <th className="px-6 py-4">Grand Total</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-semibold text-neutral-700 dark:text-neutral-350">
                  {orders.slice(0, 3).map((order) => {
                    const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <tr key={order.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/40 transition-colors">
                        <td className="px-6 py-4 font-bold text-neutral-900 dark:text-white font-mono">
                          #{order.orderNumber || order.id.slice(0, 8)}
                        </td>
                        <td className="px-6 py-4">
                          {formattedDate}
                        </td>
                        <td className="px-6 py-4 font-medium text-neutral-500">
                          {order.orderItems?.length || 0} items
                        </td>
                        <td className="px-6 py-4 font-bold text-primary-700 dark:text-primary-400">
                          {formatPrice(Number(order.grandTotal))}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link 
                            href={`/account/orders/${order.id}`} 
                            className="text-xs font-bold text-primary-500 hover:text-primary-600 transition-colors inline-block"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2 select-none">
          <Compass className="w-4 h-4 text-primary-500" /> Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/track-order">
            <div className="bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-150 dark:border-neutral-800 hover:border-primary-500/30 rounded-feature p-4 text-center cursor-pointer transition-all hover:-translate-y-1">
              <ShoppingBag className="w-5 h-5 text-neutral-500 dark:text-neutral-400 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Track Order</h4>
              <p className="text-[10px] text-neutral-500 mt-1 font-medium">Follow live shipment status</p>
            </div>
          </Link>

          <Link href="/account/addresses">
            <div className="bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-150 dark:border-neutral-800 hover:border-primary-500/30 rounded-feature p-4 text-center cursor-pointer transition-all hover:-translate-y-1">
              <MapPin className="w-5 h-5 text-neutral-500 dark:text-neutral-400 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Saved Addresses</h4>
              <p className="text-[10px] text-neutral-500 mt-1 font-medium">Manage default delivery locations</p>
            </div>
          </Link>

          <Link href="/account/wishlist">
            <div className="bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-150 dark:border-neutral-800 hover:border-primary-500/30 rounded-feature p-4 text-center cursor-pointer transition-all hover:-translate-y-1">
              <Heart className="w-5 h-5 text-neutral-500 dark:text-neutral-400 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white">My Wishlist</h4>
              <p className="text-[10px] text-neutral-500 mt-1 font-medium">View saved organic favorites</p>
            </div>
          </Link>

          <Link href="/account/notifications">
            <div className="bg-neutral-50 dark:bg-neutral-950/20 border border-neutral-150 dark:border-neutral-800 hover:border-primary-500/30 rounded-feature p-4 text-center cursor-pointer transition-all hover:-translate-y-1">
              <Bell className="w-5 h-5 text-neutral-500 dark:text-neutral-400 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Settings</h4>
              <p className="text-[10px] text-neutral-500 mt-1 font-medium">Adjust notification channels</p>
            </div>
          </Link>
        </div>
      </div>

    </div>
  );
}
