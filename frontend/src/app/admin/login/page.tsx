"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { KeyRound, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in');
    if (isLoggedIn === 'true') {
      router.replace('/admin');
    }
  }, [router]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = (data: LoginFormData) => {
    setLoading(true);
    // Simulate validation check
    setTimeout(() => {
      setLoading(false);
      if (data.email === 'admin@aetherorganic.com' && data.password === 'admin123') {
        localStorage.setItem('admin_logged_in', 'true');
        toast.success('Logged in successfully!');
        router.replace('/admin');
      } else {
        toast.error('Invalid email or password. Hint: admin@aetherorganic.com / admin123');
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center p-4 font-sans select-none relative overflow-hidden">
      
      {/* Visual background flourishes */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-secondary-400/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/95 dark:bg-neutral-900/95 backdrop-blur border border-white/20 dark:border-neutral-800 rounded-feature p-8 shadow-2xl relative z-10 space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto text-primary-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2.5xl font-black font-heading text-primary-900 dark:text-white tracking-tight">
            Aether Admin Center
          </h2>
          <p className="text-xs font-semibold text-neutral-500">
            Sign in to manage organic operations & orders.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                {...register('email')}
                className="w-full text-xs font-semibold pl-10 pr-4 py-3 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="admin@aetherorganic.com"
              />
            </div>
            {errors.email && (
              <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="password"
                {...register('password')}
                className="w-full text-xs font-semibold pl-10 pr-4 py-3 border border-neutral-200 dark:border-neutral-700 rounded-card bg-transparent text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="••••••"
              />
            </div>
            {errors.password && (
              <span className="text-[10px] font-bold text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.password.message}
              </span>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full font-bold text-xs py-3 mt-2"
            isLoading={loading}
            rightIcon={loading ? undefined : <ArrowRight className="w-4 h-4" />}
          >
            Authenticate Admin
          </Button>
        </form>
        
        <div className="pt-2 text-center text-[10px] text-neutral-500 font-bold border-t border-neutral-100 dark:border-neutral-800">
          Hint: admin@aetherorganic.com / admin123
        </div>
      </motion.div>
    </div>
  );
}
