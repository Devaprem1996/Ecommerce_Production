"use client";

import React, { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Eye, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Loader2,
  IndianRupee,
  ShieldCheck,
  AlertTriangle,
  Radio,
  FileSpreadsheet,
  Check,
  Clock,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { useAdminPayments } from '@/hooks/useAdmin';
import { adminService, AdminPaymentItem } from '@/services/admin.service';

const PAYMENT_STATUS_BADGES: Record<string, string> = {
  successful: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  captured: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  created: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  failed: 'bg-red-500/10 text-red-600 border-red-500/20',
  cancelled: 'bg-neutral-500/10 text-neutral-600 border-neutral-500/20',
  refunded: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
};

export default function AdminPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentItem | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const { data, isLoading, isFetching, refetch } = useAdminPayments({
    search: searchTerm,
    status: statusFilter,
    provider: providerFilter,
  });

  const payments = data?.payments || [];
  const summary = data?.summary || {
    totalVolume: 0,
    razorpayVolume: 0,
    codPendingVolume: 0,
    failedCount: 0,
  };

  const handleVerifyCod = async (paymentId: string) => {
    setVerifyingId(paymentId);
    try {
      await adminService.verifyCodPayment(paymentId);
      toast.success('COD payment marked as verified and collected!');
      await refetch();
      if (selectedPayment && selectedPayment.id === paymentId) {
        setSelectedPayment({
          ...selectedPayment,
          status: 'CAPTURED',
          paidAt: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify COD payment.');
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
              Payments & Transactions
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-500/10 text-primary-500 border border-primary-500/20">
              ₹{summary.totalVolume.toLocaleString('en-IN')} Total Processed
            </span>
          </div>
          <p className="text-xs font-semibold text-neutral-500 mt-1">
            Real-time ledger of Razorpay transactions, failed checkouts, and Cash on Delivery settlements.
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

      {/* Gateway Status Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-900 dark:text-white">Razorpay Gateway Integration</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active & Live
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Webhook signatures cryptographically verified with auto-reconciliation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="px-3 py-1 rounded bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-700 dark:text-neutral-300">
            UPI, Cards & Netbanking: <strong className="text-emerald-600">Enabled</strong>
          </span>
          <span className="px-3 py-1 rounded bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-700 dark:text-neutral-300">
            COD: <strong className="text-blue-600">Active</strong>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-4 sm:p-5 shadow-sm">
          <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-widest block">Total Captured</span>
          <span className="text-2xl font-black text-neutral-900 dark:text-white font-heading mt-1 block">
            ₹{summary.totalVolume.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-emerald-600 font-bold">Successfully settled</span>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-4 sm:p-5 shadow-sm">
          <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-widest block">Razorpay Volume</span>
          <span className="text-2xl font-black text-primary-600 dark:text-primary-400 font-heading mt-1 block">
            ₹{summary.razorpayVolume.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-neutral-400 font-medium">Instant digital payments</span>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-4 sm:p-5 shadow-sm">
          <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-widest block">Pending COD</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-heading mt-1 block">
            ₹{summary.codPendingVolume.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-amber-600 font-bold">Awaiting collection</span>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-4 sm:p-5 shadow-sm">
          <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-widest block">Failed Checkouts</span>
          <span className="text-2xl font-black text-red-600 dark:text-red-400 font-heading mt-1 block">
            {summary.failedCount}
          </span>
          <span className="text-[11px] text-red-600 font-medium">Declined by bank / UPI</span>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 p-4 rounded-feature shadow-sm">
        
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {['ALL', 'SUCCESSFUL', 'PENDING', 'FAILED', 'REFUNDED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-card transition-all cursor-pointer capitalize whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {tab}
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
            placeholder="Search Pay ID, Rzp Order, Order #..."
            className="w-full text-xs font-semibold pl-10 pr-4 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-150 dark:border-neutral-850 text-neutral-450 uppercase font-black tracking-wider">
                <th className="p-4">Transaction / Pay ID</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Provider</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-850/60">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="p-4"><div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-5 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-full" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4 text-right"><div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : payments.length > 0 ? (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/30">
                    <td className="p-4">
                      <span className="font-mono font-bold text-neutral-900 dark:text-white block">
                        {p.providerPaymentId || (p.provider === 'cod' ? 'COD-PAY' : 'PENDING_INIT')}
                      </span>
                      {p.providerOrderId && (
                        <span className="font-mono text-[10px] text-neutral-400 block">
                          {p.providerOrderId}
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-mono font-bold text-primary-600 dark:text-primary-400">
                      {p.orderNumber}
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-neutral-900 dark:text-white">{p.customerName}</p>
                      <span className="text-[10px] text-neutral-500">{p.customerPhone}</span>
                    </td>

                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        p.provider === 'razorpay' ? 'bg-blue-500/10 text-blue-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {p.provider}
                      </span>
                    </td>

                    <td className="p-4 font-black text-neutral-900 dark:text-white">
                      ₹{p.amount}
                    </td>

                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        PAYMENT_STATUS_BADGES[p.status.toLowerCase()] || 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {p.status}
                      </span>
                      {p.failureReason && (
                        <span className="text-[10px] text-red-500 block mt-0.5 truncate max-w-[140px]" title={p.failureReason}>
                          {p.failureReason}
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-neutral-500">
                      {new Date(p.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="px-2.5 py-1.5 rounded-card bg-neutral-100 dark:bg-neutral-800 hover:bg-primary-500 hover:text-white text-neutral-700 dark:text-neutral-300 font-bold text-[11px] transition-colors"
                          title="View Payment Diagnostics"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {p.provider === 'cod' && p.status !== 'CAPTURED' && p.status !== 'SUCCESSFUL' && (
                          <button
                            onClick={() => handleVerifyCod(p.id)}
                            disabled={verifyingId === p.id}
                            className="px-2 py-1 rounded-card bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white font-bold text-[10px] transition-colors whitespace-nowrap"
                            title="Confirm COD Collection"
                          >
                            Mark Collected
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-10 text-center font-bold text-neutral-500">
                    No transactions found matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature max-w-lg w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <span>Transaction Details</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    PAYMENT_STATUS_BADGES[selectedPayment.status.toLowerCase()] || 'bg-neutral-100'
                  }`}>
                    {selectedPayment.status}
                  </span>
                </h3>
                <p className="text-[11px] text-neutral-500">Recorded on {new Date(selectedPayment.createdAt).toLocaleString('en-IN')}</p>
              </div>
              <button 
                onClick={() => setSelectedPayment(null)}
                className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-white rounded"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-card bg-neutral-50 dark:bg-neutral-950 border space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Gateway References</span>
                <p className="font-mono"><strong>Razorpay Payment ID:</strong> {selectedPayment.providerPaymentId || 'N/A'}</p>
                <p className="font-mono"><strong>Razorpay Order ID:</strong> {selectedPayment.providerOrderId || 'N/A'}</p>
                <p className="font-mono"><strong>Order Number:</strong> {selectedPayment.orderNumber}</p>
              </div>

              <div className="p-3 rounded-card bg-neutral-50 dark:bg-neutral-950 border space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Settlement Details</span>
                <p><strong>Customer:</strong> {selectedPayment.customerName} ({selectedPayment.customerPhone})</p>
                <p><strong>Amount:</strong> ₹{selectedPayment.amount} {selectedPayment.currency}</p>
                <p><strong>Payment Provider:</strong> {selectedPayment.provider.toUpperCase()}</p>
                {selectedPayment.paidAt && (
                  <p><strong>Paid At:</strong> {new Date(selectedPayment.paidAt).toLocaleString('en-IN')}</p>
                )}
                {selectedPayment.failureReason && (
                  <p className="text-red-600 font-semibold"><strong>Failure Reason:</strong> {selectedPayment.failureReason}</p>
                )}
              </div>
            </div>

            {selectedPayment.provider === 'cod' && selectedPayment.status !== 'CAPTURED' && (
              <div className="border-t pt-3 flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleVerifyCod(selectedPayment.id)}
                  isLoading={verifyingId === selectedPayment.id}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                  className="text-xs font-bold"
                >
                  Verify & Collect COD (₹{selectedPayment.amount})
                </Button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
