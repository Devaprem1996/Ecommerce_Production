"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ChevronRight, 
  Percent, 
  Truck, 
  Check, 
  Lock,
  Tag
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/Button';
import { OTPModal } from '@/components/ui/OTPModal';
import { toast } from '@/components/ui/Toast';

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const router = useRouter();

  // Stores
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    getTotal, 
    getItemCount 
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  // Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const subtotal = getTotal();
  const itemCount = getItemCount();

  // Apply Coupon Logic
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.toUpperCase().trim();
    if (code === 'ORGANIC10') {
      setActiveCoupon(code);
      setDiscountAmount(Math.round(subtotal * 0.1));
      toast.success('Coupon "ORGANIC10" applied! 10% Discount saved.');
    } else if (code === 'AETHERFREE') {
      setActiveCoupon(code);
      setDiscountAmount(0); // Handled in delivery calculations
      toast.success('Coupon "AETHERFREE" applied! Free Delivery enabled.');
    } else {
      toast.error('Invalid coupon code. Try ORGANIC10 or AETHERFREE');
    }
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
    toast.info('Coupon code removed.');
  };

  // Delivery Calculations
  const freeShippingThreshold = 499;
  const standardShippingCost = 50;
  const isFreeDelivery = subtotal >= freeShippingThreshold || activeCoupon === 'AETHERFREE';
  const deliveryFee = itemCount > 0 && !isFreeDelivery ? standardShippingCost : 0;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const orderTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  // Proceed Checkout Actions
  const handleProceedCheckout = () => {
    if (!isAuthenticated) {
      setIsOtpModalOpen(true);
    } else {
      router.push('/checkout');
    }
  };

  const handleLoginSuccess = () => {
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans pb-20 transition-colors duration-normal">
      
      {/* Page Header */}
      <div className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
            <Link href="/" className="hover:text-primary-500 transition-colors">
              {t('shop.breadcrumb_home', 'Home')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/shop" className="hover:text-primary-500 transition-colors">
              {t('shop.breadcrumb_shop', 'Shop')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary-500 select-none">
              {t('cart.title', 'Shopping Cart')}
            </span>
          </nav>
          <h1 className="text-2.5xl sm:text-3.5xl font-bold font-heading text-neutral-900 dark:text-white leading-tight">
            {t('cart.title', 'Shopping Cart')}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Step Indicator */}
        <div className="mb-10 max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between relative">
            {/* Background connecting line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-neutral-200 dark:bg-neutral-800 z-0 rounded-full" />
            
            {/* Progress line */}
            <div className="absolute left-0 right-3/4 top-1/2 -translate-y-1/2 h-1 bg-primary-500 z-0 rounded-full transition-all duration-slow" />

            {/* Step 1: Cart */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-500 border-4 border-white dark:border-neutral-905 flex items-center justify-center text-white font-bold text-sm shadow-md">
                1
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-primary-500 uppercase tracking-wider">
                Cart
              </span>
            </div>

            {/* Step 2: Address */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 border-4 border-white dark:border-neutral-905 flex items-center justify-center text-neutral-600 dark:text-neutral-400 font-bold text-sm">
                2
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Address
              </span>
            </div>

            {/* Step 3: Payment */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 border-4 border-white dark:border-neutral-905 flex items-center justify-center text-neutral-600 dark:text-neutral-400 font-bold text-sm">
                3
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Payment
              </span>
            </div>

            {/* Step 4: Confirm */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 border-4 border-white dark:border-neutral-905 flex items-center justify-center text-neutral-600 dark:text-neutral-400 font-bold text-sm">
                4
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
                Confirm
              </span>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-8 shadow-sm">
            <div className="w-24 h-24 text-neutral-300 dark:text-neutral-700 mb-6">
              <ShoppingBag className="w-full h-full stroke-[1]" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              {t('cart.empty', 'Your Cart is Empty')}
            </h3>
            <p className="text-sm text-neutral-650 dark:text-neutral-400 max-w-sm mb-8">
              {t('cart.empty_desc', 'Explore our selection of organic products sourced directly from local farmers.')}
            </p>
            <Button
              variant="primary"
              onClick={() => router.push('/shop')}
              className="font-bold py-3 px-8"
            >
              {t('cart.shop_now', 'Start Shopping')}
            </Button>
          </div>
        ) : (
          /* Main Cart Content */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Items List (Left Column) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature overflow-hidden shadow-sm">
                
                {/* Header row */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-neutral-50 dark:bg-neutral-850/40 border-b border-neutral-100 dark:border-neutral-800 font-bold text-xs uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  <div className="col-span-6">{t('cart.product', 'Product')}</div>
                  <div className="col-span-2 text-center">{t('cart.price', 'Price')}</div>
                  <div className="col-span-2 text-center">{t('cart.qty', 'Quantity')}</div>
                  <div className="col-span-2 text-right">{t('cart.total', 'Total')}</div>
                </div>

                {/* Items loop */}
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {items.map(({ product, quantity }) => {
                    const displayName = currentLang === 'ta' && product.nameTamil ? product.nameTamil : product.name;
                    return (
                      <div key={`${product.id}-${product.unit}`} className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center group">
                        
                        {/* Thumbnail & Info */}
                        <div className="col-span-1 md:col-span-6 flex gap-4 items-center">
                          <div className="relative aspect-square w-16 sm:w-20 bg-neutral-50 dark:bg-neutral-850 border border-neutral-100 dark:border-neutral-800 rounded-card overflow-hidden flex-shrink-0 flex items-center justify-center">
                            <img src={product.images[0]} alt={displayName} className="object-cover w-full h-full" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-sm sm:text-base text-neutral-805 dark:text-white line-clamp-1 group-hover:text-primary-500 transition-colors">
                              {displayName}
                            </h4>
                            <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-500 uppercase tracking-widest bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full inline-block">
                              {product.unit}
                            </span>
                            <button
                              onClick={() => removeItem(product.id)}
                              className="text-[10px] sm:text-xs font-bold text-red-500 hover:text-red-400 flex items-center gap-1.5 pt-1.5 focus:outline-none"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="col-span-1 md:col-span-2 text-left md:text-center">
                          <span className="md:hidden text-xs font-bold text-neutral-600 dark:text-neutral-450 mr-2">Price:</span>
                          <span className="text-sm font-semibold text-neutral-850 dark:text-white">
                            ₹{product.price}
                          </span>
                        </div>

                        {/* Quantity Counter */}
                        <div className="col-span-1 md:col-span-2 flex md:justify-center">
                          <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-card bg-neutral-50 dark:bg-neutral-850">
                            <button
                              onClick={() => quantity > 1 ? updateQuantity(product.id, quantity - 1) : removeItem(product.id)}
                              className="p-2 hover:text-primary-500 text-neutral-600 dark:text-neutral-400 transition-colors focus:outline-none cursor-pointer min-w-[32px] flex items-center justify-center"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-sm font-bold px-2 text-neutral-850 dark:text-white select-none w-6 text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(product.id, quantity + 1)}
                              className="p-2 hover:text-primary-500 text-neutral-650 dark:text-neutral-400 transition-colors focus:outline-none cursor-pointer min-w-[32px] flex items-center justify-center"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="col-span-1 md:col-span-2 text-left md:text-right">
                          <span className="md:hidden text-xs font-bold text-neutral-600 dark:text-neutral-450 mr-2">Total:</span>
                          <span className="text-base font-black text-neutral-900 dark:text-white">
                            ₹{product.price * quantity}
                          </span>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Back to shop button */}
              <Link
                href="/shop"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-500 hover:text-primary-400 transition-colors uppercase tracking-widest pl-2"
              >
                ← Continue Shopping
              </Link>
            </div>

            {/* Order Summary Sidebar (Right Column, Sticky) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              
              {/* Promo Coupon Card */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-5 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider mb-3">
                  <Tag className="w-4 h-4 text-primary-500" />
                  <span>Promo Coupon Code</span>
                </div>

                <AnimatePresence mode="wait">
                  {activeCoupon ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-primary-500/10 border border-primary-500/20 rounded-card p-3 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary-500" />
                        <div>
                          <p className="font-bold text-primary-500">{activeCoupon}</p>
                          <p className="text-[10px] text-neutral-600 dark:text-neutral-400">
                            {activeCoupon === 'ORGANIC10' ? '10% discount applied' : 'Free delivery active'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-[10px] font-bold text-red-500 hover:text-red-400 uppercase tracking-widest focus:outline-none"
                      >
                        Remove
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleApplyCoupon}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="ORGANIC10 / AETHERFREE"
                        className="flex-1 text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white uppercase outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <Button
                        type="submit"
                        variant="secondary"
                        disabled={!couponCode.trim()}
                        className="text-xs font-bold py-2 border border-neutral-200 dark:border-neutral-800"
                      >
                        Apply
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              {/* Order Summary calculations */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-lg text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
                  Order Summary
                </h3>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-neutral-650 dark:text-neutral-400 font-semibold">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#2D6A4F] dark:text-[#52B788] font-bold">
                      <span className="flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5" />
                        Discount
                      </span>
                      <span>- ₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-neutral-650 dark:text-neutral-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      Delivery
                    </span>
                    {deliveryFee === 0 ? (
                      <span className="text-success font-bold">Free</span>
                    ) : (
                      <span>₹{deliveryFee}</span>
                    )}
                  </div>

                  {remainingForFreeShipping > 0 && activeCoupon !== 'AETHERFREE' && (
                    <div className="bg-primary-500/5 rounded-card p-3 text-xs text-neutral-700 dark:text-neutral-450 border border-primary-500/10">
                      Add <span className="font-bold text-primary-500">₹{remainingForFreeShipping}</span> more for <span className="font-bold">Free Delivery</span>!
                    </div>
                  )}
                </div>

                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex justify-between items-baseline">
                  <span className="text-base font-bold text-neutral-900 dark:text-white">Total</span>
                  <span className="text-2.5xl font-black text-primary-700 dark:text-primary-400 tracking-tight">
                    ₹{orderTotal}
                  </span>
                </div>

                <Button
                  variant="cta"
                  size="lg"
                  onClick={handleProceedCheckout}
                  className="w-full font-bold text-base bg-gradient-to-r from-primary-500 to-primary-700 text-white py-3 shadow-md"
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Proceed to Checkout
                </Button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-neutral-600 dark:text-neutral-450 uppercase tracking-widest pt-2">
                  <Lock className="w-4 h-4 text-primary-500" />
                  <span>Secure Checkout Guaranteed</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* OTP Login Modal Portal */}
      <OTPModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

    </div>
  );
}
