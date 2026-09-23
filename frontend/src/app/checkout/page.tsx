"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  Truck, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  QrCode,
  Smartphone,
  Info,
  ExternalLink,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { apiClient } from '@/services/api-client';
import { accountService, UserAddress } from '@/services/account.service';
import { openRazorpayCheckout } from '@/lib/razorpay';
import { paymentService } from '@/services/payment.service';

interface AddressData {
  name: string;
  mobile: string;
  addressLine1: string;
  addressLine2: string;
  pincode: string;
  city: string;
  state: string;
}

export default function CheckoutPage() {
  const { t } = useTranslation();
  const router = useRouter();

  // Stores
  const { items, getTotal, clearCart, getItemCount } = useCartStore();
  const { user, isAuthenticated, login } = useAuthStore();

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Guest Phone OTP States
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);
  const [otpError, setOtpError] = useState<string | null>(null);

  // OTP Countdown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOtpSent && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, otpTimer]);

  const handleSendCheckoutOtp = async () => {
    const cleanMobile = addressForm.mobile.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      toast.warning('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsOtpSending(true);
    setOtpError(null);
    try {
      const res = await apiClient.post('/auth/otp/send', {
        phone: cleanMobile,
        purpose: 'CHECKOUT',
      });
      if (res.success) {
        setIsOtpSent(true);
        setOtpTimer(30);
        if ((res as any).devOtp) {
          toast.info(`Test OTP: ${(res as any).devOtp}`);
        } else {
          toast.success(`OTP sent to +91 ${cleanMobile}`);
        }
      } else {
        setOtpError(res.message || 'Failed to send OTP.');
        toast.error(res.message || 'Failed to send OTP.');
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to send verification SMS.';
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setIsOtpSending(false);
    }
  };

  const handleVerifyCheckoutOtp = async () => {
    if (otpInput.length !== 6) {
      toast.warning('Please enter the complete 6-digit OTP code.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);
    try {
      const cleanMobile = addressForm.mobile.replace(/\D/g, '').slice(-10);
      const res = await apiClient.post('/auth/otp/verify', {
        phone: cleanMobile,
        otp: otpInput,
        purpose: 'CHECKOUT',
        name: addressForm.name || 'Customer',
      });

      if (res.success && res.data?.accessToken) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', res.data.accessToken);
          document.cookie = `access_token=${res.data.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
        login(res.data.user, res.data.accessToken);
        toast.success('Mobile verified! Proceeding with checkout.');
      } else {
        setOtpError(res.message || 'Invalid verification code.');
        toast.error(res.message || 'Invalid verification code.');
      }
    } catch (err: any) {
      const msg = err?.message || 'Invalid verification code.';
      setOtpError(msg);
      toast.error(msg);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Checkout Step
  const [activeStep, setActiveStep] = useState<'address' | 'payment' | 'confirm'>('address');

  // Redirect if cart is empty after hydration (unless we are on order confirmation step)
  useEffect(() => {
    if (hasMounted && items.length === 0 && activeStep !== 'confirm') {
      router.replace('/shop');
    }
  }, [hasMounted, items, activeStep, router]);

  // Address Step States
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  // Load saved addresses from database for authenticated customer
  useEffect(() => {
    if (isAuthenticated) {
      accountService
        .getAddresses()
        .then((addrs) => {
          setSavedAddresses(addrs);
          const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            setUseNewAddress(false);
          } else {
            setUseNewAddress(true);
          }
        })
        .catch((err) => {
          console.error("Failed to load saved addresses:", err);
        })
        .finally(() => {
          setIsLoadingAddresses(false);
        });
    }
  }, [isAuthenticated]);
  const [addressForm, setAddressForm] = useState<AddressData>({
    name: '',
    mobile: '',
    addressLine1: '',
    addressLine2: '',
    pincode: '',
    city: '',
    state: ''
  });
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState<string | null>(null);

  // Payment Step States
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');
  
  // Card Inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  // UPI Inputs
  const [upiId, setUpiId] = useState('');

  // Payment Loader
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Success Confirmation States
  const [orderNumber, setOrderNumber] = useState('');
  const [estimatedDays, setEstimatedDays] = useState(3);
  const [confirmedTotal, setConfirmedTotal] = useState(0);

  const subtotal = getTotal();
  const deliveryFee = subtotal >= 499 ? 0 : 50;
  const codFee = paymentMethod === 'cod' ? 30 : 0;
  const totalAmount = subtotal + deliveryFee + codFee;

  // Sync Pincode to auto-fill city/state
  useEffect(() => {
    if (addressForm.pincode.length === 6 && /^\d{6}$/.test(addressForm.pincode)) {
      lookupPincode(addressForm.pincode);
    } else {
      setPincodeError(null);
    }
  }, [addressForm.pincode]);

  const lookupPincode = async (code: string) => {
    setPincodeLoading(true);
    setPincodeError(null);
    try {
      const res = await fetch(`/api/pincode/${code}`);
      if (res.ok) {
        const data = await res.json();
        if (data.available) {
          setAddressForm(prev => ({
            ...prev,
            city: data.city,
            state: data.state || (data.estimatedDays === 3 ? 'Tamil Nadu' : 'State')
          }));
          toast.success(`Serviceable: ${data.city}`);
        } else {
          setPincodeError('Pincode is not serviceable by our delivery partners.');
        }
      } else {
        setPincodeError('Invalid Pincode. Please check and try again.');
      }
    } catch (e) {
      setPincodeError('Pincode service is currently unavailable.');
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (useNewAddress || !isAuthenticated) {
      const { name, mobile, addressLine1, pincode, city, state } = addressForm;
      if (!name || !mobile || !addressLine1 || !pincode || !city || !state) {
        toast.warning('Please fill in all required address fields.');
        return;
      }
      if (pincodeError) {
        toast.warning('Please use a serviceable pincode.');
        return;
      }
      if (!isAuthenticated) {
        toast.warning('Please verify your mobile number with OTP to continue.');
        if (!isOtpSent) {
          handleSendCheckoutOtp();
        }
        return;
      }
    }
    // Proceed to Payment
    setActiveStep('payment');
  };

  const detectCardType = (number: string) => {
    const cleanNum = number.replace(/\D/g, '');
    if (cleanNum.startsWith('4')) return 'Visa';
    if (cleanNum.startsWith('5')) return 'Mastercard';
    if (cleanNum.startsWith('6')) return 'RuPay';
    return 'Generic';
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length >= 2) {
      return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}`;
    }
    return cleanValue;
  };

  const handlePlaceOrder = async () => {
    setIsProcessingPayment(true);

    const orderItems = items.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));

    const activeAddr = useNewAddress
      ? null
      : savedAddresses.find((a) => a.id === selectedAddressId);

    const orderPayload = {
      addressId: activeAddr?.id,
      shippingAddress: useNewAddress
        ? {
            name: addressForm.name,
            mobile: addressForm.mobile,
            addressLine1: addressForm.addressLine1,
            addressLine2: addressForm.addressLine2 || null,
            city: addressForm.city,
            state: addressForm.state,
            pincode: addressForm.pincode,
          }
        : undefined,
      items: orderItems,
      paymentMethod,
    };

    try {
      if (paymentMethod === 'cod') {
        const createdOrder = await accountService.createOrder(orderPayload);
        setIsProcessingPayment(false);
        clearCart();
        const orderNo = createdOrder.orderNumber || createdOrder.id;
        toast.success('Order placed successfully (Cash on Delivery)!');
        router.push(`/checkout/success?orderId=${orderNo}`);
        return;
      }

      // Online payment via Razorpay
      const createdOrder = await accountService.createOrder({
        ...orderPayload,
        paymentMethod: 'razorpay',
      });

      // Call backend POST /api/create-order (computes amount server-side from order record)
      const razorpayOrder = await paymentService.createRazorpayOrder({
        orderId: createdOrder.id,
      });

      // Open Razorpay Standard Web Checkout Modal
      await openRazorpayCheckout({
        orderData: razorpayOrder,
        name: 'Yathu Arokiyagam',
        description: `Order #${createdOrder.orderNumber || createdOrder.id}`,
        prefill: {
          name: addressForm.name || (user as any)?.name || '',
          email: (user as any)?.email || '',
          contact: addressForm.mobile || (user as any)?.phone || '',
        },
        notes: {
          order_id: createdOrder.id,
        },
        themeColor: '#16a34a',
        onSuccess: async (paymentResult) => {
          try {
            // POST to /api/verify-payment to verify HMAC-SHA256 signature server-side
            const verifyRes = await paymentService.verifyPaymentSignature({
              razorpay_payment_id: paymentResult.razorpay_payment_id,
              razorpay_order_id: paymentResult.razorpay_order_id,
              razorpay_signature: paymentResult.razorpay_signature,
              orderId: createdOrder.id,
            });

            if (verifyRes.verified || verifyRes.success) {
              clearCart();
              const orderNo = createdOrder.orderNumber || createdOrder.id;
              toast.success('Payment verified! Order placed successfully.');
              router.push(`/checkout/success?orderId=${orderNo}`);
            } else {
              setIsProcessingPayment(false);
              toast.error('Payment signature verification failed.');
            }
          } catch (verifyErr: any) {
            setIsProcessingPayment(false);
            console.error('Payment verification failed:', verifyErr);
            toast.error(
              verifyErr.message ||
                'Payment verification failed. Please contact customer support.'
            );
          }
        },
        onDismiss: () => {
          // Customer closed the modal: treat as cancelled, not an error
          setIsProcessingPayment(false);
          toast.info(
            'Payment window was closed. You can retry payment whenever you are ready.'
          );
        },
        onFailure: (err) => {
          // Payment authorization failed: show returned error and allow retry
          setIsProcessingPayment(false);
          console.error('Razorpay payment failed:', err?.description || err?.code || err);
          toast.error(err?.description || 'Payment was declined or failed.');
        },
      });
    } catch (err: any) {
      setIsProcessingPayment(false);
      console.error('Failed to process payment/order:', err);
      toast.error(err?.message || 'Failed to initiate payment. Please try again.');
    }
  };


  // Pre-formatted Whatsapp message
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Hello! I just placed an order at Yathu Arokiyagam!\nOrder Number: *${orderNumber}*\nTotal Amount: *₹${confirmedTotal}*\nExpected Delivery: *${estimatedDays} days*\nHealthy traditional goodness! 🌱`
  )}`;

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans pb-20 transition-colors duration-normal">
        <div className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2.5xl sm:text-3.5xl font-bold font-heading text-neutral-900 dark:text-white leading-tight">
              Checkout
            </h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mb-3" />
          <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">Loading your checkout details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans pb-20 transition-colors duration-normal">
      
      {/* Page Header */}
      <div className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2.5xl sm:text-3.5xl font-bold font-heading text-neutral-900 dark:text-white leading-tight">
            Checkout
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Step Indicator */}
        <div className="mb-10 max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-neutral-200 dark:bg-neutral-800 z-0 rounded-full" />
            
            {/* Progress line */}
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary-500 z-0 rounded-full transition-all duration-slow ${
              activeStep === 'address' ? 'right-3/4' : activeStep === 'payment' ? 'right-1/4' : 'right-0'
            }`} />

            {/* Step 1: Cart */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary-500 border-4 border-white dark:border-neutral-950 flex items-center justify-center text-white font-bold text-sm shadow-md">
                1
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-primary-500 uppercase tracking-wider">
                Cart
              </span>
            </div>

            {/* Step 2: Address */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-4 border-white dark:border-neutral-955 flex items-center justify-center font-bold text-sm shadow-sm ${
                activeStep === 'address' ? 'bg-primary-500 text-white' : 'bg-primary-500 text-white'
              }`}>
                2
              </div>
              <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                activeStep === 'address' ? 'text-primary-500' : 'text-primary-500'
              }`}>
                Address
              </span>
            </div>

            {/* Step 3: Payment */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-4 border-white dark:border-neutral-955 flex items-center justify-center font-bold text-sm ${
                activeStep === 'payment' || activeStep === 'confirm'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}>
                3
              </div>
              <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                activeStep === 'payment' || activeStep === 'confirm' ? 'text-primary-500' : 'text-neutral-600 dark:text-neutral-400'
              }`}>
                Payment
              </span>
            </div>

            {/* Step 4: Confirm */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-4 border-white dark:border-neutral-955 flex items-center justify-center font-bold text-sm ${
                activeStep === 'confirm'
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}>
                4
              </div>
              <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                activeStep === 'confirm' ? 'text-primary-500' : 'text-neutral-600'
              }`}>
                Confirm
              </span>
            </div>
          </div>
        </div>

        {/* Wizard Panel */}
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            
            {/* ADDRESS STEP */}
            {activeStep === 'address' && (
              <motion.div
                key="address-step"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                {/* Left Column (Forms) */}
                <form onSubmit={handleAddressSubmit} className="lg:col-span-8 space-y-6">
                  
                  {/* Saved Addresses Panel */}
                  {isAuthenticated && (
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 shadow-sm space-y-4">
                      <h3 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider">
                        Select Shipping Address
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedAddresses.map(addr => (
                          <div
                            key={addr.id}
                            onClick={() => { setSelectedAddressId(addr.id); setUseNewAddress(false); }}
                            className={`p-4 rounded-card border-2 cursor-pointer transition-all relative ${
                              selectedAddressId === addr.id && !useNewAddress
                                ? 'border-primary-500 bg-primary-500/5 shadow-sm'
                                : 'border-neutral-200 dark:border-neutral-800 bg-transparent hover:border-neutral-350'
                            }`}
                          >
                            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                              {addr.fullName}
                            </h4>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                              {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                            </p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                              {addr.city}, {addr.state} - <span className="font-bold">{addr.postalCode}</span>
                            </p>
                            <p className="text-[10px] font-bold text-neutral-500 mt-2">
                              Mobile: {addr.phone}
                            </p>
                            {selectedAddressId === addr.id && !useNewAddress && (
                              <span className="absolute top-3 right-3 bg-primary-500 text-white rounded-full p-0.5">
                                <CheckCircle2 className="w-4 h-4 fill-primary-500 text-white" />
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {savedAddresses.length === 0 && !isLoadingAddresses && (
                        <p className="text-xs text-neutral-500 italic">
                          No saved delivery addresses found. Please enter your address details below.
                        </p>
                      )}


                      <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3">
                        <label className="flex items-center gap-2.5 text-xs font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={useNewAddress}
                            onChange={() => setUseNewAddress(!useNewAddress)}
                            className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-primary-500 focus:ring-primary-500"
                          />
                          <span>Or Ship to a New Address</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* New Address Form */}
                  {(!isAuthenticated || useNewAddress) && (
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 shadow-sm space-y-4">
                      <h3 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-800 pb-3">
                        New Shipping Address
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={addressForm.name}
                            onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                            className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                              Mobile Number *
                            </label>
                            {isAuthenticated && (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="tel"
                              required
                              disabled={isAuthenticated && !useNewAddress}
                              value={addressForm.mobile}
                              onChange={(e) => {
                                setAddressForm({ ...addressForm, mobile: e.target.value.replace(/\D/g, '') });
                                if (isOtpSent) setIsOtpSent(false);
                              }}
                              placeholder="10-digit mobile number"
                              maxLength={10}
                              className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                            {!isAuthenticated && (
                              <button
                                type="button"
                                onClick={handleSendCheckoutOtp}
                                disabled={isOtpSending || !/^[6-9]\d{9}$/.test(addressForm.mobile) || (isOtpSent && otpTimer > 0)}
                                className="px-3 py-2 rounded-card bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 shadow-sm"
                              >
                                {isOtpSending ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : isOtpSent && otpTimer > 0 ? (
                                  `Resend (${otpTimer}s)`
                                ) : isOtpSent ? (
                                  'Resend OTP'
                                ) : (
                                  'Verify with OTP'
                                )}
                              </button>
                            )}
                          </div>

                          {/* Inline OTP Verification Box for Guest Users */}
                          {!isAuthenticated && isOtpSent && (
                            <div className="mt-3 p-3.5 bg-neutral-50 dark:bg-neutral-800/60 border border-primary-200 dark:border-primary-900/50 rounded-card space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                                  <Smartphone className="w-3.5 h-3.5 text-primary-500" />
                                  Enter 6-Digit SMS Code
                                </p>
                                <span className="text-[10px] text-neutral-500">
                                  Sent to +91 {addressForm.mobile}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  maxLength={6}
                                  value={otpInput}
                                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                  placeholder="123456"
                                  className="w-36 text-center text-sm font-bold tracking-widest px-3 py-1.5 border border-primary-300 dark:border-primary-800 rounded bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <button
                                  type="button"
                                  onClick={handleVerifyCheckoutOtp}
                                  disabled={isVerifyingOtp || otpInput.length !== 6}
                                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                                >
                                  {isVerifyingOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm OTP'}
                                </button>
                              </div>
                              {otpError && (
                                <p className="text-[11px] font-semibold text-red-500 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  {otpError}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                            Address Line 1 *
                          </label>
                          <input
                            type="text"
                            required
                            value={addressForm.addressLine1}
                            onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                            className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                            Address Line 2 (Optional)
                          </label>
                          <input
                            type="text"
                            value={addressForm.addressLine2}
                            onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                            className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                            Pincode *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={addressForm.pincode}
                              onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                              className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                            {pincodeLoading && (
                              <Loader2 className="w-4 h-4 animate-spin text-primary-500 absolute right-3 top-1/2 -translate-y-1/2" />
                            )}
                          </div>
                          {pincodeError && (
                            <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-1 animate-shake">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {pincodeError}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                            City / District *
                          </label>
                          <input
                            type="text"
                            required
                            readOnly
                            value={addressForm.city}
                            placeholder="Auto-filled via pincode"
                            className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-750 bg-neutral-100 dark:bg-neutral-800 rounded-card text-neutral-905 dark:text-neutral-350 outline-none cursor-not-allowed"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                            State *
                          </label>
                          <input
                            type="text"
                            required
                            readOnly
                            value={addressForm.state}
                            placeholder="Auto-filled via pincode"
                            className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-750 bg-neutral-100 dark:bg-neutral-800 rounded-card text-neutral-905 dark:text-neutral-350 outline-none cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 justify-between pt-4">
                    <Link
                      href="/cart"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:underline uppercase tracking-widest"
                    >
                      ← Back to Cart
                    </Link>
                    <Button
                      type="submit"
                      variant="primary"
                      className="font-bold text-xs"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Proceed to Payment
                    </Button>
                  </div>

                </form>

                {/* Right Column (Mini Summary) */}
                <div className="lg:col-span-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
                    Order Summary
                  </h3>

                  <div className="max-h-[30vh] overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
                    {items.map(({ product, quantity }) => (
                      <div key={`${product.id}-${product.unit}`} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-3">
                          <img src={product.images[0]} alt={product.name} className="w-8 h-8 rounded object-cover" />
                          <div>
                            <p className="font-bold text-neutral-850 dark:text-white line-clamp-1 max-w-[140px]">
                              {product.name}
                            </p>
                            <p className="text-[10px] text-neutral-500 font-semibold">
                              {product.unit} × {quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-neutral-855 dark:text-white">
                          ₹{product.price * quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 space-y-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span suppressHydrationWarning>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      {deliveryFee === 0 ? <span className="text-success font-bold">Free</span> : <span suppressHydrationWarning>₹{deliveryFee}</span>}
                    </div>
                    <div className="flex justify-between text-base font-black text-neutral-900 dark:text-white border-t border-neutral-100 dark:border-neutral-800 pt-3">
                      <span>Total Amount</span>
                      <span suppressHydrationWarning>₹{totalAmount}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PAYMENT STEP */}
            {activeStep === 'payment' && (
              <motion.div
                key="payment-step"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                {/* Left Column (Payment Panels) */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Select Payment panel */}
                  <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 shadow-sm">
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-white uppercase tracking-wider mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                      Choose Payment Method
                    </h3>

                    {/* Horizontal tab lists */}
                    <div className="flex border-b border-neutral-100 dark:border-neutral-800 mb-6 overflow-x-auto">
                      {(['upi', 'card', 'netbanking', 'cod'] as const).map(method => (
                        <button
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`px-4 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                            paymentMethod === method
                              ? 'border-primary-500 text-primary-500'
                              : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                          }`}
                        >
                          {method === 'upi' ? 'UPI' :
                           method === 'card' ? 'Credit / Debit Card' :
                           method === 'netbanking' ? 'Net Banking' :
                           'Cash on Delivery (COD)'}
                        </button>
                      ))}
                    </div>

                    {/* Active tab component render */}
                    <div className="min-h-[200px]">
                      
                      {/* UPI */}
                      {paymentMethod === 'upi' && (
                        <div className="p-5 border border-primary-100 dark:border-primary-900/30 rounded-feature bg-primary-50/20 dark:bg-primary-950/10 space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded-card">
                              <Smartphone className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                                Instant UPI Payment
                              </h4>
                              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                                Pay instantly via any UPI app or scan dynamic QR code in the Razorpay window.
                              </p>
                            </div>
                          </div>

                          {/* Supported Apps Chips */}
                          <div className="pt-2">
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                              Supported UPI Apps
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI', 'CRED', 'WhatsApp Pay'].map(app => (
                                <span
                                  key={app}
                                  className="text-xs font-semibold px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-800 dark:text-neutral-200 shadow-2xs"
                                >
                                  {app}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Trust banner */}
                          <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-card text-emerald-800 dark:text-emerald-400 text-xs font-semibold">
                            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                            <span>Zero convenience fee • Real-time dynamic QR • Instant order confirmation</span>
                          </div>
                        </div>
                      )}

                      {/* Card */}
                      {paymentMethod === 'card' && (
                        <div className="p-5 border border-primary-100 dark:border-primary-900/30 rounded-feature bg-primary-50/20 dark:bg-primary-950/10 space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded-card">
                              <CreditCard className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                                Credit & Debit Cards
                              </h4>
                              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                                Safe 256-bit encrypted checkout with 3D Secure OTP verification.
                              </p>
                            </div>
                          </div>

                          {/* Supported Cards Chips */}
                          <div className="pt-2">
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                              Supported Networks
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {['Visa', 'MasterCard', 'RuPay', 'Maestro', 'Diners Club'].map(card => (
                                <span
                                  key={card}
                                  className="text-xs font-semibold px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-800 dark:text-neutral-200 shadow-2xs"
                                >
                                  {card}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Security Notice */}
                          <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-card text-emerald-800 dark:text-emerald-400 text-xs font-semibold">
                            <Lock className="w-4 h-4 flex-shrink-0" />
                            <span>PCI-DSS Level 1 Certified • Card details are securely processed directly by Razorpay</span>
                          </div>
                        </div>
                      )}

                      {/* Net Banking */}
                      {paymentMethod === 'netbanking' && (
                        <div className="p-5 border border-primary-100 dark:border-primary-900/30 rounded-feature bg-primary-50/20 dark:bg-primary-950/10 space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded-card">
                              <Lock className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                                All Major Indian Banks
                              </h4>
                              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                                Connect directly with your bank account through Razorpay's verified gateway.
                              </p>
                            </div>
                          </div>

                          {/* Popular Banks Chips */}
                          <div className="pt-2">
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-2">
                              Popular Supported Banks
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', '+45 more'].map(bank => (
                                <span
                                  key={bank}
                                  className="text-xs font-semibold px-2.5 py-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-800 dark:text-neutral-200 shadow-2xs"
                                >
                                  {bank}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-card text-neutral-700 dark:text-neutral-300 text-xs font-medium">
                            <Info className="w-4 h-4 flex-shrink-0 text-primary-500" />
                            <span>Select your bank in the checkout modal to authenticate securely with your net banking portal.</span>
                          </div>
                        </div>
                      )}

                      {/* COD */}
                      {paymentMethod === 'cod' && (
                        <div className="p-5 bg-orange-500/5 border border-orange-500/15 rounded-feature space-y-3">
                          <div className="flex gap-2.5 text-xs font-bold text-orange-700 dark:text-orange-400">
                            <Info className="w-5 h-5 flex-shrink-0 text-orange-500" />
                            <div>
                              <p className="uppercase tracking-wider text-xs">Cash on Delivery (COD)</p>
                              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                                Pay with cash or UPI at your doorstep when the delivery partner arrives.
                              </p>
                            </div>
                          </div>
                          <div className="p-2.5 bg-white dark:bg-neutral-850 rounded-card border border-orange-500/10 text-[11px] text-neutral-600 dark:text-neutral-400">
                            <strong>Note:</strong> A nominal handling fee of <strong>₹30</strong> is applied for COD orders.
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Security trust assurance */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <div className="flex items-center gap-2 p-3 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-card">
                      <Lock className="w-6 h-6 text-primary-500 flex-shrink-0" />
                      <span className="text-[10px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                        SSL Encryption
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-card">
                      <ShieldCheck className="w-6 h-6 text-primary-500 flex-shrink-0" />
                      <span className="text-[10px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                        PCI Compliant
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-card">
                      <Truck className="w-6 h-6 text-primary-500 flex-shrink-0" />
                      <span className="text-[10px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                        Secure Transit
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-card">
                      <CheckCircle2 className="w-6 h-6 text-primary-500 flex-shrink-0" />
                      <span className="text-[10px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                        Assured Quality
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-4 justify-between pt-4">
                    <button
                      onClick={() => setActiveStep('address')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:underline uppercase tracking-widest"
                    >
                      ← Back to Address
                    </button>
                    <Button
                      variant="cta"
                      size="lg"
                      onClick={handlePlaceOrder}
                      disabled={isProcessingPayment}
                      className="font-bold text-sm bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white min-w-[200px] shadow-sm hover:shadow-md transition-all cursor-pointer"
                      leftIcon={isProcessingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    >
                      {isProcessingPayment
                        ? 'Connecting to Gateway...'
                        : paymentMethod === 'cod'
                        ? `Place COD Order • ₹${totalAmount}`
                        : `Proceed to Pay ₹${totalAmount}`}
                    </Button>
                  </div>

                </div>

                {/* Right Column (Sticky Summary) */}
                <div className="lg:col-span-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-base text-neutral-900 dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-3">
                    Order Summary
                  </h3>

                  <div className="space-y-2.5 text-xs font-semibold text-neutral-650 dark:text-neutral-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-neutral-900 dark:text-white" suppressHydrationWarning>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      {deliveryFee === 0 ? <span className="text-success font-bold">Free</span> : <span className="text-neutral-900 dark:text-white" suppressHydrationWarning>₹{deliveryFee}</span>}
                    </div>
                    {codFee > 0 && (
                      <div className="flex justify-between text-orange-500 font-bold">
                        <span>COD Handling Fee</span>
                        <span suppressHydrationWarning>₹{codFee}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-black text-neutral-905 dark:text-white border-t border-neutral-100 dark:border-neutral-800 pt-3">
                      <span>Grand Total</span>
                      <span className="text-primary-700 dark:text-primary-400" suppressHydrationWarning>₹{totalAmount}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SUCCESS / CONFIRMATION STEP */}
            {activeStep === 'confirm' && (
              <motion.div
                key="confirm-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-xl mx-auto bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 sm:p-10 shadow-2xl text-center space-y-6"
              >
                {/* SVG Success Checkmark */}
                <div className="flex justify-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-20 h-20 text-success"
                  >
                    <CheckCircle2 className="w-full h-full fill-success/10 stroke-[1.5]" />
                  </motion.div>
                </div>

                {/* Main success header */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">
                    Order Placed Successfully
                  </span>
                  <h2 className="text-2xl sm:text-3.5xl font-black font-heading text-neutral-900 dark:text-white tracking-tight">
                    Thank You For Your Purchase!
                  </h2>
                </div>

                {/* Order Information Container */}
                <div className="bg-neutral-50 dark:bg-neutral-850/50 border border-neutral-100 dark:border-neutral-800 rounded-feature p-5 space-y-3.5 max-w-sm mx-auto text-left">
                  <div className="flex justify-between items-center text-xs border-b border-neutral-200 dark:border-neutral-800/80 pb-2">
                    <span className="font-bold text-neutral-600 dark:text-neutral-450 uppercase tracking-wider">
                      Order ID
                    </span>
                    <span className="font-black text-neutral-905 dark:text-white text-sm select-all">
                      {orderNumber}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs border-b border-neutral-200 dark:border-neutral-800/80 pb-2">
                    <span className="font-bold text-neutral-600 dark:text-neutral-455 uppercase tracking-wider">
                      Delivery Estimate
                    </span>
                    <span className="font-bold text-primary-650 dark:text-primary-400">
                      {estimatedDays} Business Days
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-neutral-600 dark:text-neutral-455 uppercase tracking-wider">
                      Total Paid
                    </span>
                    <span className="font-black text-neutral-900 dark:text-white text-sm">
                      ₹{confirmedTotal}
                    </span>
                  </div>
                </div>

                {/* Subtext info */}
                <p className="text-xs text-neutral-650 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto">
                  A receipt and shipment confirmation email has been sent to your address. You can check order tracking in your account screen.
                </p>

                {/* CTA Action buttons */}
                <div className="flex flex-col gap-3 max-w-sm mx-auto pt-4 border-t border-neutral-105 dark:border-neutral-800">
                  <Button
                    variant="primary"
                    onClick={() => router.push('/shop')}
                    className="w-full font-bold text-sm"
                  >
                    Continue Shopping
                  </Button>

                  {/* Share on WhatsApp button */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#20BA5A] transition-colors py-2.5 px-4 rounded-card shadow-sm cursor-pointer select-none"
                  >
                    <MessageSquare className="w-4 h-4 fill-white" />
                    <span>Share Details on WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => toast.info(`Order ${orderNumber} is currently: PREPARING SHIPMENT`)}
                    className="text-xs font-bold text-neutral-600 hover:text-primary-500 hover:underline transition-colors uppercase tracking-widest pt-1"
                  >
                    Track Order status
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
