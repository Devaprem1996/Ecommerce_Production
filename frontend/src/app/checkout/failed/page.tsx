"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { 
  XCircle, 
  ChevronRight, 
  AlertCircle, 
  HelpCircle, 
  ShoppingBag,
  ArrowRight,
  RefreshCcw,
  Undo2
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CheckoutFailedPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 animate-spin text-primary-500 rounded-full border-4 border-neutral-250 border-t-primary-500" />
      </div>
    }>
      <CheckoutFailedContent />
    </React.Suspense>
  );
}

function CheckoutFailedContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams?.get("orderId") || "ORD-2025-00123";
  const reason = searchParams?.get("reason") || "Payment was declined by bank";

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
            <span className="text-red-500 select-none">
              Payment Failed
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-8 sm:mt-12">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 sm:p-10 shadow-sm text-center space-y-6 sm:space-y-8">
          
          {/* Animated Failed Checkmark */}
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.1, 1] }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-20 h-20 text-red-500 bg-red-500/10 rounded-full flex items-center justify-center"
            >
              <XCircle className="w-12 h-12 stroke-[1.5]" />
            </motion.div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-red-500 bg-red-500/5 px-3 py-1 rounded-full border border-red-500/10 uppercase tracking-widest inline-block select-none">
              😔 {t("checkout.payment_failed", "Payment Failed")}
            </span>
            <h2 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
              Order Transaction Declined
            </h2>
            <p className="text-xs font-bold text-neutral-500">
              Order ID: <span className="font-extrabold text-neutral-800 dark:text-white">{orderId}</span> (Not Confirmed)
            </p>
          </div>

          {/* Cart Status Notice */}
          <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-card flex gap-3 text-left text-xs leading-relaxed text-neutral-700 dark:text-neutral-400">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[10px]">
                Don't Worry! Your Cart is Safe
              </p>
              <p className="text-neutral-505 dark:text-neutral-450 mt-0.5">
                Your selected products are still preserved in your shopping cart. We have not cleared your cart so you can retry payment easily.
              </p>
            </div>
          </div>

          {/* Failure reason details */}
          <div className="bg-neutral-50 dark:bg-neutral-950 p-5 rounded-card border border-neutral-150 dark:border-neutral-850 text-left text-xs space-y-3.5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                Failure Reason
              </span>
              <p className="font-bold text-red-550 dark:text-red-400 flex items-center gap-1.5 mt-1 leading-normal">
                {reason}
              </p>
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-850 pt-3 space-y-2 font-semibold text-neutral-600 dark:text-neutral-400">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block select-none">
                Common Causes
              </span>
              <p className="text-[11px] leading-relaxed">
                &bull; Insufficient bank balance or account credit limits.<br />
                &bull; Bank servers declined or timed out during authentication.<br />
                &bull; Network disruption or accidental back-button press during authorization.
              </p>
            </div>
          </div>

          {/* Try again payment suggestions */}
          <div className="text-left text-xs space-y-2.5">
            <span className="text-[10px] font-bold text-neutral-450 uppercase tracking-widest block select-none">
              Suggested Payment Methods to Retry:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-neutral-750 dark:text-neutral-350">
              <div className="p-3 border border-neutral-150 dark:border-neutral-850 bg-neutral-50 dark:bg-neutral-950 rounded-card flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>UPI Payments / GPay</span>
              </div>
              <div className="p-3 border border-neutral-150 dark:border-neutral-850 bg-neutral-50 dark:bg-neutral-950 rounded-card flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>Credit or Debit Cards</span>
              </div>
              <div className="p-3 border border-neutral-150 dark:border-neutral-850 bg-neutral-50 dark:bg-neutral-950 rounded-card flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>Net Banking / Bank Transfer</span>
              </div>
              <div className="p-3 border border-neutral-150 dark:border-neutral-850 bg-neutral-50 dark:bg-neutral-950 rounded-card flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary-500" />
                <span>Cash on Delivery (COD)</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            
            <Link href="/checkout" className="w-full">
              <Button variant="primary" className="w-full font-bold text-xs py-3" leftIcon={<RefreshCcw className="w-4 h-4" />}>
                Retry Checkout Payment
              </Button>
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/cart" className="w-full">
                <Button variant="secondary" className="w-full font-bold text-xs py-3" leftIcon={<Undo2 className="w-4 h-4" />}>
                  Back to Cart
                </Button>
              </Link>
              
              <Link href="/contact" className="w-full">
                <Button variant="secondary" className="w-full font-bold text-xs py-3" leftIcon={<HelpCircle className="w-4 h-4" />}>
                  Contact Support
                </Button>
              </Link>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
