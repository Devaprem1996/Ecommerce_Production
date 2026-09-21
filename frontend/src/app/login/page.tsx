"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Flame, 
  Mail, 
  Lock, 
  Smartphone, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { OtpInput } from '@/components/auth/OtpInput';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/services/api-client';
import { toast } from '@/components/ui/Toast';
import i18n from '@/lib/i18n'; // Force i18n init

function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoggedIn, role } = useAuthStore();

  // Mode: 'email' (Email + Password) or 'otp' (Mobile OTP)
  const [authMode, setAuthMode] = useState<'email' | 'otp'>('email');

  // Email + Password states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP states
  const [step, setStep] = useState<1 | 2>(1);
  const [mobile, setMobile] = useState('');
  const [timer, setTimer] = useState(30);
  const [resendAttempts, setResendAttempts] = useState(0);

  // Common UI states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const rawRedirect = (searchParams ?? new URLSearchParams()).get('redirect');
  // Default login redirect is Homepage ('/'). If redirect explicitly specifies a flow like '/checkout', honor that.
  const redirectUrl = (!rawRedirect || rawRedirect === '/account' || rawRedirect === '/') 
    ? '/' 
    : rawRedirect;

  // Redirect if already logged in with a valid token
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('access_token') || (window as any).__accessToken;
    if (!token) {
      // Stale auth state in localStorage without a real token: clean it up
      if (isLoggedIn) {
        useAuthStore.getState().logout();
      }
      return;
    }

    // Only redirect if genuinely logged in as a customer
    if (isLoggedIn && role === 'customer') {
      router.replace(redirectUrl);
    }
  }, [isLoggedIn, role, redirectUrl, router]);

  // Countdown timer effect for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (authMode === 'otp' && step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authMode, step, timer]);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  // 1. Handle Email + Password Login
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.post('/auth/login', {
        email: email.trim(),
        password: password,
      });

      setIsLoading(false);

      if (res.success && res.data?.accessToken) {
        setIsSuccess(true);

        // Store access token in localStorage and cookies for client requests and Next.js middleware
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', res.data.accessToken);
          document.cookie = `access_token=${res.data.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }

        // Save session in Zustand store
        login(res.data.user, res.data.accessToken);
        const displayName = res.data.user.name || res.data.user.firstName || res.data.user.email?.split('@')[0] || 'Customer';
        toast.success(`Welcome back, ${displayName}!`);

        setTimeout(() => {
          if (res.data.user.role?.toLowerCase() === 'admin') {
            router.replace('/admin');
          } else {
            router.replace(redirectUrl);
          }
        }, 800);
      } else {
        setError(res.message || 'Login failed. Please verify credentials.');
        triggerShake();
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Invalid email or password.');
      triggerShake();
    }
  };

  // 2. Handle OTP Send
  const isMobileValid = /^\d{10}$/.test(mobile);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMobileValid) {
      setError(t('auth.validation.invalid_phone') || 'Please enter a valid 10-digit number');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.post('/auth/otp/send', {
        phone: mobile,
        purpose: 'LOGIN',
      });

      setIsLoading(false);

      if (res.success) {
        setStep(2);
        setTimer((res as any).resendAfterSeconds || 30);
        if ((res as any).devOtp) {
          toast.info(`Test OTP: ${(res as any).devOtp}`);
        } else {
          toast.success(t('otp.otp_sent', { mobile: mobile.replace(/(\d{5})(\d{5})/, '$1-$2') }) || `OTP sent to +91 ${mobile}`);
        }
      } else {
        setError(res.message || 'Failed to send OTP.');
        triggerShake();
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Failed to send OTP. Please try again.');
      triggerShake();
    }
  };

  // 3. Handle OTP Verification
  const handleVerifyOtp = async (otpCode: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.post('/auth/otp/verify', {
        phone: mobile,
        otp: otpCode,
        purpose: 'LOGIN',
      });

      setIsLoading(false);

      if (res.success && res.data?.accessToken) {
        setIsSuccess(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', res.data.accessToken);
          document.cookie = `access_token=${res.data.accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        }
        login(res.data.user, res.data.accessToken);
        const displayName = res.data.user?.name || res.data.user?.firstName || res.data.user?.email?.split('@')[0] || `Customer ${mobile.slice(-4)}`;
        toast.success(`Welcome back, ${displayName}!`);

        setTimeout(() => {
          router.replace(redirectUrl);
        }, 800);
      } else {
        setError(res.message || 'Invalid OTP code entered.');
        triggerShake();
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Failed to verify OTP.');
      triggerShake();
    }
  };

  const handleResendOtp = async () => {
    if (resendAttempts >= 3) {
      setError(t('otp.max_attempts') || 'Maximum resend attempts reached.');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.post('/auth/otp/send', {
        phone: mobile,
        purpose: 'LOGIN',
      });

      setIsLoading(false);

      if (res.success) {
        setTimer(30);
        setResendAttempts((prev) => prev + 1);
        if ((res as any).devOtp) {
          toast.info(`Test OTP: ${(res as any).devOtp}`);
        } else {
          toast.success(`OTP re-sent to +91 ${mobile}`);
        }
      } else {
        setError(res.message || 'Failed to resend OTP.');
        triggerShake();
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Failed to resend OTP.');
      triggerShake();
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50 dark:bg-neutral-950 font-sans relative overflow-hidden">

      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Logo Header */}
      <div className="mb-6 flex flex-col items-center select-none z-10">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-primary-500/10">
            <Flame className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="text-xl font-black tracking-wider bg-gradient-to-r from-primary-600 to-emerald-600 bg-clip-text text-transparent">
            YATHU AROKIYAGAM
          </span>
        </Link>
      </div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature shadow-2xl p-6 sm:p-8 z-10 overflow-hidden relative"
      >
        {/* Success Flash Overlay */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-success/10 backdrop-blur-[2px] z-55 flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.4 }}
                className="w-16 h-16 text-success flex items-center justify-center"
              >
                <CheckCircle2 className="w-full h-full fill-success/10 text-success" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Heading */}
        <div className="text-center sm:text-left mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {t('auth.welcome_back') || 'Welcome Back'}
          </h1>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1.5">
            {t('auth.login_subtitle') || 'Sign in to access your orders, profile, and wishlist'}
          </p>
        </div>

        {/* Authentication Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 mb-6 bg-neutral-100 dark:bg-neutral-800/80 rounded-card select-none text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setAuthMode('email');
              setError(null);
            }}
            className={`py-2 px-3 rounded-md flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'email'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email & Password</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('otp');
              setError(null);
            }}
            className={`py-2 px-3 rounded-md flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'otp'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile OTP</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {authMode === 'email' ? (
            /* EMAIL & PASSWORD LOGIN FORM */
            <motion.form
              key="email-form"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleEmailPasswordLogin}
              className="space-y-4"
            >
              {/* Email field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block"
                >
                  Email Address
                </label>
                <div className="relative flex rounded-card border border-neutral-200 dark:border-neutral-750 overflow-hidden focus-within:border-primary-500 transition-colors">
                  <div className="px-3 bg-neutral-50 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-750 flex items-center justify-center text-neutral-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    id="login-email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    placeholder="e.g. customer@gmail.com"
                    className="flex-1 text-sm font-semibold px-4 py-2.5 bg-transparent text-neutral-900 dark:text-white outline-none focus:ring-0"
                    autoFocus
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="login-password"
                    className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block"
                  >
                    Password
                  </label>
                </div>
                <div className="relative flex rounded-card border border-neutral-200 dark:border-neutral-750 overflow-hidden focus-within:border-primary-500 transition-colors">
                  <div className="px-3 bg-neutral-50 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-750 flex items-center justify-center text-neutral-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Enter your account password"
                    className="flex-1 text-sm font-semibold px-4 py-2.5 bg-transparent text-neutral-900 dark:text-white outline-none focus:ring-0"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="px-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 focus:outline-none"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-1.5 text-xs font-bold text-red-500 pt-1"
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full font-bold text-sm bg-gradient-to-r from-primary-500 to-primary-750 hover:from-primary-600 hover:to-primary-800 text-white py-3 rounded-card transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.form>
          ) : step === 1 ? (
            /* MOBILE OTP: STEP 1 (PHONE) */
            <motion.form
              key="otp-step1"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSendOtp}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label htmlFor="mobile" className="text-[10px] font-bold text-neutral-600 dark:text-neutral-450 uppercase tracking-widest block">
                  {t('otp.mobile_label') || 'Mobile Number'}
                </label>
                <div className="relative flex rounded-card border border-neutral-200 dark:border-neutral-750 overflow-hidden focus-within:border-primary-500 transition-colors">
                  <div className="px-3 bg-neutral-50 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-750 flex items-center justify-center text-sm font-bold text-neutral-800 dark:text-neutral-355 select-none">
                    +91
                  </div>
                  <input
                    type="tel"
                    id="mobile"
                    required
                    value={mobile}
                    onChange={(e) => {
                      setMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
                      setError(null);
                    }}
                    placeholder={t('otp.mobile_placeholder') || 'Enter 10-digit mobile number'}
                    className="flex-1 text-sm font-semibold px-4 py-2.5 bg-transparent text-neutral-900 dark:text-white outline-none focus:ring-0"
                    autoFocus
                  />
                  <div className="absolute right-3 top-3 flex items-center">
                    {mobile.length > 0 && (
                      isMobileValid ? (
                        <span className="text-success text-sm" role="img" aria-label="Valid check">✅</span>
                      ) : (
                        <span className="text-error text-sm" role="img" aria-label="Invalid check">❌</span>
                      )
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className="flex items-center gap-1.5 text-xs font-bold text-red-500"
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={!isMobileValid || isLoading}
                className="w-full font-bold text-sm bg-gradient-to-r from-primary-500 to-primary-750 hover:from-primary-600 hover:to-primary-800 text-white py-3 rounded-card transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{t('otp.send_otp') || 'Send Verification Code'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            /* MOBILE OTP: STEP 2 (VERIFY CODE) */
            <motion.div
              key="otp-step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {t('auth.otp_sent_title') || 'Enter Verification Code'}
                </h2>
                <p className="text-sm font-semibold text-neutral-500 dark:text-neutral-450 mt-1.5 leading-relaxed">
                  {t('auth.otp_sent_subtitle', { mobile: mobile.replace(/(\d{5})(\d{5})/, '$1-$2') }) || `Sent to +91-${mobile}`}{' '}
                  <button
                    onClick={() => {
                      setStep(1);
                      setError(null);
                    }}
                    className="text-primary-500 hover:underline font-bold ml-1 cursor-pointer"
                  >
                    [{t('auth.change') || 'Change'}]
                  </button>
                </p>
              </div>

              <div className="space-y-4">
                <OtpInput
                  length={6}
                  disabled={isLoading}
                  hasError={!!error}
                  onComplete={handleVerifyOtp}
                />

                {error && (
                  <motion.div
                    animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-500 justify-center"
                  >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <div className="flex items-center justify-between text-xs pt-4 border-t border-neutral-100 dark:border-neutral-850 select-none">
                  <button
                    onClick={() => {
                      setStep(1);
                      setError(null);
                    }}
                    className="text-neutral-500 dark:text-neutral-450 hover:underline font-semibold cursor-pointer"
                  >
                    {t('otp.change_number') || 'Change Number'}
                  </button>

                  {timer > 0 ? (
                    <span className="text-neutral-600 dark:text-neutral-400 font-medium">
                      {t('otp.resend_timer', { seconds: timer }) || `Resend in ${timer}s`}
                    </span>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      disabled={resendAttempts >= 3}
                      className="text-primary-500 hover:text-primary-400 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('otp.resend_now') || 'Resend Code'}</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Social / Google Login Section */}
        <div className="relative my-6 text-center select-none">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-neutral-100 dark:border-neutral-850" />
          </div>
          <div className="relative flex justify-center text-xs uppercase font-bold text-neutral-450 dark:text-neutral-500">
            <span className="bg-white dark:bg-neutral-900 px-3">
              {t('auth.or_divider') || 'Or continue with'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => toast.info('Google Sign-In will open in secure popup')}
          className="w-full font-bold text-sm border border-neutral-200 dark:border-neutral-750 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-750 dark:text-neutral-300 py-2.5 rounded-card transition-colors flex items-center justify-center gap-3 cursor-pointer"
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span>{t('auth.google_login') || 'Sign in with Google'}</span>
        </button>

        {/* Link to Register */}
        <div className="pt-5 mt-5 border-t border-neutral-100 dark:border-neutral-850 text-center select-none">
          <p className="text-xs font-semibold text-neutral-500">
            {t('auth.new_here') || "Don't have an account?"}{' '}
            <Link href="/register" className="text-primary-500 hover:text-primary-400 font-bold">
              {t('auth.create_account') || 'Create an Account'}
            </Link>
          </p>
        </div>
      </motion.div>

      {/* Back to Home Link */}
      <div className="mt-6 z-10 select-none">
        <Link
          href="/"
          className="text-xs font-bold text-neutral-550 dark:text-neutral-450 hover:text-primary-500 flex items-center gap-1 transition-colors"
        >
          {t('auth.back_to_home') || '← Back to Store'}
        </Link>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex flex-col justify-center items-center py-12 px-4 bg-neutral-50 dark:bg-neutral-950 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
