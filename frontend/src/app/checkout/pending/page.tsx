"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
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
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";
import { paymentService } from "@/services/payment.service";
import { useCartStore } from "@/store/cartStore";

const MAX_POLL_ATTEMPTS = 15;
const POLL_INTERVAL_MS = 3000;

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
  const clearCart = useCartStore((s) => s.clearCart);

  const orderId = searchParams?.get("orderId") || "";
  
  const [progress, setProgress] = useState(10);
  const [statusMessage, setStatusMessage] = useState("Connecting to payment gateway...");
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [isCheckingManually, setIsCheckingManually] = useState(false);
  
  const pollAttemptsRef = useRef(0);
  const isResolvedRef = useRef(false);

  const checkStatus = useCallback(async (isManual = false) => {
    if (!orderId) {
      setStatusMessage("Missing order reference.");
      return;
    }

    try {
      if (isManual) {
        setIsCheckingManually(true);
      }

      const res = await paymentService.getOrderStatus(orderId);

      const isPaid =
        res.isPaid ||
        res.status === "PAYMENT_VERIFIED" ||
        res.status === "CONFIRMED" ||
        res.payments?.some((p: any) => p.status === "captured");

      if (isPaid) {
        isResolvedRef.current = true;
        setProgress(100);
        setStatusMessage("Payment confirmed! Preparing your receipt...");
        clearCart();
        toast.success("Payment verified! Redirecting to confirmation screen...");
        const targetOrder = res.orderNumber || res.dbOrderId || orderId;
        setTimeout(() => {
          router.replace(`/checkout/success?orderId=${encodeURIComponent(targetOrder)}`);
        }, 1000);
        return;
      }

      if (res.status === "FAILED" || res.paymentStatus === "FAILED") {
        isResolvedRef.current = true;
        toast.error("Payment was declined or cancelled.");
        setTimeout(() => {
          router.replace(
            `/checkout/failed?orderId=${encodeURIComponent(orderId)}&reason=${encodeURIComponent(
              res.failureReason || "Payment was declined by payment gateway"
            )}`
          );
        }, 800);
        return;
      }

      if (isManual) {
        toast.info("Payment is still awaiting confirmation from your bank.");
      }
    } catch (err: any) {
      console.warn("Polling order status check error:", err);
      if (isManual) {
        toast.error(err.message || "Failed to query transaction status.");
      }
    } finally {
      if (isManual) {
        setIsCheckingManually(false);
      }
    }
  }, [orderId, router, clearCart]);

  useEffect(() => {
    if (!orderId || isResolvedRef.current) return;

    // Run first check immediately
    checkStatus(false);

    const interval = setInterval(() => {
      if (isResolvedRef.current) {
        clearInterval(interval);
        return;
      }

      pollAttemptsRef.current += 1;
      const attempt = pollAttemptsRef.current;

      const calculatedProgress = Math.min(
        Math.round((attempt / MAX_POLL_ATTEMPTS) * 90) + 10,
        95
      );
      setProgress(calculatedProgress);

      if (attempt <= 4) {
        setStatusMessage("Verifying bank transaction tokens...");
      } else if (attempt <= 9) {
        setStatusMessage("Waiting for settlement confirmation from your bank...");
      } else {
        setStatusMessage("Confirming order records with gateway...");
      }

      checkStatus(false);

      if (attempt >= MAX_POLL_ATTEMPTS) {
        clearInterval(interval);
        if (!isResolvedRef.current) {
          setIsTimedOut(true);
          setStatusMessage("Bank verification is taking longer than usual.");
        }
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [orderId, checkStatus]);

  const handleManualCheck = () => {
    checkStatus(true);
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
              We are waiting for payment verification from your bank UPI channel. This usually completes in under 2 minutes. Please do not close or refresh this page.
            </p>
            {orderId && (
              <p className="text-xs font-bold text-neutral-505 pt-2">
                Order Reference: <span className="font-extrabold text-neutral-800 dark:text-white">{orderId}</span>
              </p>
            )}
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

          {/* Timeout Alert if settlement is delayed */}
          {isTimedOut && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl text-left flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <p className="font-bold">Confirmation is taking longer than expected.</p>
                <p className="text-amber-700 dark:text-amber-400">
                  If money was debited from your account, your payment will automatically update once verified by the bank. You will receive an SMS and email receipt.
                </p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            
            <Button 
              variant="primary" 
              onClick={handleManualCheck}
              disabled={isCheckingManually}
              className="w-full font-bold text-xs py-3"
              leftIcon={
                isCheckingManually ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )
              }
            >
              {isCheckingManually ? "Checking Gateway..." : "Check Status Now"}
            </Button>

            {isTimedOut ? (
              <div className="flex gap-2 w-full">
                <Link href="/account/orders" className="flex-1">
                  <Button variant="secondary" className="w-full font-bold text-xs py-3" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    View My Orders
                  </Button>
                </Link>
                <Link href="/contact" className="flex-1">
                  <Button variant="ghost" className="w-full font-bold text-xs py-3 border border-neutral-200 dark:border-neutral-800" leftIcon={<HelpCircle className="w-4 h-4" />}>
                    Help & Support
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/contact" className="w-full">
                <Button variant="secondary" className="w-full font-bold text-xs py-3" leftIcon={<HelpCircle className="w-4 h-4" />}>
                  Contact Customer Support
                </Button>
              </Link>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}
