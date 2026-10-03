"use client";

import React, { useState } from 'react';
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
  Truck,
  Download,
  Printer,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Building
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

const COURIER_OPTIONS = [
  'Delhivery',
  'DTDC',
  'ST Courier',
  'India Post',
  'The Professional Couriers',
  'Blue Dart',
  'Local Dispatch / Farm Delivery',
  'Other Courier'
];

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusDraft, setStatusDraft] = useState<string>('confirmed');

  // Tracking inputs
  const [courierPartner, setCourierPartner] = useState<string>('Delhivery');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [trackingUrl, setTrackingUrl] = useState<string>('');

  // Print slip modal
  const [showPackingSlip, setShowPackingSlip] = useState(false);

  const { data: orders = [], isLoading, isFetching, refetch } = useAdminOrders({
    status: activeTab,
    search: searchTerm,
  });

  const handleOpenDetail = (order: AdminOrder) => {
    setSelectedOrder(order);
    setStatusDraft(order.status);
    setCourierPartner(order.courierPartner || 'Delhivery');
    setTrackingNumber(order.trackingNumber || '');
    setTrackingUrl(order.trackingUrl || '');
  };

  const handleCourierChange = (partner: string) => {
    setCourierPartner(partner);
    if (trackingNumber) {
      autoGenerateTrackingUrl(partner, trackingNumber);
    }
  };

  const handleTrackingNumberChange = (num: string) => {
    setTrackingNumber(num);
    autoGenerateTrackingUrl(courierPartner, num);
  };

  const autoGenerateTrackingUrl = (partner: string, num: string) => {
    if (!num.trim()) {
      setTrackingUrl('');
      return;
    }
    const clean = encodeURIComponent(num.trim());
    if (partner === 'Delhivery') {
      setTrackingUrl(`https://www.delhivery.com/track/package/${clean}`);
    } else if (partner === 'DTDC') {
      setTrackingUrl(`https://www.dtdc.in/tracking/tracking_results.asp?trType=awb&strCnno=${clean}`);
    } else if (partner === 'ST Courier') {
      setTrackingUrl(`https://stcourier.com/track/index.php?awb=${clean}`);
    } else if (partner === 'India Post') {
      setTrackingUrl(`https://www.indiapost.gov.in/_layouts/15/dpt.cpt.ui/untracking.aspx?article=${clean}`);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setIsUpdatingStatus(true);
    try {
      await adminService.updateOrderStatus(selectedOrder.id, statusDraft, {
        courierPartner: courierPartner || undefined,
        trackingNumber: trackingNumber || undefined,
        trackingUrl: trackingUrl || undefined,
      });

      toast.success(`Order ${selectedOrder.orderNumber} updated to "${statusDraft.toUpperCase()}".`);
      setSelectedOrder({
        ...selectedOrder,
        status: statusDraft as any,
        courierPartner,
        trackingNumber,
        trackingUrl,
      });
      await refetch();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleExportCSV = () => {
    if (orders.length === 0) {
      toast.info('No orders to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Phone',
      'Email',
      'Shipping Address',
      'Grand Total (INR)',
      'Order Status',
      'Payment Method',
      'Payment Status',
      'Courier Partner',
      'Tracking Number (AWB)',
      'Items Count'
    ];

    const rows = orders.map(o => [
      o.orderNumber,
      o.date,
      o.customer,
      o.phone,
      o.email,
      `"${(o.address || '').replace(/"/g, '""')}"`,
      o.amount,
      o.status.toUpperCase(),
      o.paymentMethod.toUpperCase(),
      (o.paymentStatus || 'PENDING').toUpperCase(),
      o.courierPartner || 'N/A',
      o.trackingNumber || 'N/A',
      o.items?.length || 0
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `yathu_orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Orders exported successfully.');
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="space-y-8 font-sans pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
              Orders & Fulfillment
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-500/10 text-primary-500 border border-primary-500/20">
              {orders.length} {activeTab === 'all' ? 'Total' : activeTab.toUpperCase()}
            </span>
          </div>
          <p className="text-xs font-semibold text-neutral-500 mt-1">
            Dispatch packages, assign courier tracking numbers (AWB), and inspect customer payments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs font-bold border border-neutral-200 dark:border-neutral-750"
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>

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
              {tab === 'confirmed' ? 'To Pack' : tab === 'packed' ? 'To Ship' : tab}
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
                <th className="p-4">Courier / AWB</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
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
                    <td className="p-4"><div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
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
                      <div className="space-y-0.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          ['successful', 'captured', 'paid'].includes((order.paymentStatus || '').toLowerCase())
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : order.paymentMethod === 'cod'
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-red-500/10 text-red-600'
                        }`}>
                          {order.paymentMethod === 'cod' ? 'COD' : 'Online'} • {order.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {order.trackingNumber ? (
                        <div>
                          <span className="font-bold text-neutral-800 dark:text-neutral-200 block text-[11px]">
                            {order.courierPartner || 'Courier'}
                          </span>
                          <span className="font-mono text-[10px] text-neutral-500 block">
                            {order.trackingNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-neutral-400 italic">Not Assigned</span>
                      )}
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
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-card bg-neutral-100 dark:bg-neutral-800 hover:bg-primary-500 hover:text-white text-neutral-700 dark:text-neutral-300 font-bold text-[11px] transition-colors cursor-pointer"
                        title="Fulfill & Inspect Order"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-10 text-center font-bold text-neutral-500">
                    No orders found matching the filter.
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
                Inspect & Fulfill Order
              </Button>
            </div>
          ))
        ) : (
          <div className="p-8 text-center font-bold text-neutral-500 bg-white dark:bg-neutral-900 border rounded-feature">
            No orders found matching the filter.
          </div>
        )}
      </div>

      {/* Order Detail & Fulfillment Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <span>Order {selectedOrder.orderNumber}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                    ORDER_STATUS_COLORS[selectedOrder.status] || 'bg-neutral-100'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </h3>
                <p className="text-[10px] font-medium text-neutral-500">{selectedOrder.date}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowPackingSlip(true)}
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded border border-neutral-200 dark:border-neutral-800"
                  title="Print Packing Slip / Receipt"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Customer Contact & Delivery Info */}
            <div className="bg-neutral-50 dark:bg-neutral-950 p-3.5 rounded-card space-y-2 text-xs border border-neutral-150 dark:border-neutral-850">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-neutral-900 dark:text-white">{selectedOrder.customer}</p>
                  <p className="text-neutral-600 dark:text-neutral-400 text-[11px] flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-neutral-400" /> {selectedOrder.email}
                  </p>
                  <p className="text-neutral-600 dark:text-neutral-400 text-[11px] flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-neutral-400" /> {selectedOrder.phone}
                  </p>
                </div>

                {selectedOrder.phone && selectedOrder.phone !== 'N/A' && (
                  <a
                    href={`https://wa.me/91${selectedOrder.phone.replace(/\D/g, '').slice(-10)}?text=Hello%20${encodeURIComponent(selectedOrder.customer)},%20regarding%20your%20Yathu%20Arokiyagam%20order%20${selectedOrder.orderNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white text-[11px] font-bold transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>

              <p className="text-neutral-600 dark:text-neutral-400 text-[11px] flex items-start gap-1.5 pt-2 border-t mt-1">
                <MapPin className="w-3 h-3 text-primary-500 shrink-0 mt-0.5" /> {selectedOrder.address}
              </p>
            </div>

            {/* Payment Details Panel */}
            <div className="p-3 rounded-card bg-neutral-50/60 dark:bg-neutral-950/60 border border-neutral-150 dark:border-neutral-850 space-y-1 text-xs">
              <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider block">
                Payment Verification
              </span>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white block">
                    {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment (Razorpay)'}
                  </span>
                  {selectedOrder.payment?.providerPaymentId && (
                    <span className="font-mono text-[10px] text-neutral-500 block">
                      Pay ID: {selectedOrder.payment.providerPaymentId}
                    </span>
                  )}
                  {selectedOrder.payment?.providerOrderId && (
                    <span className="font-mono text-[10px] text-neutral-500 block">
                      Rzp Order: {selectedOrder.payment.providerOrderId}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="font-black text-sm text-neutral-900 dark:text-white block">
                    ₹{selectedOrder.amount}
                  </span>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    ['successful', 'captured', 'paid'].includes((selectedOrder.paymentStatus || '').toLowerCase())
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-amber-500/10 text-amber-600'
                  }`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider block">
                Ordered Items ({selectedOrder.items?.length || 0})
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
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

            {/* Courier & AWB Tracking Form */}
            <div className="border-t pt-3 space-y-2.5">
              <span className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-primary-500" />
                <span>Courier & Shipment Tracking</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-semibold text-neutral-500 block mb-1">
                    Courier Partner
                  </label>
                  <select
                    value={courierPartner}
                    onChange={(e) => handleCourierChange(e.target.value)}
                    className="w-full text-xs font-semibold px-3 py-1.5 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    {COURIER_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-neutral-500 block mb-1">
                    AWB / Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => handleTrackingNumberChange(e.target.value)}
                    placeholder="e.g. 1420982310"
                    className="w-full text-xs font-mono font-semibold px-3 py-1.5 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-neutral-500 block mb-1">
                  Public Courier Tracking URL
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 text-xs font-mono px-3 py-1.5 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                  />
                  {trackingUrl && (
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 border rounded-card text-neutral-500 hover:text-primary-500"
                      title="Open Tracking Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Status Mutation Controls */}
            <div className="border-t pt-3 space-y-2">
              <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                Update Order Status & Dispatch Customer SMS
              </label>
              <div className="flex gap-2">
                <select
                  value={statusDraft}
                  onChange={(e) => setStatusDraft(e.target.value)}
                  className="flex-1 text-xs font-bold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none capitalize cursor-pointer"
                >
                  <option value="confirmed">Confirmed (Ready to Pack)</option>
                  <option value="packed">Packed (Ready for Courier)</option>
                  <option value="shipped">Shipped (In Transit)</option>
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
                  Update & Notify
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Printable Packing Slip / Invoice Modal */}
      {showPackingSlip && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800 rounded-feature max-w-2xl w-full p-8 shadow-2xl space-y-6 max-h-[95vh] overflow-y-auto print:m-0 print:p-4 print:shadow-none print:max-w-none">
            
            <div className="flex justify-between items-start border-b pb-4 print:border-b-2">
              <div>
                <h2 className="text-xl font-black font-heading text-primary-600 dark:text-primary-400">
                  YATHU AROKIYAGAM
                </h2>
                <p className="text-xs text-neutral-500">Pure Organic Harvest & Traditional Foods</p>
                <p className="text-[11px] text-neutral-400">Tamil Nadu, India • support@yathuarokiyagam.com</p>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  PACKING SLIP / INVOICE
                </h3>
                <p className="text-xs font-mono font-bold">{selectedOrder.orderNumber}</p>
                <p className="text-[11px] text-neutral-500">{selectedOrder.date}</p>
              </div>
            </div>

            {/* Delivery address & Courier */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded bg-neutral-50 dark:bg-neutral-950 border">
                <span className="font-bold text-[10px] uppercase text-neutral-400 block mb-1">Shipping To</span>
                <p className="font-bold text-sm">{selectedOrder.customer}</p>
                <p className="text-neutral-600 dark:text-neutral-400">{selectedOrder.address}</p>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1 font-semibold">Phone: {selectedOrder.phone}</p>
              </div>

              <div className="p-3 rounded bg-neutral-50 dark:bg-neutral-950 border">
                <span className="font-bold text-[10px] uppercase text-neutral-400 block mb-1">Dispatch Details</span>
                <p className="font-semibold">Courier: <span className="font-bold">{selectedOrder.courierPartner || 'Assigned on Dispatch'}</span></p>
                <p className="font-semibold font-mono">AWB: {selectedOrder.trackingNumber || 'Pending'}</p>
                <p className="font-semibold mt-1">Payment: <span className="font-bold uppercase">{selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</span></p>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 uppercase font-bold text-[10px]">
                  <th className="p-2.5">Item & SKU</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Price</th>
                  <th className="p-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {selectedOrder.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="p-2.5">
                      <p className="font-bold">{item.name}</p>
                      <span className="text-[10px] text-neutral-400">{item.unit}</span>
                    </td>
                    <td className="p-2.5 text-center font-bold">{item.qty}</td>
                    <td className="p-2.5 text-right">₹{item.price}</td>
                    <td className="p-2.5 text-right font-bold">₹{item.price * item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="border-t pt-3 flex justify-between items-center text-sm font-bold">
              <span className="text-xs text-neutral-500 font-normal">Thank you for choosing unadulterated organic nutrition!</span>
              <div className="text-right">
                <span className="text-xs text-neutral-500 block">Grand Total</span>
                <span className="text-lg font-black text-primary-600 dark:text-primary-400">₹{selectedOrder.amount}</span>
              </div>
            </div>

            {/* Action buttons (hidden on print) */}
            <div className="flex justify-end gap-2 border-t pt-4 print:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPackingSlip(false)}
                className="text-xs font-semibold"
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handlePrintSlip}
                leftIcon={<Printer className="w-4 h-4" />}
                className="text-xs font-bold"
              >
                Print Slip
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
