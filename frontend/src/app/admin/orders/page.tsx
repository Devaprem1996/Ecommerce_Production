"use client";

import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  Search, 
  Eye, 
  Mail, 
  Phone, 
  MessageSquare,
  MapPin,
  Calendar,
  X,
  CreditCard,
  Send,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

interface OrderItem {
  id: string;
  name: string;
  unit: string;
  price: number;
  qty: number;
}

interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed';
  date: string;
  address: string;
  items: OrderItem[];
}

const initialOrders: Order[] = [
  {
    id: '#AETH-8910',
    customer: 'Priya Krishnan',
    email: 'priya@example.com',
    phone: '9876543210',
    amount: 1240,
    status: 'processing',
    paymentMethod: 'online',
    paymentStatus: 'paid',
    date: 'June 30, 2026, 02:30 PM',
    address: 'Flat 4B, Ruby Block, OMR Road, Chennai - 600113',
    items: [
      { id: 'prod-1', name: 'Organic Red Tomatoes', unit: '1kg', price: 60, qty: 2 },
      { id: 'prod-2', name: 'Raw Mountain Honey', unit: '500g', price: 350, qty: 2 },
      { id: 'prod-4', name: 'Farm Fresh A2 Cow Milk', unit: '1L', price: 85, qty: 5 }
    ]
  },
  {
    id: '#AETH-8909',
    customer: 'Vijay Kumar',
    email: 'vijay.k@example.com',
    phone: '9123456780',
    amount: 560,
    status: 'delivered',
    paymentMethod: 'cod',
    paymentStatus: 'paid',
    date: 'June 30, 2026, 11:15 AM',
    address: '12, Gandhi Street, T Nagar, Chennai - 600017',
    items: [
      { id: 'prod-3', name: 'Fresh Organic Spinach', unit: '250g', price: 30, qty: 2 },
      { id: 'prod-5', name: 'Multi-Floral Honey', unit: '500g', price: 250, qty: 2 }
    ]
  },
  {
    id: '#AETH-8908',
    customer: 'Ramesh Raj',
    email: 'ramesh.raj@example.com',
    phone: '9845012345',
    amount: 980,
    status: 'delivered',
    paymentMethod: 'online',
    paymentStatus: 'paid',
    date: 'June 29, 2026, 04:30 PM',
    address: '56/A, Cross Road, Adyar, Chennai - 600020',
    items: [
      { id: 'prod-2', name: 'Raw Mountain Honey', unit: '500g', price: 350, qty: 2 },
      { id: 'prod-1', name: 'Organic Red Tomatoes', unit: '1kg', price: 60, qty: 4.6 } // weight metric
    ]
  },
  {
    id: '#AETH-8907',
    customer: 'Anjali Menon',
    email: 'anjali@example.com',
    phone: '9000128374',
    amount: 2450,
    status: 'pending',
    paymentMethod: 'online',
    paymentStatus: 'pending',
    date: 'June 29, 2026, 02:10 PM',
    address: 'Kochi Tech Park Residency, Kakkanad, Kochi - 682030',
    items: [
      { id: 'prod-6', name: 'A2 Grass-Fed Cow Ghee', unit: '500ml', price: 650, qty: 3 },
      { id: 'prod-2', name: 'Raw Mountain Honey', unit: '500g', price: 350, qty: 1 }
    ]
  },
  {
    id: '#AETH-8906',
    customer: 'Devi S.',
    email: 'devi.s@example.com',
    phone: '9444109283',
    amount: 480,
    status: 'cancelled',
    paymentMethod: 'cod',
    paymentStatus: 'failed',
    date: 'June 29, 2026, 10:30 AM',
    address: '22, Temple Street, Madurai - 625001',
    items: [
      { id: 'prod-4', name: 'Farm Fresh A2 Cow Milk', unit: '1L', price: 85, qty: 4 },
      { id: 'prod-3', name: 'Fresh Organic Spinach', unit: '250g', price: 30, qty: 4.6 }
    ]
  }
];

