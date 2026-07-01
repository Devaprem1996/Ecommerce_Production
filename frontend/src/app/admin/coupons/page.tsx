"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Ticket, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Edit2, 
  Trash2, 
  X, 
  TrendingUp, 
  Users, 
  Calendar,
  CheckCircle,
  XCircle,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

// Zod Validation Schema
const couponSchema = z.object({
  code: z.string()
    .min(3, "Code must be at least 3 characters")
    .max(15, "Code cannot exceed 15 characters")
    .regex(/^[A-Z0-9]+$/, "Code must contain only uppercase letters and numbers"),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed", "free_delivery"]),
  discountValue: z.preprocess((val) => Number(val), z.number().min(0, "Value cannot be negative")),
  maxDiscountCap: z.preprocess((val) => val === "" ? undefined : Number(val), z.number().min(0).optional()),
  minOrderValue: z.preprocess((val) => val === "" ? undefined : Number(val), z.number().min(0).optional()),
  validFrom: z.string().min(1, "Start date is required"),
  validUntil: z.string().min(1, "End date is required"),
  usageLimitTotal: z.preprocess((val) => val === "" ? undefined : Number(val), z.number().int().positive().optional()),
  usageLimitPerUser: z.preprocess((val) => val === "" ? undefined : Number(val), z.number().int().positive().optional()),
  firstOrderOnly: z.boolean().default(false),
  active: z.boolean().default(true)
}).refine(data => {
  return new Date(data.validUntil) >= new Date(data.validFrom);
}, {
  message: "End date must be after start date",
  path: ["validUntil"]
});

type CouponFormData = z.infer<typeof couponSchema>;

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed" | "free_delivery";
  discountValue: number;
  maxDiscountCap?: number;
  minOrderValue?: number;
  validFrom: string;
  validUntil: string;
  usageCount: number;
  usageLimitTotal?: number;
  usageLimitPerUser?: number;
  firstOrderOnly: boolean;
  active: boolean;
  revenueGenerated: number;
}

