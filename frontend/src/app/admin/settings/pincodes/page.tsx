"use client";

import React, { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  MapPin, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Edit2, 
  Trash2, 
  X, 
  Upload, 
  Globe,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

// Zod Schema for Single Pincode
const pincodeSchema = z.object({
  pincode: z.string()
    .length(6, "Pincode must be exactly 6 digits")
    .regex(/^[0-9]+$/, "Pincode must contain only numbers"),
  city: z.string().min(2, "City name must be at least 2 characters"),
  state: z.string().min(2, "State name must be at least 2 characters"),
  deliveryDays: z.string().min(1, "Delivery Days range is required (e.g. 2-3)"),
  notes: z.string(),
  active: z.boolean()
});

type PincodeFormData = {
  pincode: string;
  city: string;
  state: string;
  deliveryDays: string;
  notes: string;
  active: boolean;
};

interface DeliveryPincode {
  id: string;
  pincode: string;
  city: string;
  state: string;
  deliveryDays: string;
  notes?: string;
  active: boolean;
}

const initialPincodes: DeliveryPincode[] = [
  { id: "pin-1", pincode: "600001", city: "Chennai", state: "Tamil Nadu", deliveryDays: "1-2", notes: "COD available", active: true },
  { id: "pin-2", pincode: "600040", city: "Chennai", state: "Tamil Nadu", deliveryDays: "2-3", notes: "", active: true },
  { id: "pin-3", pincode: "625001", city: "Madurai", state: "Tamil Nadu", deliveryDays: "3-4", notes: "", active: true },
  { id: "pin-4", pincode: "641001", city: "Coimbatore", state: "Tamil Nadu", deliveryDays: "2-4", notes: "No Sunday delivery", active: true },
  { id: "pin-5", pincode: "110001", city: "New Delhi", state: "Delhi", deliveryDays: "4-6", notes: "Standard flight dispatch only", active: true },
  { id: "pin-6", pincode: "999999", city: "Remote Island", state: "Unknown", deliveryDays: "7-10", notes: "Cash on delivery not available", active: false }
];

export default function AdminPincodesPage() {
  const [pincodes, setPincodes] = useState<DeliveryPincode[]>(initialPincodes);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("All");

  // Table Sort
  const [sortKey, setSortKey] = useState<"pincode" | "city" | "deliveryDays">("pincode");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // UI Panels/Tabs
  const [activeTab, setActiveTab] = useState<"single" | "csv" | "regional">("single");
  const [editingPin, setEditingPin] = useState<DeliveryPincode | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // CSV Simulation states
  const [csvContent, setCsvContent] = useState("");
  const [csvLogs, setCsvLogs] = useState<{ added: number; skipped: number; errors: number } | null>(null);

  // Regional selection states
  const [regState, setRegState] = useState("Tamil Nadu");
  const [regCity, setRegCity] = useState("Trichy");

  // React Hook Form for Single Pincode
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PincodeFormData>({
    resolver: zodResolver(pincodeSchema),
    defaultValues: {
      pincode: "",
      city: "",
      state: "Tamil Nadu",
      deliveryDays: "2-3",
      notes: "",
      active: true
    }
  });

  // Extract unique states for filters
  const uniqueStates = useMemo(() => {
    const list = new Set(pincodes.map(p => p.state));
    return ["All", ...Array.from(list)];
  }, [pincodes]);

  // Filtering & Sorting
  const filteredAndSortedPincodes = useMemo(() => {
    let result = pincodes.filter(p => {
      const matchesSearch = p.pincode.includes(searchTerm) ||
                            p.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesState = selectedState === "All" || p.state === selectedState;
      return matchesSearch && matchesState;
    });

    result.sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [pincodes, searchTerm, selectedState, sortKey, sortDirection]);

  const handleSort = (key: "pincode" | "city" | "deliveryDays") => {
    if (sortKey === key) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Actions
  const handleSingleSubmit = (data: PincodeFormData) => {
    // Check duplication
    if (pincodes.some(p => p.pincode === data.pincode)) {
      toast.error(`Pincode ${data.pincode} is already configured.`);
      return;
    }

    const newPin: DeliveryPincode = {
      ...data,
      id: "pin-" + Math.floor(Math.random() * 1000)
    };
    setPincodes(prev => [...prev, newPin]);
    toast.success(`Pincode ${data.pincode} added successfully!`);
    reset({
      pincode: "",
      city: "",
      state: "Tamil Nadu",
      deliveryDays: "2-3",
      notes: "",
      active: true
    });
  };

  // CSV Simulator
  const handleCsvUploadSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) {
      toast.warning("Please copy-paste CSV rows into the area first.");
      return;
    }

    const lines = csvContent.split("\n");
    let added = 0;
    let skipped = 0;
    let errors = 0;
    const newPins: DeliveryPincode[] = [];

    lines.forEach((line) => {
      const parts = line.split(",").map(p => p.trim());
      if (parts.length < 3) {
        errors++;
        return;
      }
      const [pinVal, cityVal, stateVal, daysVal] = parts;
      
      if (!/^[0-9]{6}$/.test(pinVal)) {
        errors++;
        return;
      }

      if (pincodes.some(p => p.pincode === pinVal) || newPins.some(p => p.pincode === pinVal)) {
        skipped++;
        return;
      }

      newPins.push({
        id: "pin-" + Math.floor(Math.random() * 10000),
        pincode: pinVal,
        city: cityVal,
        state: stateVal || "Tamil Nadu",
        deliveryDays: daysVal || "3-4",
        notes: "",
        active: true
      });
      added++;
    });

    if (newPins.length > 0) {
      setPincodes(prev => [...prev, ...newPins]);
    }

    setCsvLogs({ added, skipped, errors });
    toast.success(`Bulk processing finished. Created ${added} records.`);
  };

  // Regional Simulator
  const handleRegionalAutoAdd = () => {
    // Generate some mock pincodes based on selected city
    const mockDb: Record<string, string[]> = {
      "Trichy": ["620001", "620002", "620015", "620021"],
      "Salem": ["636001", "636002", "636007", "636012"],
      "Vellore": ["632001", "632004", "632011", "632014"]
    };

    const codes = mockDb[regCity] || ["600099", "600098"];
    let addedCount = 0;
    const addedPins: DeliveryPincode[] = [];

    codes.forEach(code => {
      if (!pincodes.some(p => p.pincode === code)) {
        addedPins.push({
          id: "pin-" + Math.floor(Math.random() * 1000),
          pincode: code,
          city: regCity,
          state: regState,
          deliveryDays: "3-4",
          notes: "Auto-configured via regional engine",
          active: true
        });
        addedCount++;
      }
    });

    if (addedPins.length > 0) {
      setPincodes(prev => [...prev, ...addedPins]);
    }

    toast.success(`Fetched India Post registry. Added ${addedCount} pincodes under ${regCity}, ${regState}.`);
  };

  // Edit Handlers
  const handleOpenEdit = (pin: DeliveryPincode) => {
    setEditingPin(pin);
    setEditModalOpen(true);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPin) return;

    setPincodes(prev => prev.map(p => p.id === editingPin.id ? editingPin : p));
    toast.success(`Delivery configs for ${editingPin.pincode} updated.`);
    setEditModalOpen(false);
  };

  const handleDelete = (id: string, pincode: string) => {
    if (confirm(`Remove delivery serviceability for pincode ${pincode}?`)) {
      setPincodes(prev => prev.filter(p => p.id !== id));
      toast.success(`Pincode ${pincode} removed.`);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-10">
      
      {/* Title Block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
            Delivery Zone Manager
          </h1>
          <p className="text-xs font-semibold text-neutral-500">
            Control serviceable shipping pincodes and local transit durations.
          </p>
        </div>
        <div className="bg-primary-500/10 border border-primary-500/20 px-4 py-2.5 rounded-feature text-xs font-bold text-primary-700 dark:text-primary-400 select-none">
          Total Active: {pincodes.filter(p => p.active).length} locations
        </div>
      </div>

      {/* Grid addition tabs (Left 40% Desktop) + List Table (Right 60%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ADD PANEL */}
        <div className="lg:col-span-5 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 shadow-sm space-y-5 text-left">
          <div className="border-b border-neutral-100 dark:border-neutral-800 pb-3 flex justify-between items-center select-none">
            <h3 className="font-bold text-xs text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-primary-500" />
              Service Coverage Setup
            </h3>
          </div>

          {/* Tabs header */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-50 dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-850 rounded-card text-[10px] font-black uppercase tracking-wider select-none">
            <button 
              onClick={() => setActiveTab("single")}
              className={`py-2 rounded-card border-none cursor-pointer transition-colors ${
                activeTab === "single" ? "bg-primary-500 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Single
            </button>
            <button 
              onClick={() => setActiveTab("csv")}
              className={`py-2 rounded-card border-none cursor-pointer transition-colors ${
                activeTab === "csv" ? "bg-primary-500 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              CSV Bulk
            </button>
            <button 
              onClick={() => setActiveTab("regional")}
              className={`py-2 rounded-card border-none cursor-pointer transition-colors ${
                activeTab === "regional" ? "bg-primary-500 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              Regional
            </button>
          </div>

          {/* TAB 1: Single Pincode Form */}
          {activeTab === "single" && (
            <form onSubmit={handleSubmit(handleSingleSubmit)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-450 uppercase tracking-widest block">Pincode *</label>
                <input
                  type="text"
                  maxLength={6}
                  {...register("pincode")}
                  placeholder="600001"
                  className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                {errors.pincode && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.pincode.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-450 uppercase tracking-widest block">City *</label>
                  <input
                    type="text"
                    {...register("city")}
                    placeholder="Chennai"
                    className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  {errors.city && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.city.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-neutral-450 uppercase tracking-widest block">State *</label>
                  <input
                    type="text"
                    {...register("state")}
                    className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-450 uppercase tracking-widest block">Delivery Days (e.g. 2-3) *</label>
                <input
                  type="text"
                  {...register("deliveryDays")}
                  placeholder="2-3"
                  className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                {errors.deliveryDays && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.deliveryDays.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-450 uppercase tracking-widest block">Delivery notes</label>
                <input
                  type="text"
                  {...register("notes")}
                  placeholder="COD not available, etc."
                  className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full font-bold text-xs py-2.5">
                Add Servicable Pincode
              </Button>
            </form>
          )}

          {/* TAB 2: CSV Bulk Simulation */}
          {activeTab === "csv" && (
            <form onSubmit={handleCsvUploadSimulate} className="space-y-4">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-card border border-dashed border-neutral-300 text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 select-none">
                <p className="font-bold flex items-center gap-1"><FileSpreadsheet className="w-4 h-4 text-primary-500" /> Template CSV Format:</p>
                <code className="block mt-1 font-mono bg-white dark:bg-neutral-900 p-1.5 rounded border border-neutral-100">
                  pincode,city,state,deliveryDays<br/>
                  620001,Trichy,Tamil Nadu,2-3<br/>
                  636001,Salem,Tamil Nadu,3-4
                </code>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-450 uppercase tracking-widest block">CSV copy-paste content</label>
                <textarea
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  placeholder="620001,Trichy,Tamil Nadu,2-3&#10;636001,Salem,Tamil Nadu,3-4"
                  rows={4}
                  className="w-full text-xs font-mono px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full font-bold text-xs py-2.5" leftIcon={<Upload className="w-4 h-4" />}>
                Process Bulk CSV
              </Button>

              {csvLogs && (
                <div className="bg-neutral-50 dark:bg-neutral-950 p-3 rounded-card border border-neutral-150 text-[10px] font-bold space-y-1 select-none">
                  <p className="text-green-500 uppercase">✓ Added: {csvLogs.added} codes</p>
                  <p className="text-amber-500 uppercase">⚠ Skipped: {csvLogs.skipped} duplicates</p>
                  <p className="text-red-500 uppercase">⨯ Errors: {csvLogs.errors} rows</p>
                </div>
              )}
            </form>
          )}

          {/* TAB 3: Regional Auto Add */}
          {activeTab === "regional" && (
            <div className="space-y-4">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-950 rounded-card border text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 select-none">
                Auto-add official pincodes from India Post databases for the selected municipality.
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-450 uppercase tracking-widest block">Select State</label>
                <select
                  value={regState}
                  onChange={(e) => setRegState(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 border rounded-card bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Karnataka">Karnataka</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-neutral-450 uppercase tracking-widest block">Select City Registry</label>
                <select
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 border rounded-card bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="Trichy">Trichy (4 pincodes)</option>
                  <option value="Salem">Salem (4 pincodes)</option>
                  <option value="Vellore">Vellore (4 pincodes)</option>
                </select>
              </div>

              <Button variant="primary" onClick={handleRegionalAutoAdd} className="w-full font-bold text-xs py-2.5" leftIcon={<Globe className="w-4 h-4" />}>
                Fetch & Populate Area
              </Button>
            </div>
          )}

        </div>

        {/* LIST TABLE CONTAINER (7 cols Desktop) */}
        <div className="lg:col-span-7 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 shadow-sm space-y-4">
          
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-450" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search pincode or city name..."
                className="w-full text-[11px] font-semibold pl-9 pr-4 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-450" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="text-[11px] font-bold pl-9 pr-8 py-2 bg-white dark:bg-neutral-900 border rounded-card text-neutral-805 dark:text-white focus:outline-none cursor-pointer"
              >
                {uniqueStates.map(st => (
                  <option key={st} value={st}>{st === "All" ? "All States" : st}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-150 dark:border-neutral-850 text-neutral-450 uppercase font-black tracking-wider">
                  <th className="p-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => handleSort("pincode")}>
                    Pincode <ArrowUpDown className="inline w-3 h-3 ml-0.5" />
                  </th>
                  <th className="p-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => handleSort("city")}>
                    City/State <ArrowUpDown className="inline w-3 h-3 ml-0.5" />
                  </th>
                  <th className="p-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => handleSort("deliveryDays")}>
                    Days <ArrowUpDown className="inline w-3 h-3 ml-0.5" />
                  </th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-850/60">
                {filteredAndSortedPincodes.length > 0 ? (
                  filteredAndSortedPincodes.map(item => (
                    <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/30">
                      <td className="p-3 font-mono font-black text-neutral-905 dark:text-white">
                        {item.pincode}
                      </td>

                      <td className="p-3">
                        <span className="font-bold text-neutral-800 dark:text-neutral-300 block">{item.city}</span>
                        <span className="text-[10px] text-neutral-450 font-bold block">{item.state}</span>
                      </td>

                      <td className="p-3 font-extrabold text-primary-600 dark:text-primary-400">
                        {item.deliveryDays} days
                      </td>

                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          item.active ? "bg-success/10 text-success" : "bg-red-500/10 text-red-500"
                        }`}>
                          {item.active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {item.active ? "Active" : "Disabled"}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1 rounded hover:bg-neutral-105 dark:hover:bg-neutral-800 text-neutral-500 hover:text-primary-500 cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.pincode)}
                            className="p-1 rounded hover:bg-neutral-105 dark:hover:bg-neutral-800 text-neutral-500 hover:text-red-500 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center font-bold text-neutral-400">
                      No serviceable delivery zones match your queries.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* EDIT INLINE MODAL */}
      {editModalOpen && editingPin && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/45 backdrop-blur-[2px] cursor-pointer" onClick={() => setEditModalOpen(false)} />
          
          <div className="relative w-full max-w-sm bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature shadow-2xl p-6 space-y-4 z-10 text-left">
            <div className="flex items-center justify-between border-b border-neutral-50 dark:border-neutral-850 pb-3 select-none">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-primary-500" />
                Configure Pincode {editingPin.pincode}
              </h3>
              <button onClick={() => setEditModalOpen(false)} className="text-neutral-500 hover:text-primary-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Delivery Days</label>
                <input
                  type="text"
                  required
                  value={editingPin.deliveryDays}
                  onChange={(e) => setEditingPin({ ...editingPin, deliveryDays: e.target.value })}
                  placeholder="2-3"
                  className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Internal notes</label>
                <input
                  type="text"
                  value={editingPin.notes || ""}
                  onChange={(e) => setEditingPin({ ...editingPin, notes: e.target.value })}
                  placeholder="COD not available, etc."
                  className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editActiveToggle"
                  checked={editingPin.active}
                  onChange={(e) => setEditingPin({ ...editingPin, active: e.target.checked })}
                  className="w-4 h-4 rounded text-primary-500 border-neutral-300 focus:ring-primary-500 cursor-pointer"
                />
                <label htmlFor="editActiveToggle" className="text-xs font-semibold text-neutral-750 dark:text-neutral-300 cursor-pointer select-none">
                  Enable Shipping Serviceability
                </label>
              </div>

              <Button type="submit" variant="primary" className="w-full font-bold text-xs py-2.5">
                Save configurations
              </Button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