export default function OrderManagementPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<'all' | Order['status']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected detail modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Status values
  const statuses: ('all' | Order['status'])[] = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchTab = activeTab === 'all' || order.status === activeTab;
      const matchSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.phone.includes(searchTerm);
      return matchTab && matchSearch;
    });
  }, [orders, activeTab, searchTerm]);

  const handleUpdateStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    
    // Update local modal state to match
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
    toast.success(`Order status updated to "${newStatus}"`);
  };

  const triggerNotification = (type: 'SMS' | 'Email', customer: string, phoneOrEmail: string) => {
    toast.success(`${type} alert dispatched to ${customer} (${phoneOrEmail}) successfully!`);
  };

  return (
    <div className="space-y-8 font-sans pb-10">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
          Order Processing
        </h1>
        <p className="text-xs font-semibold text-neutral-500">
          Track customer shipments, handle transactions, and dispatch alerts.
        </p>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {statuses.map(st => (
            <button
              key={st}
              onClick={() => setActiveTab(st)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer whitespace-nowrap ${
                activeTab === st
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-350'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-450" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Order ID, name or phone..."
            className="w-full text-xs font-semibold pl-10 pr-4 py-2.5 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-card text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Order List Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-150 dark:border-neutral-850 text-neutral-450 uppercase font-black tracking-wider">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-850/60">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/30">
                    <td className="p-4 font-bold text-neutral-905 dark:text-white">{order.id}</td>
                    <td className="p-4">
                      <p className="font-bold text-neutral-800 dark:text-neutral-200">{order.customer}</p>
                      <span className="text-[10px] text-neutral-500">{order.phone}</span>
                    </td>
                    <td className="p-4 font-semibold text-neutral-500">{order.date}</td>
                    <td className="p-4 font-extrabold text-neutral-900 dark:text-white">₹{order.amount}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        order.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {order.paymentMethod.toUpperCase()} - {order.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        order.status === 'delivered' ? 'bg-success/15 text-success' :
                        order.status === 'processing' ? 'bg-blue-500/15 text-blue-500' :
                        order.status === 'shipped' ? 'bg-primary-500/10 text-primary-500' :
                        order.status === 'pending' ? 'bg-amber-500/15 text-amber-500' :
                        'bg-red-500/15 text-red-500'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                        className="font-bold text-xs p-2 cursor-pointer"
                        leftIcon={<Eye className="w-4 h-4" />}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-10 text-center font-bold text-neutral-500">
                    No matching orders located.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedOrder(null)}
            className="fixed inset-0 bg-black/45 backdrop-blur-[2px] cursor-pointer"
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature shadow-2xl p-6 space-y-6 z-10 max-h-[90vh] overflow-y-auto">
            
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-neutral-50 dark:border-neutral-850 pb-3">
              <div>
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary-500" />
                  Order Inspection: {selectedOrder.id}
                </h3>
                <p className="text-[10px] font-semibold text-neutral-500">Placed on {selectedOrder.date}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-neutral-500 hover:text-primary-500 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content body split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Left Column: Customer details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-black text-neutral-450 uppercase tracking-wider border-b pb-1">Customer Profile</h4>
                  <p className="font-bold text-neutral-900 dark:text-white">{selectedOrder.customer}</p>
                  <p className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                    <Mail className="w-3.5 h-3.5 text-primary-500" /> {selectedOrder.email}
                  </p>
                  <p className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                    <Phone className="w-3.5 h-3.5 text-primary-500" /> +91 {selectedOrder.phone}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-neutral-450 uppercase tracking-wider border-b pb-1">Shipping Destination</h4>
                  <p className="flex items-start gap-1.5 text-neutral-600 dark:text-neutral-400 leading-relaxed font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0 mt-0.5" />
                    {selectedOrder.address}
                  </p>
                </div>

                {/* Status Dropdown modification */}
                <div className="space-y-2">
                  <h4 className="font-black text-neutral-450 uppercase tracking-wider border-b pb-1">Update Status</h4>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as any)}
                    className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Right Column: Invoice items details */}
              <div className="space-y-4">
                <h4 className="font-black text-neutral-450 uppercase tracking-wider border-b pb-1">Invoice Receipt</h4>
                
                <div className="space-y-2 border border-neutral-100 dark:border-neutral-800 rounded-card p-3 bg-neutral-50 dark:bg-neutral-950">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-1">
                      <div>
                        <p className="font-bold text-neutral-800 dark:text-neutral-200">{item.name}</p>
                        <span className="text-[10px] text-neutral-450">{item.unit} × {item.qty}</span>
                      </div>
                      <span className="font-bold text-neutral-900 dark:text-white">₹{item.price * item.qty}</span>
                    </div>
                  ))}
                  
                  <div className="border-t border-neutral-200 dark:border-neutral-800 pt-2 flex justify-between items-center font-extrabold text-neutral-900 dark:text-white">
                    <span>Total Amount</span>
                    <span>₹{selectedOrder.amount}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-neutral-450 uppercase tracking-wider border-b pb-1">Notify Customer</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => triggerNotification('SMS', selectedOrder.customer, selectedOrder.phone)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-card transition-colors cursor-pointer border border-emerald-500/20"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-current" />
                      <span>SMS Alert</span>
                    </button>
                    
                    <button
                      onClick={() => triggerNotification('Email', selectedOrder.customer, selectedOrder.email)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-500/10 text-sky-500 hover:bg-sky-500 hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-card transition-colors cursor-pointer border border-sky-500/20"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email Alert</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
