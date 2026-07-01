"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Settings, 
  CreditCard, 
  Truck, 
  Mail, 
  MessageSquare, 
  Search, 
  Share2, 
  AlertOctagon, 
  Save, 
  PlayCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

// Zod schemas for all tabs
const settingsSchema = z.object({
  // Tab 1: General
  siteName: z.string().min(2, "Site Name must be at least 2 characters"),
  siteTagline: z.string().optional(),
  logoUrl: z.string().url("Must be a valid URL").or(z.literal("")),
  faviconUrl: z.string().url("Must be a valid URL").or(z.literal("")),
  contactEmail: z.string().email("Invalid contact email"),
  contactPhone: z.string().min(10, "Phone number is too short"),
  whatsappNumber: z.string().min(10, "WhatsApp number is too short"),
  businessAddress: z.string().min(5, "Address must be detailed"),
  gmapsEmbedUrl: z.string().optional(),
  businessHours: z.string().default("Mon-Sat: 9 AM - 6 PM"),

  // Tab 2: Payment
  paymentGateway: z.enum(["razorpay", "payu", "stripe"]),
  apiKey: z.string().min(1, "API Key is required"),
  apiSecret: z.string().min(1, "API Secret is required"),
  testMode: z.boolean().default(true),
  paymentUpi: z.boolean().default(true),
  paymentCard: z.boolean().default(true),
  paymentNetbanking: z.boolean().default(true),
  paymentCod: z.boolean().default(true),
  paymentWallets: z.boolean().default(true),
  codExtraCharge: z.preprocess((val) => Number(val), z.number().min(0)),

  // Tab 3: Delivery
  freeDeliveryThreshold: z.preprocess((val) => Number(val), z.number().min(0)),
  defaultDeliveryCharge: z.preprocess((val) => Number(val), z.number().min(0)),
  sameDayCutoff: z.string().default("14:00"),
  orderProcessingDays: z.string().default("Mon-Sat"),
  holidays: z.string().optional(),

  // Tab 4: Email
  smtpHost: z.string().min(1, "SMTP Host is required"),
  smtpPort: z.preprocess((val) => Number(val), z.number().int().positive()),
  smtpUsername: z.string().min(1, "SMTP Username is required"),
  smtpPassword: z.string().min(1, "SMTP Password is required"),
  fromEmail: z.string().email("Invalid from email"),
  fromName: z.string().min(1, "From Name is required"),

  // Tab 5: SMS
  smsProvider: z.enum(["twilio", "msg91", "textlocal"]),
  smsApiKey: z.string().min(1, "SMS API Key is required"),
  smsSenderId: z.string().min(1, "SMS Sender ID is required"),

  // Tab 6: SEO
  defaultMetaTitle: z.string().min(1, "Default meta title is required"),
  defaultMetaDescription: z.string().min(10, "Meta description must be longer"),
  googleAnalyticsId: z.string().optional(),
  facebookPixelId: z.string().optional(),
  robotsTxt: z.string().default("User-agent: *\nDisallow: /admin"),

  // Tab 7: Social Media
  facebookUrl: z.string().url("Must be a valid URL").or(z.literal("")),
  instagramUrl: z.string().url("Must be a valid URL").or(z.literal("")),
  twitterUrl: z.string().url("Must be a valid URL").or(z.literal("")),
  youtubeUrl: z.string().url("Must be a valid URL").or(z.literal("")),

  // Tab 8: Maintenance
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().default("Our store is undergoing scheduled farm harvest updates. We will be back shortly!"),
  expectedBackTime: z.string().optional(),
  allowedIps: z.string().optional()
});

