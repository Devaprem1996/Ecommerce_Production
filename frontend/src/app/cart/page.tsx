"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
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
  Tag,
  Heart,
  X,
  ShieldCheck,
  Star,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useWishlist } from '@/hooks/useWishlist';
import { mockProducts } from '@/constants/mockData';
import { toast } from '@/components/ui/Toast';
import { slugify } from '@/utils/slugify';
import { ProductType } from '@/types';

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const router = useRouter();

  // Cart Store
  const { 
    items, 
    updateQuantity, 
    removeItem, 
    clearCart,
    addItem,
    getTotal, 
    getItemCount 
  } = useCartStore();

  // Wishlist Store
  const { items: wishlistItems, toggleItem, hasItem } = useWishlist();

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // GSAP Button Ref
  const checkoutBtnRef = useRef<HTMLButtonElement>(null);

  const subtotal = getTotal();
  const itemCount = getItemCount();

  // Delivery Calculations
  const freeShippingThreshold = 499;
  const standardShippingCost = 50;
  const isFreeDelivery = subtotal >= freeShippingThreshold || activeCoupon === 'YATHUFREE';
  const deliveryFee = itemCount > 0 && !isFreeDelivery ? standardShippingCost : 0;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const orderTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  // Dynamic Estimated Delivery Date (3 days out)
  const estimatedDeliveryDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toLocaleDateString(currentLang === 'ta' ? 'ta-IN' : 'en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }, [currentLang]);

  // Magnetic hover effect on checkout button using GSAP
  useEffect(() => {
    const btn = checkoutBtnRef.current;
    if (!btn) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      gsap.to(btn, { x: x * 0.12, y: y * 0.12, duration: 0.25, ease: 'power2.out' });
    };

    const handleMouseLeave = () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    };

    btn.addEventListener('mousemove', handleMouseMove);
    btn.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      btn.removeEventListener('mousemove', handleMouseMove);
      btn.removeEventListener('mouseleave', handleMouseLeave);
      gsap.killTweensOf(btn);
    };
  }, []);

  // Apply Coupon Logic
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const code = couponCode.toUpperCase().trim();
    if (code === 'ORGANIC10') {
      setActiveCoupon(code);
      setDiscountAmount(Math.round(subtotal * 0.1));
      toast.success(
        currentLang === 'ta'
          ? '"ORGANIC10" கூப்பன் பயன்படுத்தப்பட்டது! 10% தள்ளுபடி.'
          : 'Coupon "ORGANIC10" applied! 10% discount saved.'
      );
    } else if (code === 'YATHUFREE') {
      setActiveCoupon(code);
      setDiscountAmount(0);
      toast.success(
        currentLang === 'ta'
          ? '"YATHUFREE" கூப்பன் பயன்படுத்தப்பட்டது! இலவச டெலிவரி.'
          : 'Coupon "YATHUFREE" applied! Free Delivery unlocked.'
      );
    } else {
      toast.error(
        currentLang === 'ta'
          ? 'தவறான கூப்பன் குறியீடு. ORGANIC10 அல்லது YATHUFREE முயற்சிக்கவும்'
          : 'Invalid coupon code. Try ORGANIC10 or YATHUFREE'
      );
    }
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon(null);
    setDiscountAmount(0);
    setCouponCode('');
    toast.info(currentLang === 'ta' ? 'கூப்பன் நீக்கப்பட்டது' : 'Coupon code removed.');
  };

  // Move Cart Item to Wishlist
  const handleMoveToWishlist = (product: ProductType) => {
    if (!hasItem(product.id)) {
      toggleItem(product);
    }
    removeItem(product.id);
    const displayName = currentLang === 'ta' && product.nameTamil ? product.nameTamil : product.name;
    toast.success(
      currentLang === 'ta'
        ? `${displayName} விருப்பப்பட்டியலுக்கு மாற்றப்பட்டது!`
        : `${displayName} moved to your wishlist!`
    );
  };

  // Move Wishlist Item to Cart
  const handleMoveWishlistToCart = (product: ProductType) => {
    addItem(product, 1);
    toggleItem(product);
    const displayName = currentLang === 'ta' && product.nameTamil ? product.nameTamil : product.name;
    toast.cart(`${displayName} (1)`);
  };

  // Cross-sell recommendations (excluding items already in cart)
  const crossSellProducts = useMemo(() => {
    const cartIds = new Set(items.map(i => i.product.id));
    return mockProducts.filter(p => !cartIds.has(p.id)).slice(0, 4);
  }, [items]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0A0D0E] font-sans pb-24 transition-colors duration-300">
      
      {/* 1. Header with Breadcrumb */}
      <div className="w-full bg-white dark:bg-[#0E1214] border-b border-neutral-200/70 dark:border-neutral-800/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
            <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {t('shop.breadcrumb_home', 'Home')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <Link href="/shop" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              {t('shop.breadcrumb_shop', 'Shop')}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-primary-600 dark:text-primary-400">
              {t('cart.title', 'Shopping Cart')}
            </span>
          </nav>
          
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <h1 className="text-2.5xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-neutral-900 dark:text-white tracking-tight">
              {currentLang === 'ta' ? 'உங்கள் கூடை' : 'Your cart'}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {itemCount} {itemCount === 1 ? 'Product' : 'Products'} {currentLang === 'ta' ? 'கூடையில் உள்ளது' : 'in Your cart'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        
        {/* Dynamic Free Shipping Progress Bar */}
        {itemCount > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-[#101416] border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-2">
              <span className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                {remainingForFreeShipping > 0 ? (
                  currentLang === 'ta' 
                    ? `இலவச பண்ணை டெலிவரி பெற இன்னும் ₹${remainingForFreeShipping} சேர்க்கவும்`
                    : `Add ₹${remainingForFreeShipping} more to unlock FREE Express Farm Delivery!`
                ) : (
                  currentLang === 'ta'
                    ? '🎉 வாழ்த்துகள்! உங்களுக்கு இலவச டெலிவரி தகுதி கிடைத்துள்ளது!'
                    : '🎉 Congratulations! You have unlocked FREE Express Farm Delivery!'
                )}
              </span>
              <span className="text-xs font-black text-primary-600 dark:text-primary-400">
                {Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%
              </span>
            </div>
            <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-600 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Cart Grid (Matching Reference Screenshot) */}
        {items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-[#101416] border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-8 shadow-xs">
            <div className="w-20 h-20 text-neutral-300 dark:text-neutral-700 mb-4">
              <ShoppingBag className="w-full h-full stroke-[1.2]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white mb-2">
              {t('cart.empty', 'Your Cart is Empty')}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mb-6">
              {t('cart.empty_desc', 'Explore our traditional cold-pressed oils, mountain honey, and heritage grains directly from local farmers.')}
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center py-3 px-8 rounded-xl font-bold text-sm text-white bg-primary-600 hover:bg-primary-700 active:scale-95 shadow-sm transition-all cursor-pointer"
            >
              {t('cart.shop_now', 'Start Shopping')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Cart Items Box (Matching Reference Layout) */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="bg-white dark:bg-[#101416] border border-neutral-200/80 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-xs">
                
                {/* Items List */}
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  <AnimatePresence initial={false}>
                    {items.map(({ product, quantity }) => {
                      const displayName = currentLang === 'ta' && product.nameTamil ? product.nameTamil : product.name;
                      const isWishlisted = hasItem(product.id);

                      return (
                        <motion.div
                          key={`${product.id}-${product.unit}`}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0, scale: 0.96 }}
                          transition={{ duration: 0.25 }}
                          className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                        >
                          {/* Product Thumbnail & Details */}
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <Link
                              href={`/shop/${slugify(product.name)}`}
                              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#F4F4F2] dark:bg-[#161B1E] border border-neutral-200/70 dark:border-neutral-800 p-2 shrink-0 overflow-hidden flex items-center justify-center hover:opacity-90 transition-opacity"
                            >
                              <img
                                src={product.images[0] || '/images/placeholder.svg'}
                                alt={displayName}
                                className="object-contain w-full h-full"
                              />
                            </Link>

                            <div className="flex flex-col min-w-0">
                              <Link
                                href={`/shop/${slugify(product.name)}`}
                                className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-1"
                              >
                                {displayName}
                              </Link>
                              
                              <div className="flex items-center flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                <span>Unit: <strong className="text-neutral-700 dark:text-neutral-300 font-semibold">{product.unit || 'Standard'}</strong></span>
                                <span>•</span>
                                <span>Price: <strong className="text-neutral-700 dark:text-neutral-300 font-semibold">₹{product.price}</strong> / unit</span>
                              </div>

                              {product.isOrganic && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-1">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  100% Organic Certified
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Line Item Total, Quantity Stepper, and Actions */}
                          <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
                            
                            {/* Total Line Item Price */}
                            <div className="text-left sm:text-right shrink-0">
                              <span className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">
                                ₹{product.price * quantity}
                              </span>
                            </div>

                            {/* Touch-Friendly Quantity Stepper (Matching Reference: Qty selector) */}
                            <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-xl bg-neutral-50 dark:bg-[#161B1E] overflow-hidden">
                              <button
                                type="button"
                                onClick={() => quantity > 1 ? updateQuantity(product.id, quantity - 1) : removeItem(product.id)}
                                className="p-2 sm:p-2.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer min-w-[36px] flex items-center justify-center focus:outline-none"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs sm:text-sm font-bold px-2 sm:px-3 text-neutral-900 dark:text-white select-none w-8 text-center font-mono">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(product.id, quantity + 1)}
                                className="p-2 sm:p-2.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer min-w-[36px] flex items-center justify-center focus:outline-none"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Wishlist Heart & Remove X Buttons (Exact Match to Reference Icons) */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveToWishlist(product)}
                                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                                  isWishlisted
                                    ? 'border-red-200 dark:border-red-900 text-red-500 bg-red-50/50 dark:bg-red-950/20'
                                    : 'border-neutral-200 dark:border-neutral-750 text-neutral-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50/30'
                                }`}
                                title="Save / Move to Wishlist"
                                aria-label="Move to Wishlist"
                              >
                                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                              </button>

                              <button
                                type="button"
                                onClick={() => removeItem(product.id)}
                                className="p-2 rounded-lg border border-neutral-200 dark:border-neutral-750 text-neutral-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50/30 transition-colors cursor-pointer"
                                title="Remove from Cart"
                                aria-label="Remove item"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Bottom Bar inside Cart Box (Remove All + Continue Shopping) */}
                <div className="p-4 sm:p-5 bg-neutral-50/70 dark:bg-[#14181B] border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to remove all items from your cart?')) {
                        clearCart();
                        toast.info('Cart cleared');
                      }
                    }}
                    className="text-xs font-semibold text-neutral-500 hover:text-red-500 underline underline-offset-4 transition-colors cursor-pointer"
                  >
                    Remove all from cart
                  </button>

                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors uppercase tracking-wider"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Continue Shopping</span>
                  </Link>
                </div>

              </div>
            </div>

            {/* Right Column: Order Summary Sidebar (Matching Reference Screenshot) */}
            <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
              
              {/* Order Summary Box */}
              <div className="bg-white dark:bg-[#101416] border border-neutral-200/80 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
                
                {/* Promocode Input (Matching Reference Design) */}
                <div>
                  <form onSubmit={handleApplyCoupon} className="flex items-center border border-neutral-200 dark:border-neutral-750 rounded-xl overflow-hidden focus-within:border-primary-500 transition-colors bg-white dark:bg-[#161B1E]">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Promocode"
                      className="w-full px-3.5 py-2.5 text-xs font-semibold uppercase bg-transparent text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!couponCode.trim()}
                      className="px-4 py-2.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                    >
                      Apply
                    </button>
                  </form>

                  {/* Active Coupon Badge */}
                  {activeCoupon && (
                    <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        {activeCoupon} Applied!
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Quick Coupon Suggestions */}
                  {!activeCoupon && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
                      <span className="text-neutral-400 font-semibold uppercase">Try:</span>
                      <button
                        type="button"
                        onClick={() => { setCouponCode('ORGANIC10'); }}
                        className="font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 cursor-pointer"
                      >
                        ORGANIC10 (10% OFF)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setCouponCode('YATHUFREE'); }}
                        className="font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 cursor-pointer"
                      >
                        YATHUFREE (Free Delivery)
                      </button>
                    </div>
                  )}
                </div>

                {/* Calculation Breakdown Lines (Exact Match to Reference Screenshot) */}
                <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs sm:text-sm">
                  
                  <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-400">
                    <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}:</span>
                    <span className="font-bold text-neutral-900 dark:text-white">₹{subtotal}</span>
                  </div>

                  <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-400">
                    <span>Delivery cost:</span>
                    {deliveryFee === 0 ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Free</span>
                    ) : (
                      <span className="font-bold text-neutral-900 dark:text-white">₹{deliveryFee}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-neutral-600 dark:text-neutral-400">
                    <span>Tax:</span>
                    <span className="font-medium text-neutral-500">Inclusive</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center font-bold text-emerald-600 dark:text-emerald-400">
                      <span>Discount:</span>
                      <span>- ₹{discountAmount}</span>
                    </div>
                  )}
                </div>

                {/* Total Line */}
                <div className="pt-4 border-t border-neutral-200/80 dark:border-neutral-800 flex justify-between items-baseline">
                  <span className="text-base font-bold text-neutral-900 dark:text-white">Total:</span>
                  <span className="text-2xl sm:text-3xl font-black text-primary-600 dark:text-primary-400 tracking-tight">
                    ₹{orderTotal}
                  </span>
                </div>

                {/* Primary Checkout Button (Blue / Royal in Reference -> Themed Primary Green with GSAP) */}
                <button
                  ref={checkoutBtnRef}
                  type="button"
                  onClick={() => router.push('/checkout')}
                  className="w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base text-white bg-primary-600 hover:bg-primary-700 active:scale-98 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Delivery Notice Card (Exact Reference recreation below checkout button) */}
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#161B1E] border border-neutral-200/60 dark:border-neutral-800 flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-300">
                  <Truck className="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0" />
                  <div>
                    <p className="font-bold text-neutral-900 dark:text-white leading-tight">
                      Delivered by {estimatedDeliveryDate}
                    </p>
                    <p className="text-[11px] text-neutral-500 leading-tight mt-0.5">
                      Direct from South Indian Organic Farms
                    </p>
                  </div>
                </div>

                {/* Guaranteed Secure Checkout Badge */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 pt-1">
                  <Lock className="w-3.5 h-3.5 text-primary-500" />
                  <span>100% Safe & Encrypted Checkout</span>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* 2. "Customer also bought these" / Recommended Cross-Sells (Exact Section from Reference) */}
        {crossSellProducts.length > 0 && (
          <div className="mt-16 sm:mt-20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-neutral-900 dark:text-white">
                  Customer also bought these
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Frequently paired together with authentic wood-pressed staples.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {crossSellProducts.map((p) => {
                const displayName = currentLang === 'ta' && p.nameTamil ? p.nameTamil : p.name;
                const isWish = hasItem(p.id);

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#101416] border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col justify-between group hover:shadow-md transition-shadow"
                  >
                    <div>
                      {/* Image Frame with Wishlist Heart */}
                      <div className="relative aspect-square w-full rounded-xl bg-[#F4F4F2] dark:bg-[#161B1E] p-3 mb-3.5 flex items-center justify-center overflow-hidden">
                        <Link href={`/shop/${slugify(p.name)}`} className="w-full h-full flex items-center justify-center">
                          <img
                            src={p.images[0] || '/images/placeholder.svg'}
                            alt={displayName}
                            className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                        </Link>
                        
                        <button
                          type="button"
                          onClick={() => {
                            toggleItem(p);
                            toast.success(isWish ? 'Removed from wishlist' : 'Added to wishlist');
                          }}
                          className={`absolute top-2.5 right-2.5 p-2 rounded-full border bg-white/90 dark:bg-black/60 backdrop-blur-sm transition-colors cursor-pointer ${
                            isWish ? 'text-red-500 border-red-200' : 'text-neutral-400 hover:text-red-500 border-neutral-200 dark:border-neutral-700'
                          }`}
                          aria-label="Wishlist"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isWish ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Title & Reviews */}
                      <Link
                        href={`/shop/${slugify(p.name)}`}
                        className="font-bold text-sm text-neutral-900 dark:text-white hover:text-primary-600 line-clamp-1 transition-colors"
                      >
                        {displayName}
                      </Link>

                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 mt-1">
                        <div className="flex text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <span className="font-bold text-neutral-700 dark:text-neutral-300">{p.rating.toFixed(1)}</span>
                        <span>({p.reviewsCount} reviews)</span>
                      </div>

                      {/* Price */}
                      <div className="mt-2 text-base font-black text-primary-600 dark:text-primary-400">
                        ₹{p.price}
                      </div>
                    </div>

                    {/* Add to Cart Button (Matching Reference's Full-Width Pill) */}
                    <button
                      type="button"
                      onClick={() => {
                        addItem(p, 1);
                        toast.cart(`${displayName} (1)`);
                      }}
                      className="mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/60 hover:bg-primary-100 dark:hover:bg-primary-900/60 border border-primary-200/80 dark:border-primary-800/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to cart</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. "Your wishlist" Section (Exact Section from Reference Screenshot) */}
        <div className="mt-16 sm:mt-20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-neutral-900 dark:text-white">
                Your wishlist ({wishlistItems.length})
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Saved organic staples waiting for your harvest order.
              </p>
            </div>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-[#101416] border border-neutral-200/80 dark:border-neutral-800 text-center shadow-xs">
              <Heart className="w-8 h-8 text-neutral-300 dark:text-neutral-700 mx-auto mb-2 stroke-[1.5]" />
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Your wishlist is empty
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Tap the heart on any harvest to save it for your next order.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {wishlistItems.map((p) => {
                const displayName = currentLang === 'ta' && p.nameTamil ? p.nameTamil : p.name;

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#101416] border border-neutral-200/80 dark:border-neutral-800 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Thumbnail */}
                      <div className="relative aspect-square w-full rounded-xl bg-[#F4F4F2] dark:bg-[#161B1E] p-2.5 mb-3 flex items-center justify-center overflow-hidden">
                        <Link href={`/shop/${slugify(p.name)}`} className="w-full h-full flex items-center justify-center">
                          <img
                            src={p.images[0] || '/images/placeholder.svg'}
                            alt={displayName}
                            className="object-contain w-full h-full"
                          />
                        </Link>
                      </div>

                      {/* Title & Info */}
                      <Link
                        href={`/shop/${slugify(p.name)}`}
                        className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white hover:text-primary-600 line-clamp-1 transition-colors"
                      >
                        {displayName}
                      </Link>

                      <div className="mt-1 font-black text-sm text-primary-600 dark:text-primary-400">
                        ₹{p.price}
                      </div>

                      <span className="inline-block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        In stock
                      </span>
                    </div>

                    {/* Actions: Move to cart & Remove from wishlist (Matching Reference) */}
                    <div className="mt-4 space-y-2">
                      <button
                        type="button"
                        onClick={() => handleMoveWishlistToCart(p)}
                        className="w-full py-2 px-3 rounded-xl text-xs font-bold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/60 hover:bg-primary-100 border border-primary-200/80 dark:border-primary-800/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to cart</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          toggleItem(p);
                          toast.info('Removed from wishlist');
                        }}
                        className="w-full py-1.5 px-3 rounded-lg text-[11px] font-semibold text-neutral-500 hover:text-red-500 hover:bg-neutral-50 dark:hover:bg-neutral-850 transition-colors cursor-pointer"
                      >
                        Remove from wishlist
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
