"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface OtpInputProps {
  length: number;
  onComplete: (otp: string) => void;
  hasError?: boolean;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  onComplete,
  hasError = false,
  disabled = false
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Clear inputs if error state is updated
  useEffect(() => {
    if (hasError) {
      setOtp(Array(length).fill(''));
      inputRefs.current[0]?.focus();
    }
  }, [hasError, length]);

  const handleChange = (val: string, idx: number) => {
    const cleanVal = val.replace(/\D/g, '').slice(-1); // Take only the last digit entered
    const newOtp = [...otp];
    newOtp[idx] = cleanVal;
    setOtp(newOtp);

    // Auto-focus next box on entry
    if (cleanVal !== '' && idx < length - 1) {
      inputRefs.current[idx + 1]?.focus();
    }

    // Auto-submit when all boxes are filled
    if (newOtp.every((char) => char !== '')) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (newOtp[idx] === '' && idx > 0) {
        // If current is empty, clear previous and focus it
        newOtp[idx - 1] = '';
        setOtp(newOtp);
        inputRefs.current[idx - 1]?.focus();
      } else {
        // Just clear current box
        newOtp[idx] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (new RegExp(`^\\d{${length}}$`).test(pastedData)) {
      const otpArray = pastedData.split('');
      setOtp(otpArray);
      onComplete(pastedData);
      // Blur the last input or focus last
      inputRefs.current[length - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {otp.map((digit, idx) => (
        <motion.input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e.target.value, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onPaste={idx === 0 ? handlePaste : undefined}
          aria-label={`OTP Digit ${idx + 1}`}
          className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-card border-2 bg-neutral-50 dark:bg-neutral-850 text-neutral-900 dark:text-white outline-none transition-all ${
            digit !== ''
              ? 'border-primary-500 ring-2 ring-primary-500/10 scale-105'
              : hasError
              ? 'border-red-500/60 focus:border-red-500 bg-red-500/5 dark:bg-red-500/5'
              : 'border-neutral-200 dark:border-neutral-750 focus:border-primary-500'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          animate={digit !== '' ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.2 }}
        />
      ))}
    </div>
  );
};

export default OtpInput;
