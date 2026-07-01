"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, Eye, EyeOff, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth-store';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().min(1, { message: 'Email is required' }).email({ message: 'Enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');
  
  // Lockout States
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutMinutes, setLockoutMinutes] = useState(0);
  const [attempts, setAttempts] = useState(0);

  // Initialize CSRF Token and Check Lockout
  useEffect(() => {
    // Generate a simple client-side CSRF token
    const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    setCsrfToken(token);

    const checkLockout = () => {
      const lockoutUntil = localStorage.getItem('admin_lockout_until');
      const savedAttempts = localStorage.getItem('admin_login_attempts');
      if (savedAttempts) {
        setAttempts(parseInt(savedAttempts, 10));
      }
      
      if (lockoutUntil) {
        const until = parseInt(lockoutUntil, 10);
        if (Date.now() < until) {
          setIsLocked(true);
          setLockoutMinutes(Math.ceil((until - Date.now()) / 60000));
        } else {
          // Lockout expired
          localStorage.removeItem('admin_lockout_until');
          localStorage.setItem('admin_login_attempts', '0');
          setAttempts(0);
          setIsLocked(false);
        }
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    if (isLocked) {
      toast.error(`Account locked. Try after ${lockoutMinutes} minutes.`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ 
          email: data.email, 
          password: data.password,
          csrfToken 
        })
      });

      const resData = await response.json();
      setLoading(false);

      if (response.ok && resData.success) {
        // Reset brute-force counter
        localStorage.removeItem('admin_login_attempts');
        localStorage.removeItem('admin_lockout_until');
        
        // Save session state
        localStorage.setItem('admin_logged_in', 'true');
        
        // Log in to Zustand store
        login(resData.user, resData.accessToken);
        
        toast.success(`Welcome back, ${resData.user.name || 'Administrator'}!`);
        router.replace('/admin/dashboard');
      } else {
        // Log failed attempt
        console.warn(`[SECURITY] Failed admin login attempt for email: ${data.email} at ${new Date().toISOString()}`);

        const nextAttempts = attempts + 1;
        localStorage.setItem('admin_login_attempts', nextAttempts.toString());
        setAttempts(nextAttempts);

        if (nextAttempts >= 5) {
          const lockoutTime = Date.now() + 15 * 60 * 1000; // 15 mins
          localStorage.setItem('admin_lockout_until', lockoutTime.toString());
          setIsLocked(true);
          setLockoutMinutes(15);
          toast.error('Account locked. Try after 15 minutes.');
        } else {
          toast.error('Invalid email or password');
        }
      }
    } catch (err) {
      setLoading(false);
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-feature p-8 shadow-2xl relative z-10"
    >
      <div className="text-center space-y-2 mb-6">
        <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto text-primary-400">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black font-heading text-white tracking-tight flex items-center justify-center gap-2">
          <span>🔐</span> Admin Portal
        </h2>
        <p className="text-xs font-semibold text-neutral-450 uppercase tracking-widest">
          Authorized Personnel Only
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isLocked ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center p-6 bg-red-950/20 border border-red-900/30 rounded-card space-y-4"
          >
            <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-500">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">Access Denied</h3>
              <p className="text-xs font-medium text-neutral-400">
                Too many failed attempts.
              </p>
              <p className="text-sm font-black text-red-400 mt-2">
                Account locked. Try after {lockoutMinutes} minute{lockoutMinutes > 1 ? 's' : ''}.
              </p>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Hidden CSRF Token Field */}
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
                  placeholder="admin@aether.com"
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

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  disabled={loading}
                  {...register('password')}
                  className="w-full text-xs font-semibold pl-4 pr-10 py-3 border border-neutral-800 rounded-card bg-neutral-950 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                  placeholder="••••••••"
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

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                disabled={loading}
                className="h-4 w-4 rounded border-neutral-800 bg-neutral-950 text-primary-500 focus:ring-primary-500 cursor-pointer disabled:opacity-50"
              />
              <label htmlFor="remember_me" className="ml-2 block text-xs font-bold text-neutral-400 cursor-pointer select-none">
                Remember me (this device)
              </label>
            </div>

            {/* Failed Attempt Counter */}
            {attempts >= 1 && attempts < 5 && (
              <div className="text-[10px] font-black text-amber-500 text-center uppercase tracking-wider py-1 bg-amber-500/5 rounded border border-amber-500/10">
                ⚠️ {attempts} of 5 attempts used
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full font-bold text-xs py-3 mt-2 text-white bg-primary-500 hover:bg-primary-600 border-none rounded-card"
              isLoading={loading}
            >
              {loading ? 'Securing Connection...' : 'Login to Dashboard →'}
            </Button>

            {/* Forgot Password Link */}
            <div className="text-center pt-2 select-none">
              <Link 
                href="/admin/forgot-password" 
                className="text-xs font-bold text-neutral-450 hover:text-primary-400 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
