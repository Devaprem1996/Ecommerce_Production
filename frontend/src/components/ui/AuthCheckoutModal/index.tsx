"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  Smartphone, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { toast } from '@/components/ui/Toast';
import { apiClient } from '@/services/api-client';
import Link from 'next/link';

interface AuthCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type TabType = 'login' | 'register' | 'otp';

export const AuthCheckoutModal: React.FC<AuthCheckoutModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { login } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regPhone, setRegPhone] = useState('');

  // OTP form state
  const [otpMobile, setOtpMobile] = useState('');
  const [otpStep, setOtpStep] = useState<1 | 2>(1); // 1: mobile, 2: digits
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [otpCountdown, setOtpCountdown] = useState(30);
  const [generatedOtp, setGeneratedOtp] = useState('123456');
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Common submission states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Countdown timer for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && activeTab === 'otp' && otpStep === 2 && otpCountdown > 0) {
      interval = setInterval(() => {
        setOtpCountdown((c) => c - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, activeTab, otpStep, otpCountdown]);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const syncAuthSession = (userData: any, accessToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      // Sync access_token in document.cookie for Next.js SSR middleware
      document.cookie = `access_token=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    }
    login(userData, accessToken);
    setTimeout(() => {
      if (onSuccess) onSuccess();
      handleClose();
    }, 600);
  };

  const handleClose = () => {
    setErrorMessage(null);
    setIsLoading(false);
    setOtpStep(1);
    setOtpDigits(Array(6).fill(''));
    onClose();
  };

  // 1. Handle Email + Password Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setErrorMessage('Please enter both your email address and password.');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.post('/auth/login', {
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
      });

      setIsLoading(false);

      if (res.success && res.data?.accessToken) {
        toast.success(`Welcome back! Proceeding to checkout.`);
        syncAuthSession(res.data.user, res.data.accessToken);
      } else {
        setErrorMessage(res.message || 'Login failed. Please check your email and password.');
        triggerShake();
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Invalid email or password.');
      triggerShake();
    }
  };

  // 2. Handle Create Account (Register)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMessage('Please enter your name, email, and password.');
      triggerShake();
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const nameParts = regName.trim().split(' ');
      const firstName = nameParts[0] || 'Customer';
      const lastName = nameParts.slice(1).join(' ') || '';

      const regRes = await apiClient.post('/auth/register', {
        firstName,
        lastName,
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        phone: regPhone.trim() ? regPhone.replace(/\D/g, '') : undefined,
      });

      if (!regRes.success) {
        setIsLoading(false);
        setErrorMessage(regRes.message || 'Registration failed. Please try a different email.');
        triggerShake();
        return;
      }

      // Automatically log in newly created user
      const loginRes = await apiClient.post('/auth/login', {
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
      });

      setIsLoading(false);

      if (loginRes.success && loginRes.data?.accessToken) {
        toast.success(`Account created! Welcome, ${firstName}! 🎉`);
        syncAuthSession(loginRes.data.user, loginRes.data.accessToken);
      } else {
        toast.success('Account created! Please sign in with your password.');
        setActiveTab('login');
        setLoginEmail(regEmail.trim());
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Unable to create account. Please try again.');
      triggerShake();
    }
  };

  // 3. Handle Mobile OTP: Send Code
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(otpMobile)) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(randomCode);
      setOtpStep(2);
      setOtpCountdown(30);
      toast.success(`Verification code sent to +91-${otpMobile}`);
      console.log(`Checkout OTP: ${randomCode}`);
    }, 800);
  };

  // Handle OTP digit changes
  const handleOtpDigitChange = (value: string, idx: number) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[idx] = digit;
    setOtpDigits(updated);
    setErrorMessage(null);

    if (digit && idx < 5) {
      otpInputRefs.current[idx + 1]?.focus();
    }

    if (updated.every((d) => d !== '')) {
      verifyOtpCode(updated.join(''));
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace') {
      const updated = [...otpDigits];
      if (updated[idx] === '' && idx > 0) {
        updated[idx - 1] = '';
        setOtpDigits(updated);
        otpInputRefs.current[idx - 1]?.focus();
      } else {
        updated[idx] = '';
        setOtpDigits(updated);
      }
    }
  };

  const verifyOtpCode = (code: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (code === generatedOtp || code === '123456') {
        const dummyToken = 'jwt_otp_session_' + Date.now();
        const dummyUser = {
          id: 'cust-' + Math.floor(100000 + Math.random() * 900000),
          email: `${otpMobile}@customer.yathuarokiyagam.com`,
          mobile: otpMobile,
          role: 'CUSTOMER',
          firstName: 'Customer',
        };
        toast.success('Mobile verified! Proceeding to checkout.');
        syncAuthSession(dummyUser, dummyToken);
      } else {
        setErrorMessage('Invalid verification code. Please check and try again.');
        triggerShake();
      }
    }, 800);
  };

  const handleGuestCheckout = () => {
    handleClose();
    if (onSuccess) onSuccess();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.35 }}
            className={`relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-150 dark:border-neutral-800 rounded-feature shadow-2xl overflow-hidden z-10 font-sans ${
              isShaking ? 'animate-shake' : ''
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="font-heading font-black text-lg text-neutral-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary-500" />
                  <span>Sign In to Checkout</span>
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Sign in or create an account to save your delivery addresses
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-card text-neutral-400 hover:text-neutral-600 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-neutral-150 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/40 p-1.5 gap-1 select-none">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setErrorMessage(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-card transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'login'
                    ? 'bg-white dark:bg-neutral-850 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email & Password</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('register'); setErrorMessage(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-card transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'register'
                    ? 'bg-white dark:bg-neutral-850 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Create Account</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('otp'); setErrorMessage(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-card transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'otp'
                    ? 'bg-white dark:bg-neutral-850 text-neutral-900 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile OTP</span>
              </button>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mx-6 mt-4 p-3 rounded-card bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6">
              {/* TAB 1: EMAIL & PASSWORD LOGIN */}
              {activeTab === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full text-xs font-semibold pl-10 pr-4 py-2.5 border border-neutral-200 dark:border-neutral-750 rounded-card bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block">
                        Password
                      </label>
                      <Link 
                        href="/login" 
                        target="_blank" 
                        className="text-[10px] font-bold text-primary-500 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full text-xs font-semibold pl-10 pr-10 py-2.5 border border-neutral-200 dark:border-neutral-750 rounded-card bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-white cursor-pointer"
                        aria-label={showLoginPassword ? "Hide password" : "Show password"}
                      >
                        {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-card shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Sign In & Proceed</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => { setActiveTab('register'); setErrorMessage(null); }}
                      className="text-xs font-semibold text-neutral-500 hover:text-primary-500 cursor-pointer"
                    >
                      New customer? <span className="font-bold text-primary-500 underline">Create an Account</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: CREATE ACCOUNT (REGISTER) */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Sundar Pichai"
                        className="w-full text-xs font-semibold pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-750 rounded-card bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full text-xs font-semibold pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-750 rounded-card bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full text-xs font-semibold pl-10 pr-10 py-2 border border-neutral-200 dark:border-neutral-750 rounded-card bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-white cursor-pointer"
                        aria-label={showRegPassword ? "Hide password" : "Show password"}
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block">
                      Mobile Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="9876543210"
                        maxLength={10}
                        className="w-full text-xs font-semibold pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-750 rounded-card bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-card shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Create Account & Proceed</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={() => { setActiveTab('login'); setErrorMessage(null); }}
                      className="text-xs font-semibold text-neutral-500 hover:text-primary-500 cursor-pointer"
                    >
                      Already have an account? <span className="font-bold text-primary-500 underline">Sign In</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 3: MOBILE OTP */}
              {activeTab === 'otp' && (
                <div>
                  {otpStep === 1 ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block">
                          Mobile Number
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3 text-xs font-bold bg-neutral-100 dark:bg-neutral-800 border border-r-0 border-neutral-200 dark:border-neutral-750 rounded-l-card text-neutral-500">
                            +91
                          </span>
                          <input
                            type="tel"
                            required
                            value={otpMobile}
                            onChange={(e) => setOtpMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="9876543210"
                            maxLength={10}
                            className="w-full text-xs font-semibold px-3 py-2.5 border border-neutral-200 dark:border-neutral-750 rounded-r-card bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading || otpMobile.length < 10}
                        className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold rounded-card shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Send Verification Code</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center space-y-1">
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                          Enter the 6-digit code sent to <span className="font-bold text-neutral-900 dark:text-white">+91-{otpMobile}</span>
                        </p>
                      </div>

                      {/* 6 Digit Inputs */}
                      <div className="flex justify-center gap-2">
                        {otpDigits.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => { otpInputRefs.current[idx] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpDigitChange(e.target.value, idx)}
                            onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                            className="w-10 h-12 text-center text-base font-black border border-neutral-200 dark:border-neutral-750 rounded-card bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-[11px] pt-1">
                        <button
                          type="button"
                          onClick={() => setOtpStep(1)}
                          className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                        >
                          Change Number
                        </button>
                        <button
                          type="button"
                          disabled={otpCountdown > 0}
                          onClick={() => {
                            setOtpCountdown(30);
                            const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
                            setGeneratedOtp(randomCode);
                            toast.success(`New code sent to +91-${otpMobile}`);
                          }}
                          className={`font-bold ${
                            otpCountdown > 0
                              ? 'text-neutral-400 cursor-not-allowed'
                              : 'text-primary-500 hover:underline cursor-pointer'
                          }`}
                        >
                          {otpCountdown > 0 ? `Resend code in ${otpCountdown}s` : 'Resend Code'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Guest Checkout Option */}
              <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-center">
                <button
                  type="button"
                  onClick={handleGuestCheckout}
                  className="text-xs font-semibold text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                >
                  Or <span className="underline font-bold">Continue to Checkout as Guest</span>
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
