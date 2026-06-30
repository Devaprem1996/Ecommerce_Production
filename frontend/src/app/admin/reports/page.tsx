"use client";

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar as CalendarIcon, 
  Download, 
  TrendingUp, 
  FileSpreadsheet, 
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

// Mock report datasets
const categoryPieData = [
  { name: 'Fruits & Vegetables', value: 42300, color: '#2D6A4F' },
  { name: 'Dairy & Eggs', value: 32100, color: '#52B788' },
  { name: 'Honey & Spices', value: 29400, color: '#E09F3E' },
  { name: 'Grains & Flours', value: 18600, color: '#F77F00' },
  { name: 'Beverages', value: 6050, color: '#3A86C8' }
];

const revenueTrendData = [
  { week: 'Week 1', revenue: 21000, profit: 8400 },
  { week: 'Week 2', revenue: 27500, profit: 11000 },
  { week: 'Week 3', revenue: 31200, profit: 12500 },
  { week: 'Week 4', revenue: 48750, profit: 19500 }
];

const topProductsBarData = [
  { name: 'Mountain Honey', units: 145, revenue: 50750 },
  { name: 'A2 Cow Milk', units: 122, revenue: 10370 },
  { name: 'A2 Cow Ghee', units: 98, revenue: 63700 },
  { name: 'Red Tomatoes', units: 72, revenue: 4320 },
  { name: 'Organic Spinach', units: 64, revenue: 1920 }
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('30days');

  // Trigger download of CSV report
  const handleExportCSV = () => {
    try {
      const headers = ['Metric/Item', 'Sales Value/Units', 'Revenue Share (INR)'];
      const rows = [
        ...categoryPieData.map(item => [item.name, 'Category Share', item.value.toString()]),
        ...topProductsBarData.map(item => [item.name, `${item.units} units`, item.revenue.toString()]),
        ['Gross Total Revenue', 'All Categories', '128450']
      ];

      const csvContent = [
        headers.join(','),
        ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `aether_sales_report_${dateRange}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Sales report spreadsheet exported successfully!');
    } catch (err) {
      toast.error('Failed to generate export file.');
    }
  };

  return (
    <div className="space-y-8 font-sans pb-10">
      
      {/* Title + Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
            Analytics & Reports
          </h1>
          <p className="text-xs font-semibold text-neutral-500">
            Monitor product metrics, performance distribution, and financial statements.
          </p>
        </div>

        {/* Date Selector and Download Button */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-44">
            <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-450" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full text-base md:text-xs font-bold pl-10 pr-8 py-2.5 md:py-2 bg-white dark:bg-neutral-900 border rounded-card text-neutral-805 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="ytd">Year to Date</option>
            </select>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs font-bold w-full sm:w-auto py-2.5 md:py-2 justify-center border border-neutral-250 dark:border-neutral-750"
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-neutral-900 border rounded-feature p-5 shadow-sm space-y-1">
          <span className="text-[9px] font-bold text-neutral-450 uppercase tracking-widest block">Average Order Basket</span>
          <span className="text-xl font-black text-neutral-900 dark:text-white block font-heading">₹375.58</span>
          <span className="text-[10px] text-success font-extrabold uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +5.2% vs last week
          </span>
        </div>

        <div className="bg-white dark:bg-neutral-900 border rounded-feature p-5 shadow-sm space-y-1">
          <span className="text-[9px] font-bold text-neutral-450 uppercase tracking-widest block">Net Profit Margin</span>
          <span className="text-xl font-black text-neutral-900 dark:text-white block font-heading">40.0% (₹51,400)</span>
          <span className="text-[10px] text-success font-extrabold uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +2.3% vs last week
          </span>
        </div>

        <div className="bg-white dark:bg-neutral-900 border rounded-feature p-5 shadow-sm space-y-1">
          <span className="text-[9px] font-bold text-neutral-450 uppercase tracking-widest block">Customer Return Rate</span>
          <span className="text-xl font-black text-neutral-900 dark:text-white block font-heading">1.2%</span>
          <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-wider flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> -0.4% improvement
          </span>
        </div>
      </div>

      {/* Charts section: Left Category Share (Pie) and Weekly Revenue (Line) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sales by Category (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-neutral-900 border rounded-feature p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider border-b pb-2">Category Share</h3>
            
            <div className="h-64 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value ? `₹${Number(value).toLocaleString()}` : ''} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-1.5 border-t pt-3 mt-4 text-[10px] font-semibold text-neutral-650">
            {categoryPieData.map(entry => (
              <div key={entry.name} className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}
                </span>
                <span className="font-bold text-neutral-900 dark:text-white">₹{entry.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Revenue Profit trend (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border rounded-feature p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider border-b pb-2">Revenue vs Profit Trend</h3>
          
          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrendData} margin={{ left: -15, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="week" stroke="#888888" tickLine={false} />
                <YAxis stroke="#888888" tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip formatter={(value) => value ? `₹${Number(value).toLocaleString()}` : ''} />
                <Legend wrapperStyle={{ fontSize: 10, fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="revenue" stroke="#2D6A4F" strokeWidth={3} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="profit" stroke="#E09F3E" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Top Products Bar Chart */}
      <div className="bg-white dark:bg-neutral-900 border rounded-feature p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider border-b pb-2">Product Sales Quantity</h3>
        
        <div className="h-80 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProductsBarData} margin={{ left: -15, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" stroke="#888888" tickLine={false} />
              <YAxis stroke="#888888" tickLine={false} />
              <Tooltip formatter={(value, name) => [value ? Number(value) : 0, name === 'units' ? 'Units Sold' : 'Revenue (INR)']} />
              <Bar dataKey="units" fill="#52B788" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
