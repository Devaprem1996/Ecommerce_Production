"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  ShoppingBag, 
  Users, 
  Package, 
  ArrowUpRight,
  PlusCircle,
  FileBarChart,
  Sliders,
  Settings,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Button } from '@/components/ui/Button';

// Mock chart data
const salesData = [
  { month: 'Jan', revenue: 42000, orders: 120 },
  { month: 'Feb', revenue: 58000, orders: 155 },
  { month: 'Mar', revenue: 69000, orders: 190 },
  { month: 'Apr', revenue: 82000, orders: 220 },
  { month: 'May', revenue: 95000, orders: 260 },
  { month: 'Jun', revenue: 128450, orders: 342 }
];

// Mock recent orders
const recentOrders = [
  { id: '#AETH-8910', customer: 'Priya Krishnan', amount: 1240, status: 'processing', date: 'Today, 02:30 PM' },
  { id: '#AETH-8909', customer: 'Vijay Kumar', amount: 560, status: 'delivered', date: 'Today, 11:15 AM' },
  { id: '#AETH-8908', customer: 'Ramesh Raj', amount: 980, status: 'delivered', date: 'Yesterday, 04:30 PM' },
  { id: '#AETH-8907', customer: 'Anjali Menon', amount: 2450, status: 'pending', date: 'Yesterday, 02:10 PM' },
  { id: '#AETH-8906', customer: 'Devi S.', amount: 480, status: 'cancelled', date: '29 Jun, 10:30 AM' }
];

// Mock top products
const topProducts = [
  { name: 'Raw Mountain Honey', sales: 145, revenue: 50750, stock: 12 },
  { name: 'A2 Grass-Fed Cow Ghee', sales: 98, revenue: 63700, stock: 24 },
  { name: 'Kuthiraivali Millet', sales: 84, revenue: 8400, stock: 45 },
  { name: 'Organic Red Tomatoes', sales: 72, revenue: 4320, stock: 25 }
];

export default function AdminDashboardOverview() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: '₹1,28,450',
      change: '+18.4%',
      isPositive: true,
      icon: IndianRupee,
      color: 'text-primary-500 bg-primary-500/10'
    },
    {
      title: 'Total Orders',
      value: '342',
      change: '+12.5%',
      isPositive: true,
      icon: ShoppingBag,
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      title: 'Active Customers',
      value: '1,840',
      change: '+15.2%',
      isPositive: true,
      icon: Users,
      color: 'text-amber-500 bg-amber-500/10'
    },
    {
      title: 'Organic Products',
      value: '85',
      change: 'Flat',
      isPositive: true,
      icon: Package,
      color: 'text-emerald-500 bg-emerald-500/10'
    }
  ];

  return (
    <div className="space-y-8 font-sans pb-10">
      
      {/* Title + Quick Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs font-semibold text-neutral-500">
            Real-time status updates and revenue analytics.
          </p>
        </div>

        {/* Quick actions panel */}
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/products/new">
            <Button size="sm" variant="primary" className="text-xs font-bold" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Add Product
            </Button>
          </Link>
          <Link href="/admin/reports">
            <Button size="sm" variant="ghost" className="text-xs font-bold border border-neutral-250 dark:border-neutral-750" leftIcon={<FileBarChart className="w-4 h-4" />}>
              Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map(card => {
          const Icon = card.icon;
          return (
            <div 
              key={card.title} 
              className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 shadow-sm flex items-center justify-between transition-transform duration-normal hover:translate-y-[-4px]"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-widest block">{card.title}</span>
                <span className="text-2xl font-black text-neutral-900 dark:text-white font-heading block">{card.value}</span>
                <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase">
                  {card.isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5 text-success" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                  )}
                  <span className={card.isPositive ? 'text-success' : 'text-red-500'}>{card.change}</span>
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
      <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-50 dark:border-neutral-850 pb-3">
          <div>
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">Revenue Trend</h3>
            <p className="text-[10px] font-semibold text-neutral-500">Monthly gross sales representation</p>
          </div>
          <span className="text-xs font-black text-primary-500 uppercase tracking-widest flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> Live Updates
          </span>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-80 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#888888" opacity={0.1} />
              <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }} 
                labelStyle={{ fontWeight: 'bold' }}
                formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#2D6A4F" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Orders (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-50 dark:border-neutral-850 pb-3">
              <div>
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">Recent Orders</h3>
                <p className="text-[10px] font-semibold text-neutral-500">Latest checkout receipts</p>
              </div>
              <Link href="/admin/orders" className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline flex items-center gap-1">
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

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
                      <td className="py-3 font-bold text-neutral-900 dark:text-white">{order.id}</td>
                      <td className="py-3 font-semibold text-neutral-600 dark:text-neutral-400">{order.customer}</td>
                      <td className="py-3 font-bold">₹{order.amount}</td>
                      <td className="py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          order.status === 'delivered' ? 'bg-success/15 text-success' :
                          order.status === 'processing' ? 'bg-blue-500/15 text-blue-500' :
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
          </div>
        </div>

        {/* Top Products (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-50 dark:border-neutral-850 pb-3">
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">Top Products</h3>
              <p className="text-[10px] font-semibold text-neutral-500">Best-selling items by revenue</p>
            </div>
          </div>

          <div className="space-y-4">
            {topProducts.map(prod => (
              <div key={prod.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-neutral-800 dark:text-neutral-250 truncate max-w-[200px]">{prod.name}</span>
                  <span className="text-neutral-900 dark:text-white">₹{prod.revenue.toLocaleString()} <span className="text-neutral-450 font-semibold font-sans text-[10px]">({prod.sales} sold)</span></span>
                </div>
                
                {/* Stock progress indicators */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 rounded-full" 
                      style={{ width: `${Math.min((prod.sales/160)*100, 100)}%` }} 
                    />
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-wider ${
                    prod.stock <= 15 ? 'text-red-500' : 'text-neutral-400'
                  }`}>
                    {prod.stock} left
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
