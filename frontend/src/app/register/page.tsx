"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Flame, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { Confetti } from '@/components/ui/Confetti';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/services/api-client';
import { toast } from '@/components/ui/Toast';
import i18n from '@/lib/i18n'; // Force i18n init

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { login, isLoggedIn } = useAuthStore();

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/account');
    }
  }, [isLoggedIn, router]);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form Validations
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please provide your first and last name.');
      triggerShake();
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      triggerShake();
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      triggerShake();
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      triggerShake();
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the Terms & Conditions.');
      triggerShake();
      return;
    }

    setIsLoading(true);

    try {
      // 1. Register with backend
      const regRes = await apiClient.post('/auth/register', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        phone: phone.trim() ? phone.replace(/\D/g, '') : undefined,
      });

      if (!regRes.success) {
        setIsLoading(false);
        setError(regRes.message || 'Registration failed.');
        triggerShake();
        return;
      }

      // 2. Automatically log in newly registered user
      const loginRes = await apiClient.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password: password,
      });

      setIsLoading(false);

      if (loginRes.success && loginRes.data?.accessToken) {
        setIsSuccess(true);
        setShowConfetti(true);

        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', loginRes.data.accessToken);
        }

        login(loginRes.data.user, loginRes.data.accessToken);
        toast.success(`Welcome to Yathu Arokiyagam, ${firstName}! 🎉`);

        setTimeout(() => {
          router.replace('/account');
        }, 1500);
      } else {
        // Registered successfully, forward to login
        toast.success('Account created! Please sign in with your credentials.');
        router.replace('/login');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Failed to create account. User may already exist.');
      triggerShake();
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50 dark:bg-neutral-950 font-sans relative overflow-hidden">
      {/* Confetti Trigger */}
      <Confetti active={showConfetti} />

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

      {/* Main Registration Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature shadow-2xl p-6 sm:p-8 z-10 overflow-hidden relative"
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

        {/* Heading */}
        <div className="text-center sm:text-left mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            Create Customer Account
          </h1>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1.5">
            Join Yathu Arokiyagam to enjoy farm-fresh organic products and priority delivery.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block">
                First Name *
              </label>
              <div className="relative flex rounded-card border border-neutral-200 dark:border-neutral-750 overflow-hidden focus-within:border-primary-500 transition-colors">
                <div className="px-3 bg-neutral-50 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-750 flex items-center justify-center text-neutral-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setError(null);
                  }}
                  placeholder="John"
                  className="flex-1 text-sm font-semibold px-3 py-2 bg-transparent text-neutral-900 dark:text-white outline-none focus:ring-0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block">
                Last Name *
              </label>
              <div className="relative flex rounded-card border border-neutral-200 dark:border-neutral-750 overflow-hidden focus-within:border-primary-500 transition-colors">
                <div className="px-3 bg-neutral-50 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-750 flex items-center justify-center text-neutral-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setError(null);
                  }}
                  placeholder="Doe"
                  className="flex-1 text-sm font-semibold px-3 py-2 bg-transparent text-neutral-900 dark:text-white outline-none focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block">
              Email Address *
            </label>
            <div className="relative flex rounded-card border border-neutral-200 dark:border-neutral-750 overflow-hidden focus-within:border-primary-500 transition-colors">
              <div className="px-3 bg-neutral-50 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-750 flex items-center justify-center text-neutral-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="name@example.com"
                className="flex-1 text-sm font-semibold px-3 py-2 bg-transparent text-neutral-900 dark:text-white outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* Mobile Number (Optional) */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block">
              Mobile Number (Optional)
            </label>
            <div className="relative flex rounded-card border border-neutral-200 dark:border-neutral-750 overflow-hidden focus-within:border-primary-500 transition-colors">
              <div className="px-3 bg-neutral-50 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-750 flex items-center justify-center text-neutral-500">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                className="flex-1 text-sm font-semibold px-3 py-2 bg-transparent text-neutral-900 dark:text-white outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* Password and Confirm Password Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block">
                Password * (min 8 chars)
              </label>
              <div className="relative flex rounded-card border border-neutral-200 dark:border-neutral-750 overflow-hidden focus-within:border-primary-500 transition-colors">
                <div className="px-3 bg-neutral-50 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-750 flex items-center justify-center text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="At least 8 chars"
                  className="flex-1 text-sm font-semibold px-3 py-2 bg-transparent text-neutral-900 dark:text-white outline-none focus:ring-0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest block">
                  Confirm Password *
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-neutral-500 hover:text-primary-500 flex items-center gap-1 font-semibold"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative flex rounded-card border border-neutral-200 dark:border-neutral-750 overflow-hidden focus-within:border-primary-500 transition-colors">
                <div className="px-3 bg-neutral-50 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-750 flex items-center justify-center text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="Repeat password"
                  className="flex-1 text-sm font-semibold px-3 py-2 bg-transparent text-neutral-900 dark:text-white outline-none focus:ring-0"
                />
              </div>
            </div>
          </div>

          {/* Terms checkbox */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-400 cursor-pointer select-none">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  setError(null);
                }}
                className="mt-0.5 w-4 h-4 rounded text-primary-500 focus:ring-0"
              />
              <span>
                I agree to the{' '}
                <Link href="/terms" className="text-primary-500 hover:underline font-bold">
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-primary-500 hover:underline font-bold">
                  Privacy Policy
                </Link>
              </span>
            </label>
          </div>

          {/* Error Banner */}
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
            className="w-full font-bold text-sm bg-gradient-to-r from-primary-500 to-primary-750 hover:from-primary-600 hover:to-primary-800 text-white py-3 rounded-card transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary-500/10 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Existing account prompt */}
        <div className="pt-5 mt-5 border-t border-neutral-100 dark:border-neutral-850 text-center select-none">
          <p className="text-xs font-semibold text-neutral-500">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-500 hover:text-primary-400 font-bold">
              Sign In
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
          ← Back to Store
        </Link>
      </div>
    </main>
  );
}