type SettingsData = z.infer<typeof settingsSchema>;

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "general" | "payment" | "delivery" | "email" | "sms" | "seo" | "social" | "maintenance"
  >("general");

  const [showApiSecret, setShowApiSecret] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);

  // Initialize form with mock config defaults
  const { register, handleSubmit, watch, formState: { errors: rawErrors, isDirty } } = useForm<any>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: "Aether Organic",
      siteTagline: "Farm Fresh Organic Produce Delivered To Your Doorstep",
      logoUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400",
      faviconUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=32",
      contactEmail: "care@aetherorganic.com",
      contactPhone: "+91 9876543210",
      whatsappNumber: "+91 9876543210",
      businessAddress: "No. 42, Organic Green Fields, Alwarpet, Chennai, Tamil Nadu - 600018",
      gmapsEmbedUrl: "https://maps.google.com/...",
      businessHours: "Mon-Sat: 9 AM - 6 PM",

      paymentGateway: "razorpay",
      apiKey: "rzp_test_K2l4O0x3j1m5P8",
      apiSecret: "d8f07h1j3k5l7m9n2p4r",
      testMode: true,
      paymentUpi: true,
      paymentCard: true,
      paymentNetbanking: true,
      paymentCod: true,
      paymentWallets: true,
      codExtraCharge: 30,

      freeDeliveryThreshold: 499,
      defaultDeliveryCharge: 50,
      sameDayCutoff: "14:00",
      orderProcessingDays: "Mon-Sat",
      holidays: "2026-08-15, 2026-10-02, 2026-12-25",

      smtpHost: "smtp.mailgun.org",
      smtpPort: 587,
      smtpUsername: "postmaster@aetherorganic.com",
      smtpPassword: "smtpSecretPassword123!",
      fromEmail: "orders@aetherorganic.com",
      fromName: "Aether Organic Store",

      smsProvider: "twilio",
      smsApiKey: "SKdf80sh3jkf29hs81j3k9f02s",
      smsSenderId: "AETHOR",

      defaultMetaTitle: "Aether Organic - Order Farm Fresh Spices & Honey Online",
      defaultMetaDescription: "Buy standard lab-tested 100% organic honey, cold-pressed oils, and farm vegetables in Chennai. Best local quality guaranteed.",
      googleAnalyticsId: "G-AETH99XX",
      facebookPixelId: "FB-PX-12345",
      robotsTxt: "User-agent: *\nDisallow: /admin\nDisallow: /api",

      facebookUrl: "https://facebook.com/aetherorganic",
      instagramUrl: "https://instagram.com/aetherorganic",
      twitterUrl: "https://twitter.com/aetherorganic",
      youtubeUrl: "https://youtube.com/aetherorganic",

      maintenanceMode: false,
      maintenanceMessage: "Our store is undergoing scheduled farm harvest updates. We will be back shortly!",
      expectedBackTime: "2026-07-02T12:00:00+05:30",
      allowedIps: "127.0.0.1, 192.168.1.100"
    }
  });

  const errors = rawErrors as any;

  const onSave = (data: SettingsData) => {
    // Simulate API storage call
    toast.success("Configurations saved successfully! Site settings are hot-reloaded.");
  };

  const handleTestEmail = () => {
    toast.info("Sending test dispatch via configured SMTP mailers... Check logs!");
  };

  const handleTestSms = () => {
    toast.info("Triggering test SMS payload to configured SMS gateway credentials...");
  };

  const tabItems = [
    { id: "general", label: "General", icon: Settings },
    { id: "payment", label: "Payments", icon: CreditCard },
    { id: "delivery", label: "Shipping", icon: Truck },
    { id: "email", label: "Email SMTP", icon: Mail },
    { id: "sms", label: "SMS API", icon: MessageSquare },
    { id: "seo", label: "SEO Configs", icon: Search },
    { id: "social", label: "Social", icon: Share2 },
    { id: "maintenance", label: "Maintenance", icon: AlertOctagon }
  ] as const;

  return (
    <div className="space-y-8 font-sans pb-10">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
          Site Configurations
        </h1>
        <p className="text-xs font-semibold text-neutral-500">
          Modify store settings, delivery thresholds, SEO meta logs, and maintenance toggles.
        </p>
      </div>

      {/* Grid: Navigation Sidebar (Left 25%) + Active View Panel (Right 75%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* TAB NAVIGATION SIDEBAR */}
        <div className="lg:col-span-3 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-4 shadow-sm space-y-1 select-none">
          {tabItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-card text-xs font-bold uppercase tracking-wider transition-colors border-none cursor-pointer text-left ${
                  isActive 
                    ? "bg-primary-500 text-white shadow-sm" 
                    : "text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-950 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* ACTIVE FORM VIEW */}
        <div className="lg:col-span-9 bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-850 rounded-feature p-6 shadow-sm text-left">
          
          <form onSubmit={handleSubmit(onSave)} className="space-y-6">
            
            {/* TAB 1: GENERAL SETTINGS */}
            {activeTab === "general" && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-450 border-b pb-2 flex items-center gap-1.5 select-none">
                  General Shop Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Site Name *</label>
                    <input
                      type="text"
                      {...register("siteName")}
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.siteName && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.siteName.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Site Tagline</label>
                    <input
                      type="text"
                      {...register("siteTagline")}
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Site Logo URL</label>
                    <input
                      type="text"
                      {...register("logoUrl")}
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.logoUrl && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.logoUrl.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Favicon URL</label>
                    <input
                      type="text"
                      {...register("faviconUrl")}
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.faviconUrl && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.faviconUrl.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Contact Email *</label>
                    <input
                      type="email"
                      {...register("contactEmail")}
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.contactEmail && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.contactEmail.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Contact Phone *</label>
                    <input
                      type="text"
                      {...register("contactPhone")}
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.contactPhone && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.contactPhone.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">WhatsApp Support *</label>
                    <input
                      type="text"
                      {...register("whatsappNumber")}
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.whatsappNumber && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.whatsappNumber.message}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Business Address</label>
                  <textarea
                    {...register("businessAddress")}
                    rows={2}
                    className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  {errors.businessAddress && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.businessAddress.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Google Maps Embed URL</label>
                    <input
                      type="text"
                      {...register("gmapsEmbedUrl")}
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Business Hours</label>
                    <input
                      type="text"
                      {...register("businessHours")}
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PAYMENT SETTINGS */}
            {activeTab === "payment" && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-450 border-b pb-2 flex items-center gap-1.5 select-none">
                  Payment Gateway Settings
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Gateway Provider *</label>
                    <select
                      {...register("paymentGateway")}
                      className="w-full text-xs font-bold px-3 py-2 border rounded-card bg-white dark:bg-neutral-900 text-neutral-808 dark:text-white focus:outline-none cursor-pointer"
                    >
                      <option value="razorpay">Razorpay</option>
                      <option value="stripe">Stripe</option>
                      <option value="payu">PayU</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-5 select-none">
                    <input
                      type="checkbox"
                      id="testModeToggle"
                      {...register("testMode")}
                      className="w-4 h-4 rounded text-primary-500 border-neutral-300 focus:ring-primary-500 cursor-pointer"
                    />
                    <label htmlFor="testModeToggle" className="text-xs font-semibold text-neutral-750 dark:text-neutral-300 cursor-pointer">
                      Sandbox Test Mode Enabled
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">API Public Key *</label>
                    <input
                      type="text"
                      {...register("apiKey")}
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.apiKey && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.apiKey.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">API Secret Key *</label>
                    <div className="relative">
                      <input
                        type={showApiSecret ? "text" : "password"}
                        {...register("apiSecret")}
                        className="w-full text-xs font-semibold pl-3 pr-10 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiSecret(!showApiSecret)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 border-none bg-transparent cursor-pointer"
                      >
                        {showApiSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.apiSecret && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.apiSecret.message}</p>}
                  </div>
                </div>

                <div className="space-y-2 select-none">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Enabled Methods</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                      <input type="checkbox" {...register("paymentUpi")} className="rounded text-primary-500" />
                      <span>UPI</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                      <input type="checkbox" {...register("paymentCard")} className="rounded text-primary-500" />
                      <span>Credit Card</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                      <input type="checkbox" {...register("paymentNetbanking")} className="rounded text-primary-500" />
                      <span>Netbanking</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                      <input type="checkbox" {...register("paymentCod")} className="rounded text-primary-500" />
                      <span>COD</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                      <input type="checkbox" {...register("paymentWallets")} className="rounded text-primary-500" />
                      <span>Wallets</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Cash on Delivery Surcharge (₹)</label>
                  <input
                    type="number"
                    {...register("codExtraCharge")}
                    className="w-full sm:w-1/3 text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  {errors.codExtraCharge && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.codExtraCharge.message}</p>}
                </div>
              </div>
            )}

            {/* TAB 3: DELIVERY SETTINGS */}
            {activeTab === "delivery" && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-450 border-b pb-2 flex items-center gap-1.5 select-none">
                  Delivery Configs
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Free Delivery Threshold (₹) *</label>
                    <input
                      type="number"
                      {...register("freeDeliveryThreshold")}
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.freeDeliveryThreshold && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.freeDeliveryThreshold.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Default Base Delivery Charge (₹) *</label>
                    <input
                      type="number"
                      {...register("defaultDeliveryCharge")}
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.defaultDeliveryCharge && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.defaultDeliveryCharge.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Same-day cutoff time</label>
                    <input
                      type="text"
                      {...register("sameDayCutoff")}
                      placeholder="14:00"
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Processing Days Range</label>
                    <input
                      type="text"
                      {...register("orderProcessingDays")}
                      placeholder="Mon-Sat"
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Excluded Holidays (Comma separated dates)</label>
                  <input
                    type="text"
                    {...register("holidays")}
                    placeholder="YYYY-MM-DD, YYYY-MM-DD"
                    className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: EMAIL SETTINGS */}
            {activeTab === "email" && (
              <div className="space-y-4">
                <div className="border-b pb-2 flex justify-between items-center select-none">
                  <h3 className="text-xs font-black uppercase tracking-widest text-neutral-450 flex items-center gap-1.5">
                    SMTP Server Mailer Configuration
                  </h3>
                  <button
                    type="button"
                    onClick={handleTestEmail}
                    className="text-[10px] font-black uppercase tracking-widest bg-primary-500/10 text-primary-500 hover:bg-primary-500/25 px-2.5 py-1 rounded border border-primary-500/20 cursor-pointer"
                  >
                    Send Test Email
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">SMTP Host Server *</label>
                    <input
                      type="text"
                      {...register("smtpHost")}
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.smtpHost && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.smtpHost.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">SMTP Port *</label>
                    <input
                      type="number"
                      {...register("smtpPort")}
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.smtpPort && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.smtpPort.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">SMTP Username *</label>
                    <input
                      type="text"
                      {...register("smtpUsername")}
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.smtpUsername && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.smtpUsername.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">SMTP Password *</label>
                    <div className="relative">
                      <input
                        type={showSmtpPassword ? "text" : "password"}
                        {...register("smtpPassword")}
                        className="w-full text-xs font-semibold pl-3 pr-10 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-900 border-none bg-transparent cursor-pointer"
                      >
                        {showSmtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.smtpPassword && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.smtpPassword.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">From Email Address *</label>
                    <input
                      type="email"
                      {...register("fromEmail")}
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.fromEmail && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.fromEmail.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Sender Name / Title *</label>
                    <input
                      type="text"
                      {...register("fromName")}
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.fromName && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.fromName.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: SMS SETTINGS */}
            {activeTab === "sms" && (
              <div className="space-y-4">
                <div className="border-b pb-2 flex justify-between items-center select-none">
                  <h3 className="text-xs font-black uppercase tracking-widest text-neutral-450 flex items-center gap-1.5">
                    SMS Gateway Providers
                  </h3>
                  <button
                    type="button"
                    onClick={handleTestSms}
                    className="text-[10px] font-black uppercase tracking-widest bg-primary-500/10 text-primary-500 hover:bg-primary-500/25 px-2.5 py-1 rounded border border-primary-500/20 cursor-pointer"
                  >
                    Send Test SMS
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">SMS API Provider *</label>
                    <select
                      {...register("smsProvider")}
                      className="w-full text-xs font-bold px-3 py-2 border rounded-card bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white focus:outline-none cursor-pointer"
                    >
                      <option value="twilio">Twilio SMS</option>
                      <option value="msg91">MSG91</option>
                      <option value="textlocal">Textlocal</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">API Credential Token *</label>
                    <input
                      type="password"
                      {...register("smsApiKey")}
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.smsApiKey && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.smsApiKey.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Sender ID / DLT Header *</label>
                    <input
                      type="text"
                      {...register("smsSenderId")}
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.smsSenderId && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.smsSenderId.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: SEO SETTINGS */}
            {activeTab === "seo" && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-450 border-b pb-2 flex items-center gap-1.5 select-none">
                  SEO & Meta Properties
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Default Site Title *</label>
                    <input
                      type="text"
                      {...register("defaultMetaTitle")}
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.defaultMetaTitle && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.defaultMetaTitle.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Google Analytics ID</label>
                    <input
                      type="text"
                      {...register("googleAnalyticsId")}
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Facebook Pixel ID</label>
                    <input
                      type="text"
                      {...register("facebookPixelId")}
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Default Meta Description *</label>
                  <textarea
                    {...register("defaultMetaDescription")}
                    rows={2}
                    className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                  {errors.defaultMetaDescription && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.defaultMetaDescription.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Robots.txt Editor</label>
                  <textarea
                    {...register("robotsTxt")}
                    rows={3}
                    className="w-full text-xs font-mono px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
            )}

            {/* TAB 7: SOCIAL MEDIA URLs */}
            {activeTab === "social" && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-450 border-b pb-2 flex items-center gap-1.5 select-none">
                  Social Media Links
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Facebook URL</label>
                    <input
                      type="text"
                      {...register("facebookUrl")}
                      placeholder="https://facebook.com/..."
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.facebookUrl && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.facebookUrl.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Instagram URL</label>
                    <input
                      type="text"
                      {...register("instagramUrl")}
                      placeholder="https://instagram.com/..."
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.instagramUrl && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.instagramUrl.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Twitter/X URL</label>
                    <input
                      type="text"
                      {...register("twitterUrl")}
                      placeholder="https://twitter.com/..."
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.twitterUrl && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.twitterUrl.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">YouTube URL</label>
                    <input
                      type="text"
                      {...register("youtubeUrl")}
                      placeholder="https://youtube.com/..."
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.youtubeUrl && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.youtubeUrl.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 8: MAINTENANCE MODE */}
            {activeTab === "maintenance" && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-450 border-b pb-2 flex items-center gap-1.5 select-none">
                  Global Maintenance Settings
                </h3>

                <div className="flex items-center gap-2 pt-1 select-none">
                  <input
                    type="checkbox"
                    id="maintenanceModeSwitch"
                    {...register("maintenanceMode")}
                    className="w-4 h-4 rounded text-red-500 border-neutral-300 focus:ring-red-500 cursor-pointer"
                  />
                  <label htmlFor="maintenanceModeSwitch" className="text-xs font-bold text-red-600 dark:text-red-400 cursor-pointer">
                    Enable System Maintenance Mode (Block all guest visitor queries)
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Alert Message Splash Screen Text</label>
                  <textarea
                    {...register("maintenanceMessage")}
                    rows={2}
                    className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Expected Back Time (ISO Date Time)</label>
                    <input
                      type="text"
                      {...register("expectedBackTime")}
                      placeholder="e.g. 2026-07-02T12:00:00+05:30"
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">Allowed Bypass Admin IPs (Comma separated)</label>
                    <input
                      type="text"
                      {...register("allowedIps")}
                      placeholder="127.0.0.1"
                      className="w-full text-xs font-semibold px-3 py-2 border rounded-card bg-transparent text-neutral-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SAVE BUTTON FOR CURRENT TAB */}
            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 flex justify-end gap-3 select-none">
              <Button
                type="submit"
                variant="primary"
                className="text-xs font-bold"
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save configurations
              </Button>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
}