const initialCoupons: Coupon[] = [
  {
    id: "coup-1",
    code: "FRESH20",
    description: "20% off on all organic vegetables and greens",
    discountType: "percentage",
    discountValue: 20,
    maxDiscountCap: 150,
    minOrderValue: 499,
    validFrom: "2026-06-01",
    validUntil: "2026-12-31",
    usageCount: 45,
    usageLimitTotal: 100,
    usageLimitPerUser: 1,
    firstOrderOnly: false,
    active: true,
    revenueGenerated: 24500
  },
  {
    id: "coup-2",
    code: "FLAT50",
    description: "Flat ₹50 off on order totals",
    discountType: "fixed",
    discountValue: 50,
    minOrderValue: 299,
    validFrom: "2026-06-15",
    validUntil: "2026-08-30",
    usageCount: 23,
    usageLimitPerUser: 2,
    firstOrderOnly: false,
    active: true,
    revenueGenerated: 12800
  },
  {
    id: "coup-3",
    code: "FREESHIP",
    description: "Free home delivery on organic spices",
    discountType: "free_delivery",
    discountValue: 0,
    minOrderValue: 199,
    validFrom: "2026-01-01",
    validUntil: "2026-06-30",
    usageCount: 200,
    usageLimitTotal: 200,
    firstOrderOnly: false,
    active: false,
    revenueGenerated: 42000
  }
];

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  
  // Table sorting
  const [sortKey, setSortKey] = useState<"code" | "discountValue" | "usageCount">("code");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Modal / Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // React Hook Form
  const { register, handleSubmit, setValue, watch, reset, formState: { errors: rawErrors } } = useForm<any>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      maxDiscountCap: undefined,
      minOrderValue: undefined,
      validFrom: new Date().toISOString().split("T")[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      usageLimitTotal: undefined,
      usageLimitPerUser: 1,
      firstOrderOnly: false,
      active: true
    }
  });

  const errors = rawErrors as any;

  const watchDiscountType = watch("discountType");

  // Statistics
  const stats = useMemo(() => {
    const active = coupons.filter(c => c.active).length;
    const totalUses = coupons.reduce((sum, c) => sum + c.usageCount, 0);
    const totalRevenue = coupons.reduce((sum, c) => sum + c.revenueGenerated, 0);
    return { active, totalUses, totalRevenue };
  }, [coupons]);

  // Filtering & Sorting
  const filteredAndSortedCoupons = useMemo(() => {
    let result = coupons.filter(c => {
      const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (c.description || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "All" || c.discountType === selectedType;
      return matchesSearch && matchesType;
    });

    result.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [coupons, searchTerm, selectedType, sortKey, sortDirection]);

  const handleSort = (key: "code" | "discountValue" | "usageCount") => {
    if (sortKey === key) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    reset({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      maxDiscountCap: undefined,
      minOrderValue: undefined,
      validFrom: new Date().toISOString().split("T")[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      usageLimitTotal: undefined,
      usageLimitPerUser: 1,
      firstOrderOnly: false,
      active: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    reset({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountCap: coupon.maxDiscountCap,
      minOrderValue: coupon.minOrderValue,
      validFrom: coupon.validFrom,
      validUntil: coupon.validUntil,
      usageLimitTotal: coupon.usageLimitTotal,
      usageLimitPerUser: coupon.usageLimitPerUser,
      firstOrderOnly: coupon.firstOrderOnly,
      active: coupon.active
    });
    setModalOpen(true);
  };

  const handleFormSubmit = (data: CouponFormData) => {
    if (editingCoupon) {
      // Edit
      setCoupons(prev => prev.map(c => c.id === editingCoupon.id ? {
        ...c,
        ...data,
        discountValue: data.discountType === "free_delivery" ? 0 : data.discountValue
      } : c));
      toast.success(`Coupon ${data.code} updated successfully!`);
    } else {
      // Add
      const newCoupon: Coupon = {
        ...data,
        id: "coup-" + Math.floor(Math.random() * 1000),
        usageCount: 0,
        discountValue: data.discountType === "free_delivery" ? 0 : data.discountValue,
        revenueGenerated: 0
      };
      setCoupons(prev => [...prev, newCoupon]);
      toast.success(`Coupon ${data.code} created!`);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Are you sure you want to delete coupon "${code}"?`)) {
      setCoupons(prev => prev.filter(c => c.id !== id));
      toast.success(`Coupon "${code}" deleted.`);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-10">
      
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
            Coupons & Offers
          </h1>
          <p className="text-xs font-semibold text-neutral-500">
            Define promotional coupon structures and check customer response metrics.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenAdd}
          className="text-xs font-bold w-full sm:w-auto justify-center"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Coupon
        </Button>
      </div>

      {/* Stats Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Active Coupons */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 p-5 rounded-feature shadow-sm flex items-center gap-4 select-none">
          <div className="p-3 bg-green-500/5 text-green-500 rounded-full border border-green-500/10">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-widest block">Active Coupons</span>
            <span className="text-xl font-black font-heading text-neutral-905 dark:text-white mt-1 block">
              {stats.active}
            </span>
          </div>
        </div>

        {/* Total Uses */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 p-5 rounded-feature shadow-sm flex items-center gap-4 select-none">
          <div className="p-3 bg-amber-500/5 text-amber-500 rounded-full border border-amber-500/10">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-widest block">Redemptions</span>
            <span className="text-xl font-black font-heading text-neutral-905 dark:text-white mt-1 block">
              {stats.totalUses}
            </span>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 p-5 rounded-feature shadow-sm flex items-center gap-4 select-none">
          <div className="p-3 bg-primary-500/5 text-primary-500 rounded-full border border-primary-500/10">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-widest block">Coupon Revenue</span>
            <span className="text-xl font-black font-heading text-primary-600 dark:text-primary-400 mt-1 block">
              ₹{stats.totalRevenue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 p-4 rounded-feature shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-450" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search code or description..."
            className="w-full text-xs font-semibold pl-10 pr-4 py-2 bg-transparent border border-neutral-200 dark:border-neutral-700 rounded-card text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-auto">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-450" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full md:w-auto text-xs font-bold pl-10 pr-8 py-2 bg-white dark:bg-neutral-900 border rounded-card text-neutral-800 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Discount</option>
              <option value="free_delivery">Free Delivery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Coupon Data List Grid */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-150 dark:border-neutral-850 text-neutral-450 uppercase font-black tracking-wider">
                <th className="p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => handleSort("code")}>
                  Coupon Code <ArrowUpDown className="inline w-3 h-3 ml-0.5" />
                </th>
                <th className="p-4">Type</th>
                <th className="p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => handleSort("discountValue")}>
                  Value <ArrowUpDown className="inline w-3 h-3 ml-0.5" />
                </th>
                <th className="p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => handleSort("usageCount")}>
                  Redemptions <ArrowUpDown className="inline w-3 h-3 ml-0.5" />
                </th>
                <th className="p-4">Validity</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-850/60">
              {filteredAndSortedCoupons.length > 0 ? (
                filteredAndSortedCoupons.map(coupon => {
                  const isExpired = new Date(coupon.validUntil) < new Date();
                  
                  return (
                    <tr key={coupon.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/30">
                      <td className="p-4 font-black text-neutral-905 dark:text-white">
                        <span className="flex items-center gap-1.5 font-mono">
                          <Ticket className="w-3.5 h-3.5 text-primary-500" />
                          {coupon.code}
                        </span>
                        <span className="text-[10px] text-neutral-450 font-normal block mt-1 leading-normal max-w-xs">{coupon.description}</span>
                      </td>

                      <td className="p-4 capitalize font-semibold">
                        {coupon.discountType.replace("_", " ")}
                      </td>

                      <td className="p-4 font-black">
                        {coupon.discountType === "percentage" && `${coupon.discountValue}%`}
                        {coupon.discountType === "fixed" && `₹${coupon.discountValue}`}
                        {coupon.discountType === "free_delivery" && "₹0 (Free)"}
                      </td>

                      <td className="p-4 font-bold">
                        {coupon.usageCount} {coupon.usageLimitTotal ? `/ ${coupon.usageLimitTotal}` : "/ Unlimited"}
                      </td>

                      <td className="p-4 font-semibold text-neutral-500">
                        <span className="flex items-center gap-1 text-[10px]">
                          <Calendar className="w-3.5 h-3.5" />
                          {coupon.validFrom} to {coupon.validUntil}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          coupon.active && !isExpired
                            ? "bg-success/10 text-success"
                            : "bg-red-500/10 text-red-500"
                        }`}>
                          {coupon.active && !isExpired ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {isExpired ? "Expired" : coupon.active ? "Active" : "Disabled"}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => handleOpenEdit(coupon)}
                            className="p-1.5 rounded hover:bg-neutral-105 dark:hover:bg-neutral-800 text-neutral-500 hover:text-primary-500 cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(coupon.id, coupon.code)}
                            className="p-1.5 rounded hover:bg-neutral-105 dark:hover:bg-neutral-800 text-neutral-500 hover:text-red-500 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-10 text-center font-bold text-neutral-400">
                    No offers or coupons matches your search parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT DIALOG */}
      {modalOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-[2px] cursor-pointer" onClick={() => setModalOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature shadow-2xl p-6 space-y-4 z-10 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-neutral-50 dark:border-neutral-850 pb-3">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary-500" />
                {editingCoupon ? "Edit Coupon details" : "Create New Coupon"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-neutral-500 hover:text-primary-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 text-left">
              
              {/* Code */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  {...register("code")}
                  placeholder="FRESH20"
                  className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-905 dark:text-white uppercase focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                {errors.code && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.code.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                  Description / Internal note
                </label>
                <textarea
                  {...register("description")}
                  placeholder="20% off on all fresh spices..."
                  rows={2}
                  className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    Discount Type *
                  </label>
                  <select
                    {...register("discountType")}
                    className="w-full text-xs font-bold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-white dark:bg-neutral-900 text-neutral-805 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed">Fixed Amount Off (₹)</option>
                    <option value="free_delivery">Free Delivery</option>
                  </select>
                </div>

                {watchDiscountType !== "free_delivery" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                      Value *
                    </label>
                    <input
                      type="number"
                      {...register("discountValue")}
                      className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.discountValue && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.discountValue.message}</p>}
                  </div>
                )}
              </div>

              {/* Caps & Minimum Orders */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    {...register("maxDiscountCap")}
                    placeholder="None"
                    className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    Min Order Value (₹)
                  </label>
                  <input
                    type="number"
                    {...register("minOrderValue")}
                    placeholder="None"
                    className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    Valid From *
                  </label>
                  <input
                    type="date"
                    {...register("validFrom")}
                    className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  {errors.validFrom && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.validFrom.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    Valid Until *
                  </label>
                  <input
                    type="date"
                    {...register("validUntil")}
                    className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  {errors.validUntil && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.validUntil.message}</p>}
                </div>
              </div>

              {/* Usage limits */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    Total Usage Cap
                  </label>
                  <input
                    type="number"
                    {...register("usageLimitTotal")}
                    placeholder="Unlimited"
                    className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    Limit Per Customer
                  </label>
                  <input
                    type="number"
                    {...register("usageLimitPerUser")}
                    className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-750 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    {...register("firstOrderOnly")}
                    className="w-4 h-4 rounded text-primary-500 border-neutral-300 focus:ring-primary-500"
                  />
                  <span>First Order Only</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-750 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    {...register("active")}
                    className="w-4 h-4 rounded text-primary-500 border-neutral-300 focus:ring-primary-500"
                  />
                  <span>Enabled (Active)</span>
                </label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                className="w-full font-bold text-xs py-3 mt-4"
              >
                {editingCoupon ? "Save Changes" : "Publish Offer Coupon"}
              </Button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
