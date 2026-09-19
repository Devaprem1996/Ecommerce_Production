"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  MapPin, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Loader2,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { useAdminPincodes } from "@/hooks/useAdmin";
import { adminService, AdminPincode } from "@/services/admin.service";

// Zod Schema for Single Pincode
const pincodeSchema = z.object({
  pincode: z.string()
    .length(6, "Pincode must be exactly 6 digits")
    .regex(/^[0-9]+$/, "Pincode must contain only numbers"),
  city: z.string().min(2, "City name must be at least 2 characters"),
  state: z.string().min(2, "State name must be at least 2 characters"),
  estimatedDays: z.number().min(1, "Must be at least 1 day"),
  shippingCharge: z.number().min(0, "Cannot be negative"),
  freeDeliveryThreshold: z.number().min(0, "Cannot be negative"),
  available: z.boolean()
});

type PincodeFormData = z.infer<typeof pincodeSchema>;

export default function AdminPincodesPage() {
  const { data: rawPincodes = [], isLoading, isFetching, refetch } = useAdminPincodes();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPincode, setEditingPincode] = useState<AdminPincode | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingPin, setDeletingPin] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PincodeFormData>({
    resolver: zodResolver(pincodeSchema),
    defaultValues: {
      pincode: "",
      city: "",
      state: "Tamil Nadu",
      estimatedDays: 3,
      shippingCharge: 40,
      freeDeliveryThreshold: 499,
      available: true
    }
  });

  const states: string[] = useMemo(() => {
    const list = new Set<string>(rawPincodes.map((p) => p.state).filter(Boolean));
    return ["All", ...Array.from(list)];
  }, [rawPincodes]);

  const filteredPincodes = useMemo(() => {
    return rawPincodes.filter((p) => {
      const matchesSearch = 
        p.pincode.includes(searchTerm) || 
        p.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesState = selectedState === "All" || p.state === selectedState;
      return matchesSearch && matchesState;
    });
  }, [rawPincodes, searchTerm, selectedState]);

  const handleOpenCreate = () => {
    setEditingPincode(null);
    reset({
      pincode: "",
      city: "",
      state: "Tamil Nadu",
      estimatedDays: 3,
      shippingCharge: 40,
      freeDeliveryThreshold: 499,
      available: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (p: AdminPincode) => {
    setEditingPincode(p);
    reset({
      pincode: p.pincode,
      city: p.city,
      state: p.state,
      estimatedDays: p.estimatedDays || 3,
      shippingCharge: p.shippingCharge || 40,
      freeDeliveryThreshold: p.freeDeliveryThreshold || 499,
      available: p.available
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: PincodeFormData) => {
    setIsSubmitting(true);
    try {
      if (editingPincode) {
        await adminService.updatePincode(editingPincode.pincode, {
          available: data.available,
          estimatedDays: data.estimatedDays,
          shippingCharge: data.shippingCharge,
          freeDeliveryThreshold: data.freeDeliveryThreshold,
        });
        toast.success(`Pincode ${editingPincode.pincode} updated successfully.`);
      } else {
        await adminService.createPincode(data);
        toast.success(`Pincode ${data.pincode} added successfully.`);
      }

      await refetch();
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to persist pincode.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (pincode: string) => {
    if (!confirm(`Are you sure you want to remove delivery coverage for ${pincode}?`)) return;
    setDeletingPin(pincode);
    try {
      await adminService.deletePincode(pincode);
      toast.success(`Pincode ${pincode} removed.`);
      await refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove pincode.");
    } finally {
      setDeletingPin(null);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
              Pincodes & Serviceability
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary-500/10 text-primary-500 border border-primary-500/20">
              Serviceable Areas ({rawPincodes.length})
            </span>
          </div>
          <p className="text-xs font-semibold text-neutral-500 mt-1">
            Manage delivery thresholds, shipping fees, and service coverage in real-time.
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
            onClick={handleOpenCreate}
            className="text-xs font-bold w-full sm:w-auto justify-center"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Pincode
          </Button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 p-4 rounded-feature shadow-sm">
        
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-450" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search 6-digit Pincode or City..."
            className="w-full text-xs font-semibold pl-10 pr-4 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="relative">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full md:w-auto text-xs font-bold px-3 py-2 bg-white dark:bg-neutral-900 border rounded-card text-neutral-805 dark:text-white focus:outline-none cursor-pointer"
          >
            {states.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Table */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-150 dark:border-neutral-850 text-neutral-450 uppercase font-black tracking-wider">
                <th className="p-4">Pincode</th>
                <th className="p-4">City / Region</th>
                <th className="p-4">State</th>
                <th className="p-4">Est. Delivery</th>
                <th className="p-4">Shipping Fee</th>
                <th className="p-4">Free Delivery Over</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-850/60">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="p-4"><div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-28 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-12 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" /></td>
                    <td className="p-4"><div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-full" /></td>
                    <td className="p-4 text-right"><div className="h-6 w-12 bg-neutral-200 dark:bg-neutral-800 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : filteredPincodes.length > 0 ? (
                filteredPincodes.map((pin) => (
                  <tr key={pin.pincode} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/30">
                    <td className="p-4">
                      <span className="font-mono font-black text-sm text-neutral-900 dark:text-white">
                        {pin.pincode}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-neutral-850 dark:text-white">
                      {pin.city}
                    </td>
                    <td className="p-4 text-neutral-500 font-semibold">
                      {pin.state}
                    </td>
                    <td className="p-4 text-neutral-600 dark:text-neutral-300 font-medium">
                      {pin.estimatedDays} days
                    </td>
                    <td className="p-4 font-bold text-neutral-900 dark:text-white">
                      ₹{pin.shippingCharge ?? 40}
                    </td>
                    <td className="p-4 text-neutral-600 dark:text-neutral-300 font-bold">
                      ₹{pin.freeDeliveryThreshold ?? 499}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        pin.available ? 'bg-success/10 text-success' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {pin.available ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {pin.available ? 'Serviceable' : 'Suspended'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(pin)}
                          className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-primary-500 cursor-pointer"
                          title="Edit Serviceability"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(pin.pincode)}
                          disabled={deletingPin === pin.pincode}
                          className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-red-500 cursor-pointer disabled:opacity-50"
                          title="Remove Pincode"
                        >
                          {deletingPin === pin.pincode ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-10 text-center font-bold text-neutral-500">
                    No serviceable areas found matching the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature max-w-md w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500" />
                <span>{editingPincode ? `Edit Pincode ${editingPincode.pincode}` : 'Add Serviceable Pincode'}</span>
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-neutral-400 hover:text-neutral-600 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                  6-Digit Pincode *
                </label>
                <input
                  type="text"
                  {...register('pincode')}
                  disabled={!!editingPincode}
                  placeholder="600001"
                  className="w-full text-xs font-mono font-bold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none disabled:opacity-60"
                />
                {errors.pincode && (
                  <span className="text-[10px] font-bold text-red-500 block">{errors.pincode.message}</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    City *
                  </label>
                  <input
                    type="text"
                    {...register('city')}
                    disabled={!!editingPincode}
                    placeholder="Chennai"
                    className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none disabled:opacity-60"
                  />
                  {errors.city && (
                    <span className="text-[10px] font-bold text-red-500 block">{errors.city.message}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    State *
                  </label>
                  <input
                    type="text"
                    {...register('state')}
                    disabled={!!editingPincode}
                    placeholder="Tamil Nadu"
                    className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    Est. Days
                  </label>
                  <input
                    type="number"
                    {...register('estimatedDays', { valueAsNumber: true })}
                    className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    Ship Fee (₹)
                  </label>
                  <input
                    type="number"
                    {...register('shippingCharge', { valueAsNumber: true })}
                    className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                    Free Over (₹)
                  </label>
                  <input
                    type="number"
                    {...register('freeDeliveryThreshold', { valueAsNumber: true })}
                    className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="available"
                  {...register('available')}
                  className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                />
                <label htmlFor="available" className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Service Area Active (orders accepted)
                </label>
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
                  {editingPincode ? 'Update Pincode' : 'Save Pincode'}
                </Button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
