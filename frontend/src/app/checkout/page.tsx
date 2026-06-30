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

interface AddressData {
  name: string;
  mobile: string;
  addressLine1: string;
  addressLine2: string;
  pincode: string;
  city: string;
  state: string;
}

const mockSavedAddresses = [
  {
    id: 'addr-1',
    name: 'Ganesh Prabhu',
    mobile: '9876543210',
    addressLine1: 'Flat 402, Green Meadows',
    addressLine2: 'Kotturpuram',
    pincode: '600085',
    city: 'Chennai',
    state: 'Tamil Nadu',
  },
  {
    id: 'addr-2',
    name: 'Ganesh Prabhu (Office)',
    mobile: '9876543210',
    addressLine1: 'Tidel Park, Module 502',
    addressLine2: 'OMR Road, Taramani',
    pincode: '600113',
    city: 'Chennai',
    state: 'Tamil Nadu',
  }
];

export default function CheckoutPage() {
  const { t } = useTranslation();
  const router = useRouter();

  // Stores
  const { items, getTotal, clearCart, getItemCount } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  // Redirect if cart is empty (unless we are on order confirmation step)
  useEffect(() => {
    if (items.length === 0 && activeStep !== 'confirm') {
      router.replace('/shop');
    }
  }, [items]);

  // Checkout Step
  const [activeStep, setActiveStep] = useState<'address' | 'payment' | 'confirm'>('address');

  // Address Step States
  const [selectedAddressId, setSelectedAddressId] = useState<string>(mockSavedAddresses[0].id);
  const [useNewAddress, setUseNewAddress] = useState(false);
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
            state: data.estimatedDays === 3 ? 'Tamil Nadu' : 'State'
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
    if (useNewAddress) {
      const { name, mobile, addressLine1, pincode, city, state } = addressForm;
      if (!name || !mobile || !addressLine1 || !pincode || !city || !state) {
        toast.warning('Please fill in all required address fields.');
        return;
      }
      if (pincodeError) {
        toast.warning('Please use a serviceable pincode.');
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

  const handlePlaceOrder = () => {
    // Validate inputs based on paymentMethod
    if (paymentMethod === 'card') {
      const cleanCard = cardNumber.replace(/\D/g, '');
      if (cleanCard.length < 16) {
        toast.warning('Please enter a valid 16-digit credit card number.');
        return;
      }
      if (!cardExpiry || cardExpiry.length < 5) {
        toast.warning('Please enter Expiry Date (MM/YY).');
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        toast.warning('Please enter CVV.');
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId || !upiId.includes('@')) {
        toast.warning('Please enter a valid UPI ID (e.g. username@okaxis).');
        return;
      }
    }

    setIsProcessingPayment(true);

    // Simulate payment transaction
    setTimeout(() => {
      // Record order details before clearing cart
      const mockOrderNo = 'AETH-' + Math.floor(100000 + Math.random() * 900000);
      
      // Determine delivery estimate based on pincode
      let days = 5;
      if (useNewAddress) {
        if (addressForm.pincode.startsWith('6')) days = 3;
      } else {
        const activeAddr = mockSavedAddresses.find(a => a.id === selectedAddressId);
        if (activeAddr && activeAddr.pincode.startsWith('6')) days = 3;
      }

      setOrderNumber(mockOrderNo);
      setEstimatedDays(days);
      setConfirmedTotal(totalAmount);
      
      // Clear Cart Store
      clearCart();
      setIsProcessingPayment(false);
      setActiveStep('confirm');
      toast.success('Payment completed successfully!');
    }, 2000);
  };

  // Pre-formatted Whatsapp message
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Hello! I just placed an order at Aether Organic!\nOrder Number: *${orderNumber}*\nTotal Amount: *₹${confirmedTotal}*\nExpected Delivery: *${estimatedDays} days*\nDirect Farm Organic goodness! 🌱`
  )}`;

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
                        {mockSavedAddresses.map(addr => (
                          <div
                            key={addr.id}
                            onClick={() => { setSelectedAddressId(addr.id); setUseNewAddress(false); }}
                            className={`p-4 rounded-card border-2 cursor-pointer transition-all relative ${
                              selectedAddressId === addr.id && !useNewAddress
                                ? 'border-primary-500 bg-primary-500/5 shadow-sm'
                                : 'border-neutral-200 dark:border-neutral-800 bg-transparent hover:border-neutral-350'
                            }`}
                          >
                            <h4 className="font-bold text-sm text-neutral-905 dark:text-white">
                              {addr.name}
                            </h4>
                            <p className="text-xs text-neutral-600 dark:text-neutral-450 mt-1">
                              {addr.addressLine1}, {addr.addressLine2}
                            </p>
                            <p className="text-xs text-neutral-600 dark:text-neutral-450">
                              {addr.city}, {addr.state} - <span className="font-bold">{addr.pincode}</span>
                            </p>
                            <p className="text-[10px] font-bold text-neutral-500 mt-2">
                              Mobile: {addr.mobile}
                            </p>
                            {selectedAddressId === addr.id && !useNewAddress && (
                              <span className="absolute top-3 right-3 bg-primary-500 text-white rounded-full p-0.5">
                                <CheckCircle2 className="w-4 h-4 fill-primary-500 text-white" />
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

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
                          <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                            Mobile Number *
                          </label>
                          <input
                            type="tel"
                            required
                            value={addressForm.mobile}
                            onChange={(e) => setAddressForm({ ...addressForm, mobile: e.target.value.replace(/\D/g, '') })}
                            className="w-full text-xs font-semibold px-3 py-2 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
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
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      {deliveryFee === 0 ? <span className="text-success font-bold">Free</span> : <span>₹{deliveryFee}</span>}
                    </div>
                    <div className="flex justify-between text-base font-black text-neutral-900 dark:text-white border-t border-neutral-100 dark:border-neutral-800 pt-3">
                      <span>Total Amount</span>
                      <span>₹{totalAmount}</span>
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
                    <div className="min-h-[220px]">
                      
                      {/* UPI */}
                      {paymentMethod === 'upi' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                          {/* QR Generator */}
                          <div className="flex flex-col items-center justify-center p-4 border border-neutral-100 dark:border-neutral-800 rounded-feature bg-neutral-50 dark:bg-neutral-850/30">
                            <div className="w-36 h-36 border-2 border-primary-500/30 rounded-feature bg-white flex items-center justify-center p-2 shadow-inner">
                              {/* Simple Mock QR SVG */}
                              <svg viewBox="0 0 100 100" className="w-full h-full text-neutral-900">
                                <rect width="25" height="25" fill="currentColor"/>
                                <rect x="75" width="25" height="25" fill="currentColor"/>
                                <rect y="75" width="25" height="25" fill="currentColor"/>
                                <rect x="35" y="35" width="30" height="30" fill="currentColor"/>
                                <rect x="10" y="10" width="5" height="5" fill="white"/>
                                <rect x="85" y="10" width="5" height="5" fill="white"/>
                                <rect x="10" y="85" width="5" height="5" fill="white"/>
                                <rect x="42.5" y="42.5" width="15" height="15" fill="white"/>
                                <rect x="10" y="40" width="10" height="5" fill="currentColor"/>
                                <rect x="40" y="10" width="15" height="10" fill="currentColor"/>
                                <rect x="80" y="45" width="10" height="20" fill="currentColor"/>
                                <rect x="15" y="60" width="10" height="10" fill="currentColor"/>
                              </svg>
                            </div>
                            <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-500 uppercase tracking-wider mt-2.5 flex items-center gap-1.5">
                              <QrCode className="w-4 h-4 text-primary-500" />
                              Scan QR with GPay / PhonePe / BHIM
                            </span>
                          </div>

                          {/* UPI ID input */}
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                                Enter UPI ID *
                              </label>
                              <input
                                type="text"
                                required
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="e.g. mobileNumber@upi"
                                className="w-full text-xs font-semibold px-3.5 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                              />
                            </div>
                            <p className="text-[10px] font-semibold text-neutral-500">
                              A payment request will be sent to your UPI app. Approve it to complete order.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Card */}
                      {paymentMethod === 'card' && (
                        <div className="space-y-4 max-w-md">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                              Card Number *
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={cardNumber}
                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                placeholder="4000 1234 5678 9010"
                                maxLength={19}
                                className="w-full text-xs font-semibold pl-3.5 pr-12 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                              />
                              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary-500 uppercase tracking-wider">
                                {detectCardType(cardNumber)}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                              Cardholder Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value)}
                              placeholder="Name on card"
                              className="w-full text-xs font-semibold px-3.5 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                                Expiry Date *
                              </label>
                              <input
                                type="text"
                                required
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                placeholder="MM/YY"
                                maxLength={5}
                                className="w-full text-xs font-semibold px-3.5 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                                CVV *
                              </label>
                              <input
                                type="password"
                                required
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                placeholder="•••"
                                maxLength={3}
                                className="w-full text-xs font-semibold px-3.5 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Net Banking */}
                      {paymentMethod === 'netbanking' && (
                        <div className="space-y-4">
                          <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                            Select Your Bank
                          </label>
                          <select className="w-full max-w-sm text-xs font-semibold px-3 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer">
                            <option value="">Choose Bank</option>
                            <option value="sbi">State Bank of India</option>
                            <option value="hdfc">HDFC Bank</option>
                            <option value="icici">ICICI Bank</option>
                            <option value="axis">Axis Bank</option>
                            <option value="kotak">Kotak Mahindra Bank</option>
                          </select>
                          <p className="text-[10px] font-semibold text-neutral-500">
                            You will be redirected to your bank's secure page to authorize the payment.
                          </p>
                        </div>
                      )}

                      {/* COD */}
                      {paymentMethod === 'cod' && (
                        <div className="space-y-4 max-w-md bg-orange-500/5 border border-orange-500/10 p-4 rounded-feature">
                          <div className="flex gap-2 text-xs font-bold text-orange-650 dark:text-orange-450">
                            <Info className="w-5 h-5 flex-shrink-0 text-orange-500" />
                            <div>
                              <p className="uppercase tracking-wider">COD Handling Fee Applied</p>
                              <p className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400 mt-1 normal-case leading-relaxed">
                                Cash on Delivery orders incur an additional <strong>₹30</strong> handling charge to process local shipping routes securely.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Security trust assurance */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                    <div className="flex items-center gap-2 p-3 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-card">
                      <Lock className="w-6 h-6 text-primary-500 flex-shrink-0" />
                      <span className="text-[9px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                        SSL Encryption
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-card">
                      <ShieldCheck className="w-6 h-6 text-primary-500 flex-shrink-0" />
                      <span className="text-[9px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                        PCI Compliant
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-card">
                      <Truck className="w-6 h-6 text-primary-500 flex-shrink-0" />
                      <span className="text-[9px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                        Secure Transit
                      </span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-card">
                      <CheckCircle2 className="w-6 h-6 text-primary-500 flex-shrink-0" />
                      <span className="text-[9px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
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
                      className="font-bold text-sm bg-gradient-to-r from-primary-500 to-primary-700 text-white min-w-[160px]"
                      leftIcon={isProcessingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                    >
                      {isProcessingPayment ? 'Processing...' : 'Place Secure Order'}
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
                      <span className="text-neutral-900 dark:text-white">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      {deliveryFee === 0 ? <span className="text-success font-bold">Free</span> : <span className="text-neutral-900 dark:text-white">₹{deliveryFee}</span>}
                    </div>
                    {codFee > 0 && (
                      <div className="flex justify-between text-orange-500 font-bold">
                        <span>COD Handling Fee</span>
                        <span>₹{codFee}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-black text-neutral-905 dark:text-white border-t border-neutral-100 dark:border-neutral-800 pt-3">
                      <span>Grand Total</span>
                      <span className="text-primary-700 dark:text-primary-400">₹{totalAmount}</span>
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
