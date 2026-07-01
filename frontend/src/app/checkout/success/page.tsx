"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  ShoppingBag, 
  MapPin, 
  Calendar, 
  Mail, 
  MessageSquare, 
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { mockProducts } from "@/constants/mockData";
import { formatPrice } from "@/utils/formatPrice";
import { Button } from "@/components/ui/Button";

export default function CheckoutSuccessPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    }>
      <CheckoutSuccessContent />
    </React.Suspense>
  );
}

function CheckoutSuccessContent() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams?.get("orderId");
  const clearCart = useCartStore((state) => state.clearCart);

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Confetti particles state
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generate confetti particles
    const generated = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      y: -10 - Math.random() * 20, // start above
      size: 4 + Math.random() * 6,
      color: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"][Math.floor(Math.random() * 6)],
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      rotate: Math.random() * 360,
    }));
    setParticles(generated);

    // Clear cart immediately upon reaching success page
    clearCart();

    if (typeof window === "undefined" || !orderId) {
      setLoading(false);
      return;
    }

    // Try to load order details
    const storedOrders = localStorage.getItem("user_orders");
    if (storedOrders) {
      const ordersList = JSON.parse(storedOrders);
      const found = ordersList.find((o: any) => o.id === orderId || o.id === `#${orderId}` || `#${o.id}` === orderId);
      if (found) {
        setOrder(found);
      }
    }
    setLoading(false);
  }, [orderId, clearCart]);

  // If orderId is missing, redirect to orders page after a brief wait
  useEffect(() => {
    if (!loading && !orderId) {
      router.replace("/account/orders");
    }
  }, [loading, orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // Prevent render if order does not exist (will be redirected by useEffect)
  if (!orderId) return null;

  // Fallback order details if order not found in localStorage (for demo links)
  const displayOrder = order || {
    id: orderId,
    total: 941,
    date: new Date().toLocaleDateString(),
    status: "pending",
    items: [
      { productId: "p1", price: 299, quantity: 2 },
      { productId: "p2", price: 399, quantity: 1 }
    ],
    shippingAddress: {
      name: "Ganesh Prabhu",
      street: "123 Anna Nagar",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600040",
      mobile: "9876543210"
    },
    paymentMethod: "upi",
    paymentStatus: "paid"
  };

  const totalItemsCount = displayOrder.items.reduce((acc: number, item: any) => acc + item.quantity, 0);

  // Pre-formatted Whatsapp message
  const whatsappText = `Hello! I just placed an order at Aether Organic!\nOrder Number: *${displayOrder.id}*\nTotal Amount: *₹${displayOrder.total}*\nFresh farm organic goodness is on the way! 🌱`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans pb-16 relative overflow-hidden transition-colors duration-normal">
      
      {/* Confetti Container */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: `${p.x}vw`, y: `${p.y}vh`, rotate: 0, opacity: 1 }}
            animate={{ 
              y: "110vh", 
              rotate: p.rotate + 360,
              opacity: [1, 1, 0.8, 0]
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: "linear",
              repeat: 0
            }}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.id % 2 === 0 ? "50%" : "2px",
            }}
          />
        ))}
      </div>

      {/* Breadcrumbs */}
      <div className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-3">
        <div className="max-w-3xl mx-auto px-4">
          <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-650 dark:text-neutral-400 uppercase tracking-wider">
            <Link href="/" className="hover:text-primary-500 transition-colors">
              {t("shop.breadcrumb_home", "Home")}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary-500 select-none">
              Success
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 mt-8 sm:mt-12">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 sm:p-10 shadow-sm text-center space-y-6 sm:space-y-8">
          
          {/* Animated Success Checkmark */}
          <div className="flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-20 h-20 text-green-500 bg-green-500/10 rounded-full flex items-center justify-center"
            >
              <CheckCircle2 className="w-12 h-12 stroke-[1.5]" />
            </motion.div>
          </div>

          {/* Success Title */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-primary-500 bg-primary-500/5 px-3 py-1 rounded-full border border-primary-500/10 uppercase tracking-widest inline-block select-none">
              🎉 {t("checkout.order_placed", "Order Placed Successfully!")}
            </span>
            <h2 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-905 dark:text-white tracking-tight">
              {t("checkout.thank_you", "Thank You For Your Purchase!")}
            </h2>
            <p className="text-xs text-neutral-500 font-semibold select-none">
              {t("checkout.order_ref", "Order ID")}: <span className="font-bold text-neutral-800 dark:text-white">{displayOrder.id}</span>
            </p>
          </div>

          {/* Order Summary Grid */}
          <div className="bg-neutral-50 dark:bg-neutral-950 p-5 rounded-card border border-neutral-150 dark:border-neutral-850 space-y-3.5 text-left text-xs">
            <h3 className="font-bold text-[10px] text-neutral-450 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-850 pb-2 select-none">
              Order Summary
            </h3>
            
            <div className="flex justify-between font-semibold text-neutral-700 dark:text-neutral-350">
              <span>Items Count:</span>
              <span className="font-bold text-neutral-900 dark:text-white">{totalItemsCount} products</span>
            </div>

            <div className="flex justify-between font-semibold text-neutral-700 dark:text-neutral-350">
              <span>Payment Details:</span>
              <span className="font-bold text-neutral-900 dark:text-white uppercase">
                {displayOrder.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment (UPI/Card)"}
              </span>
            </div>

            <div className="flex justify-between font-semibold text-neutral-700 dark:text-neutral-350">
              <span>Payment Status:</span>
              <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-600 border border-green-500/20 text-[9px] font-bold uppercase tracking-wider">
                Paid ✅
              </span>
            </div>

            <div className="flex justify-between font-black text-neutral-900 dark:text-white border-t border-neutral-200 dark:border-neutral-850 pt-2.5 text-sm">
              <span>Total Paid:</span>
              <span className="text-primary-750 dark:text-primary-400 font-black">{formatPrice(displayOrder.total)}</span>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-neutral-50 dark:bg-neutral-950 p-5 rounded-card border border-neutral-150 dark:border-neutral-850 space-y-3.5 text-left text-xs">
            <h3 className="font-bold text-[10px] text-neutral-450 uppercase tracking-wider border-b border-neutral-200 dark:border-neutral-850 pb-2 select-none">
              Delivery Information
            </h3>
            
            <div className="font-semibold text-neutral-700 dark:text-neutral-350 flex gap-2">
              <MapPin className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-neutral-900 dark:text-white">{displayOrder.shippingAddress?.name}</p>
                <p className="text-neutral-505 dark:text-neutral-450 mt-0.5">
                  {displayOrder.shippingAddress?.street}, {displayOrder.shippingAddress?.city}, {displayOrder.shippingAddress?.state} - {displayOrder.shippingAddress?.pincode}
                </p>
              </div>
            </div>

            <div className="font-semibold text-neutral-700 dark:text-neutral-350 flex gap-2 border-t border-neutral-200 dark:border-neutral-850 pt-2.5">
              <Calendar className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-neutral-900 dark:text-white">Estimated Delivery</p>
                <p className="text-primary-650 dark:text-primary-400 mt-0.5 font-bold">
                  Within 3-5 business days
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps Infobox */}
          <div className="text-left bg-primary-500/5 p-4 rounded-card border border-primary-500/10 text-xs leading-relaxed space-y-2 text-neutral-600 dark:text-neutral-400">
            <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 select-none text-[10px] uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-secondary-400" />
              What's Next?
            </h4>
            <p>&bull; An order confirmation receipt is sent to your registered email address.</p>
            <p>&bull; We will send you SMS dispatch updates on +91 {displayOrder.shippingAddress?.mobile?.slice(-4).padStart(10, "*") || "******7890"}.</p>
            <p>&bull; Dynamic shipment tracking codes will become active as soon as our farm team ships your items.</p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            
            <Link href={`/track-order?orderId=${displayOrder.id.replace("#", "")}`} className="w-full">
              <Button variant="primary" className="w-full font-bold text-xs py-3">
                Track Your Order
              </Button>
            </Link>

            <Link href="/shop" className="w-full">
              <Button variant="secondary" className="w-full font-bold text-xs py-3">
                Continue Shopping
              </Button>
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20BA5A] transition-colors py-3 px-4 rounded-card shadow-sm cursor-pointer select-none"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Share Details on WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

          </div>

        </div>
      </div>

    </div>
  );
}

// Simple loader helper inline
function Loader2({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
