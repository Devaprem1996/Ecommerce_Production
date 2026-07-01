"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import Link from 'next/link';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Enter a valid email address' }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function AdminForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [csrfToken, setCsrfToken] = useState('');

  // Initialize CSRF Token
  useEffect(() => {
    const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    setCsrfToken(token);
  }, []);

  // Resend countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    }
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);

    try {
      const response = await fetch('/api/auth/admin/forgot-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ email: data.email, csrfToken })
      });

      const resData = await response.json();
      setLoading(false);

      if (response.ok && resData.success) {
        setSubmittedEmail(data.email);
        setSuccess(true);
        setResendTimer(60);
        toast.success('Reset link sent!');
      } else {
        toast.error(resData.message || 'Failed to send reset link.');
      }
    } catch (err) {
      setLoading(false);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);

    try {
      const response = await fetch('/api/auth/admin/forgot-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ email: submittedEmail, csrfToken })
      });

      const resData = await response.json();
      setLoading(false);

      if (response.ok && resData.success) {
        setResendTimer(60);
        toast.success('Reset link resent successfully!');
      } else {
        toast.error(resData.message || 'Failed to resend reset link.');
      }
    } catch (err) {
      setLoading(false);
      toast.error('Something went wrong. Please try again.');
    }
  };

  // Mask Email Helper
  const maskEmail = (email: string) => {
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    const [name, domain] = parts;
    if (name.length <= 1) return `*@${domain}`;
    return `${name[0]}***@${domain}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-feature p-8 shadow-2xl relative z-10"
    >
      <AnimatePresence mode="wait">
        {!success ? (
          /* STATE 1: Email Input Form */
          <motion.div
            key="forgot-form"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            {/* Back to Login Header Link */}
            <div className="select-none">
              <Link 
                href="/admin/login" 
                className="text-xs font-bold text-neutral-450 hover:text-primary-400 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-black font-heading text-white tracking-tight">
                Forgot Password?
              </h2>
              <p className="text-xs text-neutral-400 font-medium">
                No worries! We'll send you a password reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* CSRF Token Input */}
              <input type="hidden" name="csrf_token" value={csrfToken} />

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input
                    type="email"
                    disabled={loading}
                    {...register('email')}
                    className="w-full text-xs font-semibold pl-10 pr-4 py-3 border border-neutral-800 rounded-card bg-neutral-950 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                    placeholder="Enter admin email"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-1 pl-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* Action Button */}
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="w-full font-bold text-xs py-3 text-white bg-primary-500 hover:bg-primary-600 border-none rounded-card"
                isLoading={loading}
              >
                {loading ? 'Sending Reset Link...' : 'Send Reset Link →'}
              </Button>
            </form>
          </motion.div>
        ) : (
          /* STATE 2: Success Confirmation */
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center space-y-6"
          >
            {/* Animated checkmark */}
            <div className="flex justify-center pt-2">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-16 h-16 bg-success/15 rounded-full flex items-center justify-center text-success border border-success/20"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black font-heading text-white tracking-tight">
                Reset link sent!
              </h3>
              <p className="text-xs font-semibold text-neutral-450 uppercase tracking-widest">
                Check your email
              </p>
              <p className="text-sm font-semibold text-primary-400 bg-primary-500/5 py-2.5 px-4 rounded border border-primary-500/10 inline-block mt-2">
                {maskEmail(submittedEmail)}
              </p>
              <p className="text-xs font-semibold text-neutral-500 mt-2">
                ⏳ Link valid for 1 hour.
              </p>
            </div>

            <div className="pt-4 border-t border-neutral-800 space-y-3">
              {/* Resend button */}
              <Button
                onClick={handleResend}
                variant="secondary"
                disabled={loading || resendTimer > 0}
                className="w-full font-bold text-xs py-3 border border-neutral-700 bg-transparent text-neutral-200 hover:bg-neutral-800 hover:text-white rounded-card disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendTimer > 0 ? `Resend Email (${resendTimer}s)` : 'Resend Email'}
              </Button>

              {/* Back to Login button */}
              <Link href="/admin/login" className="block">
                <Button
                  variant="ghost"
                  className="w-full font-bold text-xs py-3 bg-neutral-950 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-card"
                >
                  ← Back to Login
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
