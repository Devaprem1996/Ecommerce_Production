"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Ticket, 
  Plus, 
  Search, 
  ArrowUpDown, 
  Trash2, 
  X, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Loader2,
  Percent
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { useAdminCoupons } from "@/hooks/useAdmin";
import { adminService, AdminCoupon } from "@/services/admin.service";

// Form Schema
const couponSchema = z.object({
  code: z.string()
    .min(3, "Code must be at least 3 characters")
    .max(15, "Code cannot exceed 15 characters")
    .regex(/^[A-Z0-9]+$/, "Code must contain only uppercase letters and numbers"),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed", "free_delivery"]),
  discountValue: z.number().min(0, "Value cannot be negative"),
  maxDiscountCap: z.number().optional(),
  minOrderValue: z.number().optional(),
  validFrom: z.string().min(1, "Start date is required"),
  validUntil: z.string().min(1, "End date is required"),
  usageLimitTotal: z.number().optional(),
  firstOrderOnly: z.boolean(),
  active: z.boolean()
});

type CouponFormData = z.infer<typeof couponSchema>;

export default function AdminCouponsPage() {
  const { data: coupons = [], isLoading, isFetching, refetch } = useAdminCoupons();

  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 10,
      minOrderValue: 499,
      validFrom: new Date().toISOString().split("T")[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      firstOrderOnly: false,
      active: true
    }
  });

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) =>
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [coupons, searchTerm]);

  const handleCreateCoupon = async (data: CouponFormData) => {
    setIsSubmitting(true);
    try {
      await adminService.createCoupon(data);
      toast.success(`Coupon ${data.code} created in Neon DB!`);
      reset();
      setModalOpen(false);
      await refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to create coupon.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, code: string) => {
    setTogglingId(id);
    try {
      await adminService.toggleCoupon(id);
      toast.success(`Coupon ${code} status toggled.`);
      await refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle coupon.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon "${code}" from Neon DB?`)) return;
    setDeletingId(id);
    try {
      await adminService.deleteCoupon(id);
      toast.success(`Coupon ${code} deleted.`);
      await refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete coupon.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
              Coupons Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-500/10 text-primary-500 border border-primary-500/20">
              Live Neon DB ({coupons.length} coupons)
            </span>
          </div>
          <p className="text-xs font-semibold text-neutral-500 mt-1">
            Create and monitor discount vouchers and seasonal promotions.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
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

          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="text-xs font-bold w-full sm:w-auto justify-center"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex justify-between items-center gap-4 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 p-4 rounded-feature shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-450" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search coupon code..."
            className="w-full text-xs font-semibold pl-10 pr-4 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-150 dark:border-neutral-850 text-neutral-450 uppercase font-black tracking-wider">
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Min Order</th>
                <th className="p-4">Valid Window</th>
                <th className="p-4">Usage Count</th>
                <th className="p-4">Active</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-850/60">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="p-4"><div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-12 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-12 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-full" /></td>
                    <td className="p-4 text-right"><div className="h-6 w-12 bg-neutral-200 dark:bg-neutral-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredCoupons.length > 0 ? (
                filteredCoupons.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/30">
                    <td className="p-4">
                      <span className="font-mono font-black text-sm text-primary-500 bg-primary-500/10 px-2.5 py-1 rounded-card border border-primary-500/20">
                        {c.code}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-neutral-900 dark:text-white">
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT`}
                    </td>
                    <td className="p-4 text-neutral-600 dark:text-neutral-400 font-bold">
                      ₹{c.minOrderValue || 0}
                    </td>
                    <td className="p-4 text-neutral-500 font-medium">
                      {c.validFrom} to {c.validUntil}
                    </td>
                    <td className="p-4 font-bold text-neutral-900 dark:text-white">
                      {c.usageCount} {c.usageLimitTotal ? `/ ${c.usageLimitTotal}` : 'used'}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(c.id, c.code)}
                        disabled={togglingId === c.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer border ${
                          c.active ? 'bg-success/10 text-success border-success/20' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 border-neutral-300 dark:border-neutral-700'
                        }`}
                      >
                        {togglingId === c.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : c.active ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {c.active ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(c.id, c.code)}
                        disabled={deletingId === c.id}
                        className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-red-500 cursor-pointer disabled:opacity-50"
                        title="Delete Coupon"
                      >
                        {deletingId === c.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-10 text-center font-bold text-neutral-500">
                    No coupons found in Neon database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 text-primary-500" />
                <span>Create Discount Coupon</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-600 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleCreateCoupon)} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  {...register('code')}
                  placeholder="YATHU25"
                  className="w-full text-xs font-mono font-bold uppercase px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                {errors.code && (
                  <span className="text-[10px] font-bold text-red-500 block">{errors.code.message}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    Discount Type
                  </label>
                  <select
                    {...register('discountType')}
                    className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    {...register('discountValue', { valueAsNumber: true })}
                    placeholder="10"
                    className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                  />
                  {errors.discountValue && (
                    <span className="text-[10px] font-bold text-red-500 block">{errors.discountValue.message}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    {...register('minOrderValue', { valueAsNumber: true })}
                    placeholder="499"
                    className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    {...register('maxDiscountCap', { valueAsNumber: true })}
                    placeholder="100"
                    className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    Valid From
                  </label>
                  <input
                    type="date"
                    {...register('validFrom')}
                    className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    {...register('validUntil')}
                    className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                  className="text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  className="text-xs font-bold"
                >
                  Save to Neon DB
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
