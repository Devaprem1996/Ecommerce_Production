"use client";

import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  Search, 
  Eye, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  X, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Loader2,
  Package,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { useAdminOrders } from '@/hooks/useAdmin';
import { adminService, AdminOrder } from '@/services/admin.service';

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  confirmed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  processing: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  packed: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  shipped: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusDraft, setStatusDraft] = useState<string>('confirmed');

  const { data: orders = [], isLoading, isFetching, refetch } = useAdminOrders({
    status: activeTab,
    search: searchTerm,
  });

  const handleOpenDetail = (order: AdminOrder) => {
    setSelectedOrder(order);
    setStatusDraft(order.status);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setIsUpdatingStatus(true);
    try {
      await adminService.updateOrderStatus(selectedOrder.id, statusDraft);
      toast.success(`Order ${selectedOrder.orderNumber} updated to "${statusDraft.toUpperCase()}".`);
      setSelectedOrder({ ...selectedOrder, status: statusDraft as any });
      await refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
              Orders Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-500/10 text-primary-500 border border-primary-500/20">
              Live Neon DB ({orders.length} orders)
            </span>
          </div>
          <p className="text-xs font-semibold text-neutral-500 mt-1">
            Track, update statuses, and fulfill customer order packages in real-time.
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-xs font-bold border border-neutral-200 dark:border-neutral-750"
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />}
        >
          Sync
        </Button>
      </div>

      {/* Tabs & Search Filters */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 p-4 rounded-feature shadow-sm">
        
        {/* Status Tab list */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {['all', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-card transition-all cursor-pointer capitalize whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-450" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Order # or Customer..."
            className="w-full text-xs font-semibold pl-10 pr-4 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

      </div>

      {/* Orders Table (Desktop) */}
      <div className="hidden md:block bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-150 dark:border-neutral-850 text-neutral-450 uppercase font-black tracking-wider">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-850/60">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="p-4"><div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-5 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-full" /></td>
                    <td className="p-4 text-right"><div className="h-6 w-12 bg-neutral-200 dark:bg-neutral-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/30">
                    <td className="p-4 font-mono font-bold text-neutral-900 dark:text-white">
                      {order.orderNumber}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-neutral-900 dark:text-white">{order.customer}</p>
                      <span className="text-[10px] text-neutral-500">{order.phone}</span>
                    </td>
                    <td className="p-4 text-neutral-500 font-medium">
                      {order.date}
                    </td>
                    <td className="p-4 font-extrabold text-neutral-900 dark:text-white">
                      ₹{order.amount}
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Paid'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        ORDER_STATUS_COLORS[order.status] || 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(order)}
                        className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-primary-500 cursor-pointer"
                        title="View Full Order Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-10 text-center font-bold text-neutral-500">
                    No orders found matching the filter in Neon DB.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders Cards (Mobile) */}
      <div className="block md:hidden space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-32 bg-white dark:bg-neutral-900 border rounded-feature animate-pulse" />
          ))
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-4 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white block">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs font-semibold text-neutral-500 mt-0.5 block">{order.customer}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  ORDER_STATUS_COLORS[order.status] || 'bg-neutral-100 text-neutral-600'
                }`}>
                  {order.status}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs border-t pt-2">
                <span className="text-neutral-450">{order.date}</span>
                <span className="font-extrabold text-neutral-900 dark:text-white">₹{order.amount}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenDetail(order)}
                className="w-full text-xs font-bold border border-neutral-200 dark:border-neutral-750"
                leftIcon={<Eye className="w-3.5 h-3.5" />}
              >
                Inspect Order
              </Button>
            </div>
          ))
        ) : (
          <div className="p-8 text-center font-bold text-neutral-500 bg-white dark:bg-neutral-900 border rounded-feature">
            No orders found matching the filter.
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <span>Order {selectedOrder.orderNumber}</span>
                </h3>
                <p className="text-[10px] font-medium text-neutral-500">{selectedOrder.date}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Address */}
            <div className="bg-neutral-50 dark:bg-neutral-950 p-3.5 rounded-card space-y-1.5 text-xs border">
              <p className="font-bold text-neutral-900 dark:text-white">{selectedOrder.customer}</p>
              <p className="text-neutral-600 dark:text-neutral-400 text-[11px] flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-neutral-400" /> {selectedOrder.email}
              </p>
              <p className="text-neutral-600 dark:text-neutral-400 text-[11px] flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-neutral-400" /> {selectedOrder.phone}
              </p>
              <p className="text-neutral-600 dark:text-neutral-400 text-[11px] flex items-start gap-1.5 pt-1 border-t mt-1">
                <MapPin className="w-3 h-3 text-primary-500 shrink-0 mt-0.5" /> {selectedOrder.address}
              </p>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider block">
                Ordered Items ({selectedOrder.items?.length || 0})
              </span>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 rounded-card bg-neutral-50/70 dark:bg-neutral-850/40 text-xs">
                    <div>
                      <p className="font-bold text-neutral-850 dark:text-white">{item.name}</p>
                      <span className="text-[10px] text-neutral-400 font-semibold">{item.unit} • Qty: {item.qty}</span>
                    </div>
                    <span className="font-bold text-neutral-900 dark:text-white">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Mutation Controls */}
            <div className="border-t pt-4 space-y-3">
              <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                Change Order Status in Neon DB
              </label>
              <div className="flex gap-2">
                <select
                  value={statusDraft}
                  onChange={(e) => setStatusDraft(e.target.value)}
                  className="flex-1 text-xs font-bold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none capitalize cursor-pointer"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleUpdateStatus}
                  isLoading={isUpdatingStatus}
                  className="text-xs font-bold whitespace-nowrap"
                >
                  Update DB
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
