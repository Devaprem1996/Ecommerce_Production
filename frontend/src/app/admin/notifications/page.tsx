"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Bell, 
  Send, 
  Search, 
  Filter, 
  ArrowUpDown, 
  AlertTriangle, 
  Mail, 
  MessageSquare, 
  Smartphone,
  CheckCircle,
  Clock,
  Sparkles,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

// Zod validation for composing a campaign
const campaignSchema = z.object({
  title: z.string().min(3, "Campaign title must be at least 3 characters"),
  targetAudience: z.enum(["all_customers", "guests", "highly_active", "single_user"]),
  recipientDetail: z.string().optional(),
  channelWebPush: z.boolean().default(true),
  channelSms: z.boolean().default(false),
  channelEmail: z.boolean().default(false),
  content: z.string().min(5, "Message content must be at least 5 characters")
}).refine(data => {
  return data.channelWebPush || data.channelSms || data.channelEmail;
}, {
  message: "Select at least one delivery channel medium",
  path: ["channelWebPush"]
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface BroadcastLog {
  id: string;
  date: string;
  title: string;
  targetCount: number;
  channels: string[];
  openRate?: number;
  status: "Completed" | "Scheduled" | "Sending";
}

const initialBroadcasts: BroadcastLog[] = [
  {
    id: "bc-1",
    date: "2026-06-28 10:15",
    title: "Monsoon Organic Harvest Sale - 20% Off",
    targetCount: 1250,
    channels: ["SMS", "Email"],
    openRate: 48.5,
    status: "Completed"
  },
  {
    id: "bc-2",
    date: "2026-06-25 15:30",
    title: "Alert: Raw Mountain Honey Back In Stock",
    targetCount: 450,
    channels: ["Web Push", "Email"],
    openRate: 68.2,
    status: "Completed"
  },
  {
    id: "bc-3",
    date: "2026-07-03 09:00",
    title: "Weekly Organic Cooking Class Newsletter",
    targetCount: 3200,
    channels: ["Email"],
    status: "Scheduled"
  }
];

export default function AdminNotificationsPage() {
  const [broadcasts, setBroadcasts] = useState<BroadcastLog[]>(initialBroadcasts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChannelFilter, setSelectedChannelFilter] = useState("All");

  // Sorting
  const [sortKey, setSortKey] = useState<"date" | "title" | "targetCount">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // System alert toggles
  const [notifyLowStock, setNotifyLowStock] = useState(true);
  const [notifyReturns, setNotifyReturns] = useState(true);
  const [notifyAbandonment, setNotifyAbandonment] = useState(false);
  const [alertEmails, setAlertEmails] = useState("admin@aetherorganic.com, warehouse@aetherorganic.com");

  // Compose campaign hook
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      targetAudience: "all_customers",
      recipientDetail: "",
      channelWebPush: true,
      channelSms: false,
      channelEmail: false,
      content: ""
    }
  });

  const watchContent = watch("content") || "";
  const watchSmsChecked = watch("channelSms");
  const watchAudience = watch("targetAudience");

  // SMS DLT character counter details
  const smsCharCount = watchContent.length;
  const smsSegments = Math.ceil(smsCharCount / 160) || 1;

  // Sorting & Filtering
  const filteredAndSortedBroadcasts = useMemo(() => {
    let result = broadcasts.filter(b => {
      const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesChannel = selectedChannelFilter === "All" || 
                            b.channels.some(c => c.toLowerCase().includes(selectedChannelFilter.toLowerCase()));
      return matchesSearch && matchesChannel;
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
  }, [broadcasts, searchTerm, selectedChannelFilter, sortKey, sortDirection]);

  const handleSort = (key: "date" | "title" | "targetCount") => {
    if (sortKey === key) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleSendCampaign = (data: CampaignFormData) => {
    // Generate a mock target count based on target audience
    let targetCount = 1200;
    if (data.targetAudience === "guests") targetCount = 350;
    if (data.targetAudience === "highly_active") targetCount = 620;
    if (data.targetAudience === "single_user") targetCount = 1;

    const channels: string[] = [];
    if (data.channelWebPush) channels.push("Web Push");
    if (data.channelSms) channels.push("SMS");
    if (data.channelEmail) channels.push("Email");

    const newLog: BroadcastLog = {
      id: "bc-" + Math.floor(Math.random() * 1000),
      date: new Date().toISOString().replace("T", " ").substring(0, 16),
      title: data.title,
      targetCount,
      channels,
      status: "Sending"
    };

    setBroadcasts(prev => [newLog, ...prev]);
    toast.success(`Campaign "${data.title}" started broadcasting to ${targetCount} users.`);

    // Mock completion after 5 seconds
    setTimeout(() => {
      setBroadcasts(prev => prev.map(b => b.id === newLog.id ? { ...b, status: "Completed", openRate: 0.0 } : b));
    }, 5000);

    reset({
      title: "",
      targetAudience: "all_customers",
      recipientDetail: "",
      channelWebPush: true,
      channelSms: false,
      channelEmail: false,
      content: ""
    });
  };

  const handleSaveAlertSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("System and inventory alert emails updated successfully.");
  };

  return (
    <div className="space-y-8 font-sans pb-10">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
          Campaign Notification Center
        </h1>
        <p className="text-xs font-semibold text-neutral-500">
          Compose broadcast messages, control system threshold alerts, and analyze open-rate metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COMPOSER PANEL (Left 7 Columns Desktop) */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          {/* Campaign Composer Form */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-450 border-b pb-2 flex items-center gap-1.5 select-none">
              <Sparkles className="w-4 h-4 text-primary-500" />
              Composer Campaign Panel
            </h3>

            <form onSubmit={handleSubmit(handleSendCampaign)} className="space-y-4">
              {/* Campaign Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Campaign Title *</label>
                <input
                  type="text"
                  {...register("title")}
                  placeholder="e.g. Organic Millet Festival Launches Today"
                  className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                {errors.title && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.title.message as string}</p>}
              </div>

              {/* Target Segment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Target Audience *</label>
                  <select
                    {...register("targetAudience")}
                    className="w-full text-xs font-bold px-3 py-2 border rounded-card bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="all_customers">All Registered Customers</option>
                    <option value="guests">Guest Checkouts Only</option>
                    <option value="highly_active">Highly Active Buyers</option>
                    <option value="single_user">Single Phone/Email Target</option>
                  </select>
                </div>

                {watchAudience === "single_user" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Recipient Phone/Email *</label>
                    <input
                      type="text"
                      {...register("recipientDetail")}
                      placeholder="e.g. customer@domain.com"
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                )}
              </div>

              {/* Channels Selector */}
              <div className="space-y-2 select-none">
                <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Medium Channels *</label>
                <div className="flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                    <input type="checkbox" {...register("channelWebPush")} className="rounded text-primary-500" />
                    <span>Web Push Notification</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                    <input type="checkbox" {...register("channelSms")} className="rounded text-primary-500" />
                    <span>Transactional SMS</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                    <input type="checkbox" {...register("channelEmail")} className="rounded text-primary-500" />
                    <span>Email Newsletter</span>
                  </label>
                </div>
                {errors.channelWebPush && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.channelWebPush.message as string}</p>}
              </div>

              {/* Content Box */}
              <div className="space-y-1">
                <div className="flex justify-between items-center select-none">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Message content *</label>
                  {watchSmsChecked && (
                    <span className={`text-[10px] font-bold ${smsCharCount > 160 ? "text-amber-500" : "text-neutral-450"}`}>
                      SMS Characters: {smsCharCount} / 160 ({smsSegments} segment{smsSegments > 1 ? "s" : ""})
                    </span>
                  )}
                </div>
                <textarea
                  {...register("content")}
                  rows={4}
                  placeholder="Type promotional template content here..."
                  className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                {errors.content && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.content.message as string}</p>}
                
                {watchSmsChecked && smsCharCount > 160 && (
                  <div className="flex items-center gap-1.5 p-2 bg-amber-500/5 text-amber-500 border border-amber-500/10 rounded-card mt-2 text-[10px] font-bold select-none">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>DLT constraint: Messages exceeding 160 chars require multiple SMS segment balance charges.</span>
                  </div>
                )}
              </div>

              {/* Submit */}
              <Button type="submit" variant="primary" className="w-full font-bold text-xs py-3 mt-4" leftIcon={<Send className="w-4 h-4" />}>
                Broadcast Campaign Message
              </Button>
            </form>
          </div>

        </div>

        {/* SYSTEM ALERTS & HISTORY LOGS (Right 5 Columns Desktop) */}
        <div className="lg:col-span-5 space-y-6 text-left">
          
          {/* Inventory Alerts Config */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-neutral-450 border-b pb-2 flex items-center gap-1.5 select-none">
              <Settings className="w-4 h-4 text-primary-500" />
              System & Inventory Alerts
            </h3>

            <form onSubmit={handleSaveAlertSettings} className="space-y-4">
              <div className="space-y-2 select-none">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-750 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={notifyLowStock}
                    onChange={(e) => setNotifyLowStock(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-500 border-neutral-300 focus:ring-primary-500"
                  />
                  <span>Notify on Stock &lt;= 10 units</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-750 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={notifyReturns}
                    onChange={(e) => setNotifyReturns(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-500 border-neutral-300 focus:ring-primary-500"
                  />
                  <span>Notify on New Return/Refund Request</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-750 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={notifyAbandonment}
                    onChange={(e) => setNotifyAbandonment(e.target.checked)}
                    className="w-4 h-4 rounded text-primary-500 border-neutral-300 focus:ring-primary-500"
                  />
                  <span>Notify on Guest Abandonment (2 hours)</span>
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Recipient Admin Emails</label>
                <input
                  type="text"
                  value={alertEmails}
                  onChange={(e) => setAlertEmails(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <Button type="submit" variant="primary" className="w-full font-bold text-xs py-2 select-none">
                Update Alerts Config
              </Button>
            </form>
          </div>

        </div>

      </div>

      {/* BROADCAST HISTORY LOGS (Full Width Bottom) */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 shadow-sm space-y-4 text-left">
        <h3 className="text-xs font-black uppercase tracking-widest text-neutral-450 border-b pb-2 flex items-center gap-1.5 select-none">
          <Bell className="w-4 h-4 text-primary-500" />
          Broadcast History Log
        </h3>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-450" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search campaign titles..."
              className="w-full text-[11px] font-semibold pl-9 pr-4 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-450" />
            <select
              value={selectedChannelFilter}
              onChange={(e) => setSelectedChannelFilter(e.target.value)}
              className="text-[11px] font-bold pl-9 pr-8 py-2 bg-white dark:bg-neutral-900 border rounded-card text-neutral-805 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="All">All Channels</option>
              <option value="web push">Web Push</option>
              <option value="sms">SMS</option>
              <option value="email">Email</option>
            </select>
          </div>
        </div>

        {/* History Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-150 dark:border-neutral-850 text-neutral-450 uppercase font-black tracking-wider">
                <th className="p-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => handleSort("date")}>
                  Sent Date <ArrowUpDown className="inline w-3 h-3 ml-0.5" />
                </th>
                <th className="p-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => handleSort("title")}>
                  Campaign Title <ArrowUpDown className="inline w-3 h-3 ml-0.5" />
                </th>
                <th className="p-3 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800" onClick={() => handleSort("targetCount")}>
                  Target <ArrowUpDown className="inline w-3 h-3 ml-0.5" />
                </th>
                <th className="p-3">Channels</th>
                <th className="p-3">Open Rate</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-850/60 font-semibold">
              {filteredAndSortedBroadcasts.length > 0 ? (
                filteredAndSortedBroadcasts.map(item => (
                  <tr key={item.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-850/30">
                    <td className="p-3 text-[10px] text-neutral-500 font-mono">
                      {item.date}
                    </td>

                    <td className="p-3 text-neutral-850 dark:text-white font-bold">
                      {item.title}
                    </td>

                    <td className="p-3">
                      {item.targetCount} contacts
                    </td>

                    <td className="p-3">
                      <div className="flex gap-1.5 flex-wrap select-none">
                        {item.channels.map(ch => (
                          <span 
                            key={ch} 
                            className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-neutral-100 dark:bg-neutral-950 border text-neutral-500 uppercase flex items-center gap-1"
                          >
                            {ch === "Email" && <Mail className="w-3 h-3" />}
                            {ch === "SMS" && <Smartphone className="w-3 h-3" />}
                            {ch === "Web Push" && <Bell className="w-3 h-3" />}
                            {ch}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-3 text-primary-500 font-bold">
                      {item.openRate !== undefined ? `${item.openRate}%` : "—"}
                    </td>

                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        item.status === "Completed" ? "bg-success/10 text-success" :
                        item.status === "Scheduled" ? "bg-blue-500/10 text-blue-500" :
                        "bg-amber-500/10 text-amber-500 animate-pulse"
                      }`}>
                        {item.status === "Completed" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center font-bold text-neutral-400">
                    No broadcast logs match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
