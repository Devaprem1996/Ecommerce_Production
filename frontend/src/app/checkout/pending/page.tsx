"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { 
  Clock, 
  ChevronRight, 
  HelpCircle, 
  RefreshCw,
  Loader2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

export default function CheckoutPendingPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 animate-spin text-primary-500 rounded-full border-4 border-neutral-250 border-t-primary-500" />
      </div>
    }>
      <CheckoutPendingContent />
    </React.Suspense>
  );
}

function CheckoutPendingContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams?.get("orderId") || "ORD-2025-00123";
  
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Connecting to payment gateway...");

  useEffect(() => {
    // Increment progress bar to simulate checking status
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        
        // Update messages at intervals
        if (prev === 20) setStatusMessage("Verifying bank transaction tokens...");
        if (prev === 50) setStatusMessage("Waiting for settlement confirmation...");
        if (prev === 80) setStatusMessage("Registering order records...");

        return prev + 10;
      });
    }, 600);

    return () => clearInterval(interval);
  }, []);

  // When progress reaches 100%, redirect to success page
  useEffect(() => {
    if (progress === 100) {
      toast.success("Payment verified! Redirecting to success screen...");
      const redirectTimeout = setTimeout(() => {
        router.replace(`/checkout/success?orderId=${orderId}`);
      }, 800);
      return () => clearTimeout(redirectTimeout);
    }
  }, [progress, orderId, router]);

  const handleManualCheck = () => {
    toast.info("Manually querying transaction status...");
    setProgress((prev) => Math.min(prev + 15, 100));
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans pb-16 transition-colors duration-normal">
      
      {/* Breadcrumbs */}
      <div className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-3">
        <div className="max-w-3xl mx-auto px-4">
          <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-650 dark:text-neutral-400 uppercase tracking-wider">
            <Link href="/" className="hover:text-primary-500 transition-colors">
              {t("shop.breadcrumb_home", "Home")}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-amber-500 select-none">
              Payment Pending
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-8 sm:mt-12">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 sm:p-10 shadow-sm text-center space-y-8">
          
          {/* Animated Clock / Loader */}
          <div className="flex justify-center">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, ease: "linear", repeat: Infinity }}
                className="w-20 h-20 text-amber-500 bg-amber-500/10 rounded-full flex items-center justify-center"
              >
                <Clock className="w-10 h-10 stroke-[1.5]" />
              </motion.div>
              <div className="absolute -bottom-1 -right-1 bg-white dark:bg-neutral-900 p-1 rounded-full border border-neutral-100 dark:border-neutral-800">
                <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/5 px-3 py-1 rounded-full border border-amber-500/10 uppercase tracking-widest inline-block select-none">
              ⏳ {t("checkout.payment_pending", "Payment Pending")}
            </span>
            <h2 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
              Awaiting Gateway Settlement
            </h2>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
              We are waiting for payment verification from your bank UPI channel. This usually completes in under 2 minutes. Please do not refresh the page.
            </p>
            <p className="text-xs font-bold text-neutral-505 pt-2">
              Order Reference: <span className="font-extrabold text-neutral-800 dark:text-white">{orderId}</span>
            </p>
          </div>

          {/* Progress Tracker */}
          <div className="space-y-3 bg-neutral-50 dark:bg-neutral-950 p-5 rounded-card border border-neutral-150 dark:border-neutral-850">
            <div className="flex justify-between items-center text-[10px] font-bold text-neutral-450 uppercase tracking-widest select-none">
              <span>Verification Status</span>
              <span>{progress}%</span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-amber-500 rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <p className="text-[10px] font-bold text-neutral-600 dark:text-neutral-450 flex items-center justify-center gap-1.5 pt-1 animate-pulse">
              {statusMessage}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            
            <Button 
              variant="primary" 
              onClick={handleManualCheck}
              className="w-full font-bold text-xs py-3"
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Check Status Manually
            </Button>

            <Link href="/contact" className="w-full">
              <Button variant="secondary" className="w-full font-bold text-xs py-3" leftIcon={<HelpCircle className="w-4 h-4" />}>
                Contact Customer Support
              </Button>
            </Link>

          </div>

        </div>
      </div>

    </div>
  );
}
