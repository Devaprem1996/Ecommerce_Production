"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  ShoppingBag, 
  Users, 
  Package, 
  PlusCircle, 
  FileBarChart, 
  ArrowRight, 
  RefreshCw,
  AlertCircle,
  Clock,
  Radio
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Area, 
  AreaChart 
} from 'recharts';
import { Button } from '@/components/ui/Button';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';

export default function AdminDashboardOverview() {
  const { data, isLoading, isError, error, refetch, isFetching } = useAdminDashboard();
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  }, [data]);

  const handleManualRefresh = () => {
    refetch();
  };

  // 1. Loading Skeleton View
  if (isLoading && !data) {
    return (
      <div className="space-y-8 font-sans pb-10 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="h-8 w-60 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
            <div className="h-4 w-40 bg-neutral-150 dark:bg-neutral-850 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-28 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
            <div className="h-9 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
          </div>
        </div>

        {/* KPI Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 flex justify-between items-center">
              <div className="space-y-3">
                <div className="h-3 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
                <div className="h-7 w-28 bg-neutral-250 dark:bg-neutral-750 rounded" />
                <div className="h-3 w-24 bg-neutral-150 dark:bg-neutral-850 rounded" />
              </div>
              <div className="w-12 h-12 rounded-full bg-neutral-150 dark:bg-neutral-800" />
            </div>
          ))}
        </div>

        {/* Chart Skeleton */}
        <div className="h-96 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6" />

        {/* Tables Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 h-80 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature" />
          <div className="lg:col-span-5 h-80 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature" />
        </div>
      </div>
    );
  }

  // 2. Error Fallback State
  if (isError && !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-900/50 rounded-feature p-8 max-w-md text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Unable to reach Neon DB</h2>
          <p className="text-xs text-neutral-500">
            {error?.message || "Failed to establish a live connection to the backend database."}
          </p>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleManualRefresh}
            className="mt-2 text-xs font-bold"
            leftIcon={<RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />}
          >
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis;
  const salesTrend = data?.salesTrend || [];
  const recentOrders = data?.recentOrders || [];
  const topProducts = data?.topProducts || [];

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `₹${Number(kpis?.totalRevenue?.value ?? 0).toLocaleString('en-IN')}`,
      change: kpis?.totalRevenue?.change ?? '+0%',
      isPositive: kpis?.totalRevenue?.isPositive ?? true,
      icon: IndianRupee,
      color: 'text-primary-500 bg-primary-500/10'
    },
    {
      title: 'Total Orders',
      value: String(kpis?.totalOrders?.value ?? 0),
      change: kpis?.totalOrders?.change ?? '+0%',
      isPositive: kpis?.totalOrders?.isPositive ?? true,
      icon: ShoppingBag,
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      title: 'Active Customers',
      value: String(kpis?.activeCustomers?.value ?? 0),
      change: kpis?.activeCustomers?.change ?? '0%',
      isPositive: kpis?.activeCustomers?.isPositive ?? true,
      icon: Users,
      color: 'text-amber-500 bg-amber-500/10'
    },
    {
      title: 'Organic Products',
      value: String(kpis?.activeProducts?.value ?? 0),
      change: kpis?.activeProducts?.change ?? 'Flat',
      isPositive: true,
      icon: Package,
      color: 'text-emerald-500 bg-emerald-500/10'
    }
  ];

  return (
    <div className="space-y-8 font-sans pb-10">
      {/* Title + Live Pulse Badge + Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-neutral-900 dark:text-white tracking-tight">
              Dashboard Overview
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Neon DB
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
            <span>Real-time transactions, revenue analytics & inventory status.</span>
            {lastUpdated && (
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-neutral-400">
                <Clock className="w-3 h-3" />
                Updated at {lastUpdated}
              </span>
            )}
          </div>
        </div>

        {/* Action buttons & manual refresh */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto items-center">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleManualRefresh}
            title="Refresh live metrics"
            className="border border-neutral-200 dark:border-neutral-800 text-xs font-semibold py-2 px-2.5"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400 ${isFetching ? 'animate-spin text-primary-500' : ''}`} />}
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Link href="/admin/products/new" className="flex-1 sm:flex-initial">
            <Button size="sm" variant="primary" className="w-full justify-center text-xs font-bold py-2" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Add Product
            </Button>
          </Link>
          <Link href="/admin/reports" className="flex-1 sm:flex-initial">
            <Button size="sm" variant="ghost" className="w-full justify-center text-xs font-bold border border-neutral-200 dark:border-neutral-800 py-2" leftIcon={<FileBarChart className="w-4 h-4" />}>
              Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpiCards.map(card => {
          const Icon = card.icon;
          return (
            <div 
              key={card.title} 
              className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-4 sm:p-6 shadow-sm flex items-center justify-between transition-transform duration-normal hover:-translate-y-1"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-widest block">{card.title}</span>
                <span className="text-2xl font-black text-neutral-900 dark:text-white font-heading block">{card.value}</span>
                <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase">
                  {card.isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                  )}
                  <span className={card.isPositive ? 'text-emerald-500' : 'text-red-500'}>{card.change}</span>
                  <span className="text-neutral-400 font-medium lowercase">vs last month</span>
                </span>
              </div>

              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Chart Block */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-850 pb-3">
          <div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">Gross Revenue Trend</h3>
            <p className="text-[10px] font-semibold text-neutral-500">Trailing 6-month transaction aggregates</p>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> Live Feed
          </span>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-80 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.15} />
              <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', color: '#fff', borderRadius: '8px', border: '1px solid #27272a' }} 
                labelStyle={{ fontWeight: 'bold' }}
                formatter={(value: any, name: any) => [
                  name === 'revenue' ? `₹${Number(value).toLocaleString('en-IN')}` : value,
                  name === 'revenue' ? 'Revenue' : 'Orders'
                ]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#2D6A4F" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Orders (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-4 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-850 pb-3">
              <div>
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">Recent Orders</h3>
                <p className="text-[10px] font-semibold text-neutral-500">Live checkout receipts from Neon DB</p>
              </div>
              <Link href="/admin/orders" className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline flex items-center gap-1">
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-400">
                No orders recorded yet. As customers check out, orders will appear here automatically.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-450 uppercase font-black tracking-wider">
                      <th className="py-2.5">Order ID</th>
                      <th className="py-2.5">Customer</th>
                      <th className="py-2.5">Amount</th>
                      <th className="py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-50 dark:divide-neutral-850/60">
                    {recentOrders.map(order => (
                      <tr key={order.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/30">
                        <td className="py-3 font-bold text-neutral-900 dark:text-white">{order.orderNumber}</td>
                        <td className="py-3 font-semibold text-neutral-600 dark:text-neutral-400">
                          <div>{order.customer}</div>
                          <div className="text-[10px] text-neutral-400">{order.date}</div>
                        </td>
                        <td className="py-3 font-bold text-neutral-900 dark:text-white">₹{order.amount.toLocaleString('en-IN')}</td>
                        <td className="py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            order.status === 'delivered' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                            order.status === 'confirmed' || order.status === 'processing' ? 'bg-blue-500/15 text-blue-500' :
                            order.status === 'packed' || order.status === 'shipped' ? 'bg-purple-500/15 text-purple-500' :
                            order.status === 'pending' ? 'bg-amber-500/15 text-amber-500' :
                            'bg-red-500/15 text-red-500'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Top Products (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-850 pb-3">
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">Top Products</h3>
              <p className="text-[10px] font-semibold text-neutral-500">Best-selling inventory items</p>
            </div>
            <Link href="/admin/products" className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline flex items-center gap-1">
              <span>Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {topProducts.map(prod => (
              <div key={prod.id} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-neutral-800 dark:text-neutral-250 truncate max-w-[200px]" title={prod.name}>
                    {prod.name}
                  </span>
                  <span className="text-neutral-900 dark:text-white">
                    ₹{prod.revenue.toLocaleString('en-IN')}{' '}
                    <span className="text-neutral-450 font-semibold font-sans text-[10px]">
                      ({prod.sales} sold)
                    </span>
                  </span>
                </div>
                
                {/* Stock progress indicators */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(((prod.sales || 1) / 20) * 100, 100)}%` }} 
                    />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${
                    prod.stock <= 10 ? 'text-red-500' : 'text-neutral-400'
                  }`}>
                    {prod.stock} in stock
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
