"use client";

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Eye, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Loader2,
  ShoppingBag,
  IndianRupee,
  Shield,
  UserCheck,
  UserX,
  Clock,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { useAdminUsers } from '@/hooks/useAdmin';
import { adminService, AdminCustomer, AdminCustomerDetail } from '@/services/admin.service';

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminCustomerDetail['user'] | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data, isLoading, isFetching, refetch } = useAdminUsers({
    search: searchTerm,
    role: roleFilter,
  });

  const users = data?.users || [];
  const summary = data?.summary || { totalCustomers: 0, activeCustomers: 0, guestCount: 0 };

  const handleOpenDetail = async (userId: string) => {
    setSelectedUserId(userId);
    setLoadingDetail(true);
    try {
      const detail = await adminService.getUserDetail(userId);
      setSelectedUserDetail(detail);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load user details.');
      setSelectedUserId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleToggleStatus = async (user: AdminCustomer | AdminCustomerDetail['user']) => {
    setTogglingId(user.id);
    try {
      await adminService.toggleUserStatus(user.id);
      const displayName = 'name' in user ? user.name : (user.profile?.firstName || user.email || 'Customer');
      toast.success(`User ${displayName} status updated.`);
      await refetch();
      if (selectedUserDetail && selectedUserDetail.id === user.id) {
        setSelectedUserDetail({
          ...selectedUserDetail,
          isActive: !selectedUserDetail.isActive,
        });
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle status.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
              Customers & Users
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-500/10 text-primary-500 border border-primary-500/20">
              {summary.totalCustomers} Accounts
            </span>
          </div>
          <p className="text-xs font-semibold text-neutral-500 mt-1">
            Customer directory, purchase history, lifetime value (LTV), and account status controls.
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-4 sm:p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-widest block">Total Registered</span>
            <span className="text-2xl font-black text-neutral-900 dark:text-white font-heading mt-1 block">
              {summary.totalCustomers}
            </span>
            <span className="text-[11px] text-neutral-400 font-medium">All accounts created</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-4 sm:p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-widest block">Active Customers</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-heading mt-1 block">
              {summary.activeCustomers}
            </span>
            <span className="text-[11px] text-neutral-400 font-medium">In good standing</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-4 sm:p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-widest block">Guest Checkouts</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 font-heading mt-1 block">
              {summary.guestCount}
            </span>
            <span className="text-[11px] text-neutral-400 font-medium">Fast OTP shoppers</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 p-4 rounded-feature shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-450" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Customer Name, Phone, or Email..."
            className="w-full text-xs font-semibold pl-10 pr-4 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-neutral-450 uppercase">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="CUSTOMER">Customer</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-150 dark:border-neutral-850 text-neutral-450 uppercase font-black tracking-wider">
                <th className="p-4">Customer</th>
                <th className="p-4">Phone & Email</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4">Orders Count</th>
                <th className="p-4">Lifetime Spend</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-850/60">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="p-4"><div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-40 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-full" /></td>
                    <td className="p-4 text-right"><div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/30">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold flex items-center justify-center text-xs">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-white">{user.name}</p>
                          <span className="text-[10px] text-neutral-400">
                            {user.role} {user.isGuest ? '• Guest' : ''}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200">{user.phone}</p>
                      <span className="text-[10px] text-neutral-500">{user.email}</span>
                    </td>

                    <td className="p-4 text-neutral-500">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    <td className="p-4 font-bold text-neutral-900 dark:text-white">
                      {user.totalOrders} {user.totalOrders === 1 ? 'order' : 'orders'}
                    </td>

                    <td className="p-4 font-black text-neutral-900 dark:text-white">
                      ₹{user.totalSpent.toLocaleString('en-IN')}
                    </td>

                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        user.isActive
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-600 border-red-500/20'
                      }`}>
                        {user.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(user.id)}
                          className="px-2.5 py-1.5 rounded-card bg-neutral-100 dark:bg-neutral-800 hover:bg-primary-500 hover:text-white text-neutral-700 dark:text-neutral-300 font-bold text-[11px] transition-colors"
                          title="View Full Profile & Orders"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {user.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={togglingId === user.id}
                            className={`p-1.5 rounded-card border transition-colors ${
                              user.isActive
                                ? 'border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                            }`}
                            title={user.isActive ? 'Block Customer' : 'Activate Customer'}
                          >
                            {user.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-10 text-center font-bold text-neutral-500">
                    No customers found matching the search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            {loadingDetail ? (
              <div className="py-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
                <p className="text-xs font-bold text-neutral-500">Loading customer profile...</p>
              </div>
            ) : selectedUserDetail ? (
              <>
                <div className="flex justify-between items-start border-b pb-3">
                  <div>
                    <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                      <span>{selectedUserDetail.profile?.firstName || 'Customer'} {selectedUserDetail.profile?.lastName || ''}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        selectedUserDetail.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                      }`}>
                        {selectedUserDetail.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Member since {new Date(selectedUserDetail.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <button 
                    onClick={() => { setSelectedUserId(null); setSelectedUserDetail(null); }}
                    className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-white rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-card bg-neutral-50 dark:bg-neutral-950 border">
                    <span className="text-[10px] font-bold text-neutral-450 uppercase block">Total Orders</span>
                    <span className="text-lg font-black text-neutral-900 dark:text-white">{selectedUserDetail.totalOrders}</span>
                  </div>
                  <div className="p-3 rounded-card bg-neutral-50 dark:bg-neutral-950 border">
                    <span className="text-[10px] font-bold text-neutral-450 uppercase block">Total Spend (LTV)</span>
                    <span className="text-lg font-black text-primary-600 dark:text-primary-400">
                      ₹{selectedUserDetail.totalSpent.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="p-3.5 rounded-card bg-neutral-50 dark:bg-neutral-950 border space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-neutral-450 uppercase block mb-1">Contact Information</span>
                  <p className="text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{selectedUserDetail.email || 'No email provided'}</span>
                  </p>
                  <p className="text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{selectedUserDetail.phone || 'No phone provided'}</span>
                  </p>
                </div>

                {/* Addresses */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider block">
                    Saved Shipping Addresses ({selectedUserDetail.addresses.length})
                  </span>
                  {selectedUserDetail.addresses.length > 0 ? (
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                      {selectedUserDetail.addresses.map((addr) => (
                        <div key={addr.id} className="p-2.5 rounded-card bg-neutral-50 dark:bg-neutral-950 border text-xs space-y-0.5">
                          <p className="font-bold">{addr.fullName} • {addr.phone}</p>
                          <p className="text-neutral-600 dark:text-neutral-400">
                            {addr.addressLine1}, {addr.city}, {addr.state} - {addr.postalCode}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400 italic">No saved addresses on profile.</p>
                  )}
                </div>

                {/* Order History */}
                <div className="space-y-2 border-t pt-3">
                  <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-wider block">
                    Customer Purchase History ({selectedUserDetail.orders.length})
                  </span>
                  {selectedUserDetail.orders.length > 0 ? (
                    <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                      {selectedUserDetail.orders.map((ord) => (
                        <div key={ord.id} className="flex justify-between items-center p-2.5 rounded-card bg-neutral-50 dark:bg-neutral-950 border text-xs">
                          <div>
                            <span className="font-mono font-bold block">{ord.orderNumber}</span>
                            <span className="text-[10px] text-neutral-400">
                              {new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {ord.itemsCount} items
                            </span>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <div>
                              <span className="font-extrabold block">₹{ord.grandTotal}</span>
                              <span className="text-[10px] uppercase font-bold text-neutral-500">{ord.status}</span>
                            </div>
                            <Link 
                              href={`/admin/orders`}
                              className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-primary-500"
                              title="Go to Orders"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400 italic">Zero completed orders.</p>
                  )}
                </div>

              </>
            ) : null}

          </div>
        </div>
      )}

    </div>
  );
}
