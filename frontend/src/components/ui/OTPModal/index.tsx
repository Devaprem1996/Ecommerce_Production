"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, ArrowRight, Loader2, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth-store';
import { toast } from '@/components/ui/Toast';

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const OTPModal: React.FC<OTPModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { setAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2>(1); // 1: Mobile number, 2: OTP boxes
  
  // Mobile form states
  const [mobileNumber, setMobileNumber] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // OTP form states
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Timer states
  const [timer, setTimer] = useState(30);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [otpSentCount, setOtpSentCount] = useState(1);

  // Input refs for auto-focusing
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when active
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

  // Resend Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, step, timer]);

  if (!mounted) return null;

  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(mobileNumber)) {
      toast.warning('Please enter a valid 10-digit mobile number.');
      return;
    }
    setIsSendingOtp(true);
    // Simulate sending OTP SMS
    setTimeout(() => {
      setIsSendingOtp(false);
      setStep(2);
      setTimer(30);
      toast.success('Test OTP 123456 sent to +91-' + mobileNumber);
    }, 1200);
  };

  const handleOtpChange = (value: string, idx: number) => {
    const cleanVal = value.replace(/\D/g, '').slice(-1); // Only allow last typed digit
    const newOtp = [...otp];
    newOtp[idx] = cleanVal;
    setOtp(newOtp);
    setErrorMsg(null);

    // Auto-focus next box on digit entry
    if (cleanVal !== '' && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }

    // Auto-submit when all 6 fields are filled
    if (newOtp.every((char) => char !== '')) {
      const code = newOtp.join('');
      verifyOtp(code);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      // If current box is empty, clear previous box and focus it
      if (newOtp[idx] === '' && idx > 0) {
        newOtp[idx - 1] = '';
        setOtp(newOtp);
        inputRefs.current[idx - 1]?.focus();
        setErrorMsg(null);
      } else {
        newOtp[idx] = '';
        setOtp(newOtp);
        setErrorMsg(null);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const otpArray = pastedData.split('');
      setOtp(otpArray);
      setErrorMsg(null);
      verifyOtp(pastedData);
    }
  };

  const verifyOtp = (code: string) => {
    setIsVerifying(true);
    setTimeout(() => {
      if (code === '123456') {
        setIsVerifying(false);
        setIsSuccess(true);
        // Login with mock user
        setTimeout(() => {
          setAuth(
            {
              id: 'cust-' + Math.floor(Math.random() * 10000),
              email: 'customer@aether.org',
              role: 'CUSTOMER',
              firstName: 'Ganesh',
              lastName: 'Prabhu',
            },
            'mock-jwt-token-xyz-987'
          );
          toast.success('Successfully logged in!');
          if (onSuccess) onSuccess();
          handleClose();
        }, 1200);
      } else {
        setIsVerifying(false);
        setOtp(Array(6).fill(''));
        inputRefs.current[0]?.focus();
        setErrorMsg('Invalid OTP. Please try again (use 123456 for testing).');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
    }, 1200);
  };

  const handleResend = () => {
    if (resendAttempts >= 3) {
      setErrorMsg('Too many resend attempts. Please wait 10 minutes.');
      return;
    }
    setTimer(30);
    setResendAttempts((prev) => prev + 1);
    setOtpSentCount((prev) => prev + 1);
    setOtp(Array(6).fill(''));
    inputRefs.current[0]?.focus();
    toast.success('New OTP 123456 sent!');
  };

  const handleClose = () => {
    // Reset state
    setStep(1);
    setMobileNumber('');
    setOtp(Array(6).fill(''));
    setErrorMsg(null);
    setIsSuccess(false);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/45 backdrop-blur-[4px] cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full sm:max-w-md bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 max-sm:absolute max-sm:bottom-0 max-sm:rounded-t-feature rounded-feature shadow-2xl flex flex-col overflow-hidden z-10 font-sans"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary-500" />
                <span className="font-bold text-base text-neutral-900 dark:text-white uppercase tracking-wider">
                  ⚡ Quick Checkout
                </span>
              </div>
              <button
                onClick={handleClose}
                className="p-1 text-neutral-500 hover:text-primary-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {isSuccess ? (
                /* Success animation state */
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.6 }}
                    className="w-16 h-16 text-success"
                  >
                    <CheckCircle2 className="w-full h-full fill-success/10" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                      Verified Successfully!
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                      Logging you in and redirecting to checkout...
                    </p>
                  </div>
                </div>
              ) : step === 1 ? (
                /* Step 1: Mobile Input */
                <form onSubmit={handleMobileSubmit} className="space-y-5">
                  <div className="text-center sm:text-left">
                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 leading-relaxed">
                      Enter your mobile number to sign in instantly. No passwords needed!
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-650 dark:text-neutral-400 uppercase tracking-widest block">
                      Mobile Number
                    </label>
                    <div className="flex rounded-card overflow-hidden border border-neutral-200 dark:border-neutral-750 bg-neutral-50 dark:bg-neutral-850">
                      <div className="px-3 bg-neutral-100 dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-750 flex items-center justify-center text-sm font-bold text-neutral-805 dark:text-neutral-300">
                        +91
                      </div>
                      <input
                        type="tel"
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="Enter 10-digit number"
                        className="flex-1 text-sm font-semibold px-3.5 py-3 bg-transparent text-neutral-900 dark:text-white outline-none focus:ring-0"
                        autoFocus
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="cta"
                    size="lg"
                    disabled={mobileNumber.length !== 10 || isSendingOtp}
                    className="w-full font-bold text-sm bg-gradient-to-r from-primary-500 to-primary-700 text-white"
                    rightIcon={isSendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  >
                    {isSendingOtp ? 'Sending OTP...' : 'Send Verification OTP'}
                  </Button>
                </form>
              ) : (
                /* Step 2: OTP input boxes */
                <div className="space-y-5">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      OTP Sent to <span className="font-bold text-neutral-900 dark:text-white">+91-{mobileNumber}</span>
                    </p>
                    <p className="text-[10px] font-bold text-neutral-500 mt-0.5">
                      Check your SMS (enter <span className="text-primary-500">123456</span> to test)
                    </p>
                  </div>

                  {/* 6 Digit Input Boxes */}
                  <div className={`flex justify-center gap-2.5 ${isShaking && 'animate-shake'}`}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { inputRefs.current[idx] = el; }}
                        type="text"
                        pattern="\d*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        onPaste={idx === 0 ? handlePaste : undefined}
                        className={`w-12 h-12 text-center text-lg font-black rounded-card border-2 bg-neutral-50 dark:bg-neutral-850 text-neutral-900 dark:text-white outline-none transition-all ${
                          digit !== ''
                            ? 'border-primary-500 ring-2 ring-primary-500/10 scale-102 font-black'
                            : errorMsg
                            ? 'border-red-500/60 focus:border-red-500'
                            : 'border-neutral-200 dark:border-neutral-750 focus:border-primary-500'
                        }`}
                        style={{ WebkitTextSecurity: 'none' } as React.CSSProperties}
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  {errorMsg && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 justify-center">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Verifying Spinner */}
                  {isVerifying && (
                    <div className="flex justify-center text-primary-500 gap-1.5 items-center text-xs font-semibold py-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying code...</span>
                    </div>
                  )}

                  {/* Timer & Resend */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <button
                      onClick={() => setStep(1)}
                      className="text-neutral-550 dark:text-neutral-450 hover:underline font-semibold"
                    >
                      ← Change Number
                    </button>

                    {timer > 0 ? (
                      <span className="text-neutral-600 dark:text-neutral-400 font-medium">
                        Resend OTP in <span className="font-bold">{timer}s</span>
                      </span>
                    ) : (
                      <button
                        onClick={handleResend}
                        disabled={resendAttempts >= 3}
                        className="text-primary-500 hover:text-primary-400 font-bold flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Resend OTP</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
