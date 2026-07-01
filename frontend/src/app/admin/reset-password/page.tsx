"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, Check, X, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import Link from 'next/link';

const resetPasswordSchema = z.object({
  password: z.string().min(1, { message: 'Password is required' }),
  confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [token, setToken] = useState<string | null>(null);
  const [validating, setValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');

  // Get token and validate it on mount
  useEffect(() => {
    // CSRF initialization
    const csrf = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    setCsrfToken(csrf);

    const queryToken = searchParams.get('token');
    setToken(queryToken);

    // Validate token format (64-character hex string)
    const isTokenFormatValid = queryToken && /^[a-fA-F0-9]{64}$/.test(queryToken);

    // Simulate server verification delay for UX
    const timer = setTimeout(() => {
      if (isTokenFormatValid) {
        setIsValidToken(true);
      } else {
        setIsValidToken(false);
      }
      setValidating(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [searchParams]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    }
  });

  const passwordValue = watch('password', '');

  // live checklist criteria checks
  const criteria = {
    length: passwordValue.length >= 8,
    uppercase: /[A-Z]/.test(passwordValue),
    number: /[0-9]/.test(passwordValue),
    special: /[!@#$%^&*(),.?":{}|<>_]/.test(passwordValue),
  };

  const countMet = Object.values(criteria).filter(Boolean).length;

  // Strength Bar Calculation
  let strengthLabel = 'Weak';
  let strengthColor = 'bg-red-500';
  let strengthPercent = 0;

  if (passwordValue.length > 0) {
    if (countMet <= 2) {
      strengthLabel = 'Weak';
      strengthColor = 'bg-red-500';
      strengthPercent = 25;
    } else if (countMet === 3) {
      strengthLabel = 'Fair';
      strengthColor = 'bg-orange-500';
      strengthPercent = 50;
    } else if (countMet === 4) {
      if (passwordValue.length >= 12) {
        strengthLabel = 'Strong';
        strengthColor = 'bg-success';
        strengthPercent = 100;
      } else {
        strengthLabel = 'Good';
        strengthColor = 'bg-yellow-500';
        strengthPercent = 75;
      }
    }
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    // Ensure all criteria are met before submitting
    if (countMet < 4) {
      toast.error('Please fulfill all password requirements.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/admin/reset-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ 
          token, 
          password: data.password,
          csrfToken 
        })
      });

      const resData = await response.json();
      setLoading(false);

      if (response.ok && resData.success) {
        toast.success('Password reset successfully!');
        router.replace('/admin/login');
      } else {
        toast.error(resData.message || 'Failed to reset password.');
      }
    } catch (err) {
      setLoading(false);
      toast.error('Something went wrong. Please try again.');
    }
  };

  if (validating) {
    return (
      <div className="text-center py-10 space-y-4">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin mx-auto" />
        <p className="text-xs font-bold text-neutral-450 uppercase tracking-widest">
          Verifying security token...
        </p>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-feature p-8 shadow-2xl space-y-6 text-center"
      >
        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500 border border-red-500/25">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black font-heading text-white tracking-tight">
            Invalid or Expired Link
          </h2>
          <p className="text-xs text-neutral-450 leading-relaxed max-w-xs mx-auto">
            The security token in your reset link is either invalid, malformed, or has expired after 1 hour.
          </p>
        </div>

        <div className="pt-4 border-t border-neutral-800 space-y-3">
          <Link href="/admin/forgot-password" className="block">
            <Button
              variant="primary"
              className="w-full font-bold text-xs py-3 text-white bg-primary-500 hover:bg-primary-600 rounded-card border-none"
            >
              Request New Link
            </Button>
          </Link>
          <Link href="/admin/login" className="block text-xs font-bold text-neutral-500 hover:text-neutral-450 select-none">
            ← Back to Login
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-feature p-8 shadow-2xl relative z-10"
    >
      <div className="space-y-1.5 mb-6 text-center sm:text-left">
        <h2 className="text-2xl font-black font-heading text-white tracking-tight">
          Create New Password
        </h2>
        <p className="text-xs text-neutral-400 font-medium">
          Set a secure password for your administrator account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* CSRF Token */}
        <input type="hidden" name="csrf_token" value={csrfToken} />

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              disabled={loading}
              {...register('password')}
              className="w-full text-xs font-semibold pl-4 pr-10 py-3 border border-neutral-800 rounded-card bg-neutral-950 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
              placeholder="Enter new password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-white cursor-pointer transition-colors focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-1 pl-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.password.message}
            </span>
          )}
        </div>

        {/* Password Strength Indicator Bar */}
        {passwordValue.length > 0 && (
          <div className="space-y-1.5 py-1">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
              <span className="text-neutral-500">Strength:</span>
              <span className={
                strengthLabel === 'Weak' ? 'text-red-500' :
                strengthLabel === 'Fair' ? 'text-orange-500' :
                strengthLabel === 'Good' ? 'text-yellow-500' : 'text-success'
              }>
                {strengthLabel}
              </span>
            </div>
            <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${strengthPercent}%` }}
                className={`h-full ${strengthColor}`}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              disabled={loading}
              {...register('confirmPassword')}
              className="w-full text-xs font-semibold pl-4 pr-10 py-3 border border-neutral-800 rounded-card bg-neutral-950 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-500 hover:text-white cursor-pointer transition-colors focus:outline-none"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-1 pl-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        {/* Password Requirements Checklist */}
        <div className="p-4 bg-neutral-950 rounded-card border border-neutral-850 space-y-2.5">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block border-b border-neutral-850 pb-1.5">
            Password must have:
          </span>
          <div className="space-y-1.5 text-xs font-semibold select-none">
            {/* 8 characters check */}
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                criteria.length ? 'bg-success/15 text-success' : 'bg-red-500/10 text-red-500'
              }`}>
                {criteria.length ? <Check className="w-2.5 h-2.5 stroke-[3px]" /> : <X className="w-2.5 h-2.5 stroke-[3px]" />}
              </div>
              <span className={criteria.length ? 'text-neutral-400' : 'text-neutral-500'}>
                At least 8 characters
              </span>
            </div>

            {/* Uppercase check */}
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                criteria.uppercase ? 'bg-success/15 text-success' : 'bg-red-500/10 text-red-500'
              }`}>
                {criteria.uppercase ? <Check className="w-2.5 h-2.5 stroke-[3px]" /> : <X className="w-2.5 h-2.5 stroke-[3px]" />}
              </div>
              <span className={criteria.uppercase ? 'text-neutral-400' : 'text-neutral-500'}>
                One uppercase letter
              </span>
            </div>

            {/* Number check */}
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                criteria.number ? 'bg-success/15 text-success' : 'bg-red-500/10 text-red-500'
              }`}>
                {criteria.number ? <Check className="w-2.5 h-2.5 stroke-[3px]" /> : <X className="w-2.5 h-2.5 stroke-[3px]" />}
              </div>
              <span className={criteria.number ? 'text-neutral-400' : 'text-neutral-500'}>
                One number
              </span>
            </div>

            {/* Special check */}
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                criteria.special ? 'bg-success/15 text-success' : 'bg-red-500/10 text-red-500'
              }`}>
                {criteria.special ? <Check className="w-2.5 h-2.5 stroke-[3px]" /> : <X className="w-2.5 h-2.5 stroke-[3px]" />}
              </div>
              <span className={criteria.special ? 'text-neutral-400' : 'text-neutral-500'}>
                One special character
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button
          type="submit"
          variant="primary"
          disabled={loading || countMet < 4}
          className="w-full font-bold text-xs py-3 text-white bg-primary-500 hover:bg-primary-600 border-none rounded-card disabled:opacity-50 disabled:cursor-not-allowed"
          isLoading={loading}
        >
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </Button>
      </form>
    </motion.div>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-10 space-y-4">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin mx-auto" />
        <p className="text-xs font-bold text-neutral-450 uppercase tracking-widest">
          Loading Page...
        </p>
      </div>
    }>
      <ResetPasswordFormContent />
    </Suspense>
  );
}
