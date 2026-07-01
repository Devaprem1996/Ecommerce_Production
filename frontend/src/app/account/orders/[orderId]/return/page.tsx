"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  X, 
  Loader2, 
  Image as ImageIcon,
  Check
} from "lucide-react";
import { mockProducts } from "@/constants/mockData";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { motion, AnimatePresence } from "framer-motion";

interface ReturnItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
}

export default function OrderReturnPage() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [refundMethod, setRefundMethod] = useState("original");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  
  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<{ requestId: string } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !orderId) return;

    const storedOrders = localStorage.getItem("user_orders");
    if (storedOrders) {
      const ordersList = JSON.parse(storedOrders);
      const foundOrder = ordersList.find((o: any) => o.id === orderId || o.id === `#${orderId}` || `#${o.id}` === orderId);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    }
    setLoading(false);
  }, [orderId]);

  // Check Eligibility (Delivered status, and Placed within last 7 days)
  const eligibility = useMemo(() => {
    if (!order) return { eligible: false, reason: "Order not found." };
    
    if (order.status.toLowerCase() !== "delivered") {
      return { 
        eligible: false, 
        reason: currentLang === "ta" 
          ? "டெலிவரி செய்யப்பட்ட ஆர்டர்கள் மட்டுமே திரும்பப் பெறத் தகுதியானவை."
          : "Only orders that have been successfully delivered can be returned." 
      };
    }

    // Try to parse order date
    const orderDateStr = order.date || "12 Jan 2025";
    let orderTime = Date.now();
    try {
      orderTime = Date.parse(orderDateStr);
      if (isNaN(orderTime)) {
        // Fallback parse for "12 Jan 2025"
        const parts = orderDateStr.split(" ");
        if (parts.length === 3) {
          const day = parseInt(parts[0]);
          const monthStr = parts[1].toLowerCase();
          const year = parseInt(parts[2]);
          const months: Record<string, number> = {
            jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
          };
          const month = months[monthStr.slice(0, 3)] || 0;
          orderTime = new Date(year, month, day).getTime();
        }
      }
    } catch (e) {
      orderTime = Date.now();
    }

    const diffDays = Math.ceil(Math.abs(Date.now() - orderTime) / (1000 * 60 * 60 * 24));
    
    // For demo, if order is from 2025, let's treat it as eligible or mockable unless we want a strict check.
    // Let's make all ORD-2025-00123 eligible for demo purposes, else strict 7 days.
    const isDemoOrder = order.id.includes("2025") || order.id.includes("00123");
    const eligible = isDemoOrder || diffDays <= 7;

    return {
      eligible,
      reason: eligible 
        ? "" 
        : currentLang === "ta" 
        ? "விநியோகிக்கப்பட்டு 7 நாட்களுக்கு மேல் ஆகிவிட்டதால் திரும்பப் பெற முடியாது."
        : "Return window has expired. Returns must be requested within 7 days of delivery."
    };
  }, [order, currentLang]);

  const handleCheckboxChange = (productId: string) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // Validate sizes
      const validFiles = filesArray.filter((file) => {
        if (file.size > 2 * 1024 * 1024) {
          toast.error(`File "${file.name}" exceeds 2MB limit.`);
          return false;
        }
        return true;
      });

      setAttachedFiles((prev) => {
        const combined = [...prev, ...validFiles];
        if (combined.length > 3) {
          toast.warning("Maximum of 3 photos allowed.");
          return combined.slice(0, 3);
        }
        return combined;
      });
    }
  };

  const removeAttachedFile = (idx: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      toast.warning("Please select at least one item to return.");
      return;
    }
    if (!reason) {
      toast.warning("Please choose a reason for return.");
      return;
    }
    if (!description.trim()) {
      toast.warning("Please describe the issue.");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // Generate a mock Request ID
      const reqId = `RET-2026-${Math.floor(10000 + Math.random() * 90000)}`;

      // Update the order in localStorage to "Returned" (or "Processing Return")
      if (typeof window !== "undefined") {
        const storedOrders = localStorage.getItem("user_orders");
        if (storedOrders) {
          const parsed = JSON.parse(storedOrders);
          const updated = parsed.map((o: any) => {
            if (o.id === order.id) {
              return { 
                ...o, 
                status: "Returned",
                returnRequest: {
                  requestId: reqId,
                  reason,
                  description,
                  refundMethod,
                  items: selectedItems,
                  dateSubmitted: new Date().toLocaleDateString()
                }
              };
            }
            return o;
          });
          localStorage.setItem("user_orders", JSON.stringify(updated));
        }
      }

      setSubmittedRequest({ requestId: reqId });
      toast.success("Return request submitted successfully!");
    }, 1250);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center px-4">
        <div className="text-center p-8 bg-white dark:bg-neutral-900 rounded-feature border border-neutral-150 max-w-sm w-full space-y-4">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Order Not Found</h3>
          <p className="text-xs text-neutral-505">We couldn't locate this order under your account session.</p>
          <Button variant="secondary" onClick={() => router.push("/account/orders")} className="w-full font-bold">
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans py-12 transition-colors duration-normal">
      <div className="max-w-xl mx-auto px-4">
        
        <Link
          href={`/account/orders/${order.id.replace("#", "")}`}
          className="text-xs font-bold text-neutral-450 hover:text-primary-500 transition-colors flex items-center gap-1.5 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("invoice.back_to_order", "Back to Order Details")}
        </Link>

        <AnimatePresence mode="wait">
          {!submittedRequest ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 sm:p-8 shadow-sm space-y-8"
            >
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-neutral-900 dark:text-white leading-tight">
                  Request Return / Refund
                </h1>
                <p className="text-xs text-neutral-500 mt-1">
                  Order #{order.id} &bull; Placed on {order.date}
                </p>
              </div>

              {/* Eligibility Info Box */}
              <div className={`p-4 rounded-card border flex items-start gap-3 text-xs leading-relaxed ${
                eligibility.eligible 
                  ? "bg-green-500/5 border-green-200 text-green-700 dark:text-green-400" 
                  : "bg-red-50 dark:bg-red-950/20 border-red-200 text-red-700 dark:text-red-400"
              }`}>
                {eligibility.eligible ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold uppercase tracking-wider">
                    {eligibility.eligible ? "Eligible for Return" : "Return Window Closed"}
                  </h4>
                  <p className="text-neutral-550 dark:text-neutral-400 mt-0.5">
                    {eligibility.eligible 
                      ? "This order is within the 7-day return period. You can select items to return below." 
                      : eligibility.reason}
                  </p>
                </div>
              </div>

              {eligibility.eligible && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Select Items */}
                  <div className="space-y-3.5">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                      Select Item(s) to Return *
                    </label>
                    
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800 border border-neutral-150 dark:border-neutral-800 rounded-card bg-neutral-50 dark:bg-neutral-950 p-4 space-y-3">
                      {order.items.map((item: any) => {
                        const prod = mockProducts.find(p => p.id === item.productId);
                        const isChecked = selectedItems.includes(item.productId);
                        return (
                          <label 
                            key={item.productId} 
                            className="flex items-start gap-3.5 py-2 first:pt-0 last:pb-0 cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCheckboxChange(item.productId)}
                              className="w-4 h-4 rounded border-neutral-300 text-primary-500 accent-primary-500 mt-1"
                            />
                            <div className="flex-1">
                              <span className="text-xs font-bold text-neutral-900 dark:text-white block">
                                {prod?.name || item.name}
                              </span>
                              <span className="text-[10px] text-neutral-500 block">
                                Qty: {item.quantity} &bull; ₹{item.price} each
                              </span>
                            </div>
                            <span className="text-xs font-bold text-neutral-900 dark:text-white">
                              ₹{item.price * item.quantity}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reason for Return */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                      Reason for Return *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      {[
                        "Damaged / Defective product",
                        "Wrong product delivered",
                        "Product quality issue",
                        "Missing items in package",
                        "Changed my mind",
                        "Other"
                      ].map((r) => (
                        <label key={r} className="flex items-center gap-2 px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-850 rounded-card cursor-pointer hover:border-neutral-350">
                          <input
                            type="radio"
                            name="return_reason"
                            checked={reason === r}
                            onChange={() => setReason(r)}
                            className="accent-primary-500"
                          />
                          <span>{r}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                      Describe the issue *
                    </label>
                    <textarea
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please details the reasons for returning these items..."
                      className="w-full text-xs font-semibold p-3.5 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:border-primary-500 min-h-[90px]"
                    />
                  </div>

                  {/* Upload Photos */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                      Upload Photo (optional but recommended)
                    </label>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Attached items */}
                      {attachedFiles.map((file, idx) => (
                        <div key={idx} className="relative w-16 h-16 border border-neutral-250 dark:border-neutral-800 rounded bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center text-neutral-400">
                          <ImageIcon className="w-6 h-6" />
                          <button
                            type="button"
                            onClick={() => removeAttachedFile(idx)}
                            className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 hover:bg-red-650 text-white rounded-full cursor-pointer border-none"
                            aria-label="Remove attachment"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <span className="absolute bottom-1 left-1 right-1 text-[8px] truncate text-center px-0.5 bg-neutral-900/60 text-white font-bold rounded">
                            {file.name}
                          </span>
                        </div>
                      ))}

                      {attachedFiles.length < 3 && (
                        <label className="w-16 h-16 border border-dashed border-neutral-300 dark:border-neutral-700 rounded hover:border-primary-500 flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-550 cursor-pointer select-none hover:bg-neutral-50 dark:hover:bg-neutral-950 transition-colors">
                          <Upload className="w-4 h-4 mb-0.5" />
                          <span className="text-[8px] font-bold">Attach</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-450 block font-medium">
                      Maximum 3 photos, up to 2MB each.
                    </span>
                  </div>

                  {/* Refund Method */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
                      Refund Method
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <label className="flex-1 flex items-start gap-2.5 p-3.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-850 rounded-card cursor-pointer">
                        <input
                          type="radio"
                          name="refund_method"
                          checked={refundMethod === "original"}
                          onChange={() => setRefundMethod("original")}
                          className="accent-primary-500 mt-0.5"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-neutral-905 dark:text-white block">Original payment method</span>
                          <span className="text-[10px] text-neutral-500 block mt-0.5">3-5 business days after pickup</span>
                        </div>
                      </label>

                      <label className="flex-1 flex items-start gap-2.5 p-3.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-150 dark:border-neutral-850 rounded-card cursor-pointer">
                        <input
                          type="radio"
                          name="refund_method"
                          checked={refundMethod === "credit"}
                          onChange={() => setRefundMethod("credit")}
                          className="accent-primary-500 mt-0.5"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-neutral-905 dark:text-white block">Store credit</span>
                          <span className="text-[10px] text-neutral-500 block mt-0.5">Instant refund upon pickup approval</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                    className="w-full font-bold text-xs py-3.5 mt-2"
                    leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                  >
                    {isSubmitting ? "Submitting Request..." : "Submit Return Request"}
                  </Button>

                </form>
              )}
            </motion.div>
          ) : (
            /* SUCCESS AFTER SUBMISSION */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-8 shadow-md text-center space-y-6"
            >
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 stroke-[3px]" />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white uppercase tracking-tight">
                  Return Request Submitted!
                </h2>
                <p className="text-xs font-semibold text-neutral-500">
                  Request ID: <span className="font-bold text-neutral-800 dark:text-neutral-350">{submittedRequest.requestId}</span>
                </p>
              </div>

              <div className="max-w-sm mx-auto bg-neutral-50 dark:bg-neutral-950 p-5 rounded-card border border-neutral-100 dark:border-neutral-850 text-xs text-neutral-600 dark:text-neutral-400 space-y-2.5 leading-relaxed text-left">
                <p className="font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-350 mb-1 select-none">
                  What Happens Next?
                </p>
                <p>&bull; We will review your return request within 24 to 48 hours.</p>
                <p>&bull; Upon approval, our courier agent will arrive to collect the items.</p>
                <p>&bull; Refund updates and tracking details will be sent to your mobile number.</p>
              </div>

              <Button
                variant="primary"
                onClick={() => router.push("/account/orders")}
                className="w-full max-w-xs font-bold text-xs"
              >
                Back to My Orders
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
