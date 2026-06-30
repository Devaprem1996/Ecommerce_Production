"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { InputProps } from './Input.types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      type = 'text',
      error,
      success,
      onFocus,
      onBlur,
      onChange,
      id,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [value, setValue] = useState((props.value || props.defaultValue || '').toString());
    const [shouldShake, setShouldShake] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Sync state with controlled prop changes
    useEffect(() => {
      if (props.value !== undefined) {
        setValue(props.value.toString());
      }
    }, [props.value]);

    // Shake animation trigger when error message is supplied
    useEffect(() => {
      if (error) {
        setShouldShake(true);
        const timer = setTimeout(() => setShouldShake(false), 500);
        return () => clearTimeout(timer);
      }
    }, [error]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (onFocus) onFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (onBlur) onBlur(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      if (onChange) onChange(e);
    };

    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const hasContent = value.length > 0;
    const isFloating = isFocused || hasContent;
    const isPassword = type === 'password';
    const activeType = isPassword && showPassword ? 'text' : type;

    // Shake variants
    const containerVariants = {
      shake: {
        x: [-6, 6, -6, 6, -3, 3, 0],
        transition: { duration: 0.4 }
      },
      idle: { x: 0 }
    };

    return (
      <motion.div
        animate={shouldShake ? 'shake' : 'idle'}
        variants={containerVariants}
        className="w-full font-sans flex flex-col gap-1.5"
      >
        <div className="relative flex items-center w-full">
          {/* Input field */}
          <input
            id={inputId}
            ref={(el) => {
              inputRef.current = el;
              if (typeof ref === 'function') ref(el);
              else if (ref) ref.current = el;
            }}
            type={activeType}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            value={value}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={twMerge(
              clsx(
                'w-full h-12 px-4 pt-4 pb-1 text-base bg-white dark:bg-neutral-900 border rounded-card outline-none transition-all duration-normal placeholder-transparent focus:ring-1',
                // Border/focus states
                error
                  ? 'border-error focus:border-error focus:ring-error'
                  : success
                  ? 'border-success focus:border-success focus:ring-success'
                  : 'border-neutral-600 focus:border-primary-500 focus:ring-primary-500',
                // Adjust right padding for icons
                (isPassword || success || error) && 'pr-11'
              ),
              className
            )}
            {...props}
          />

          {/* Floating Label */}
          <motion.label
            htmlFor={inputId}
            animate={{
              top: isFloating ? '6px' : '50%',
              scale: isFloating ? 0.75 : 1,
              y: isFloating ? '0%' : '-50%',
              left: isFloating ? '12px' : '16px',
            }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ originX: 0, originY: 0 }}
            className={twMerge(
              clsx(
                'absolute pointer-events-none text-base select-none leading-none z-10',
                error
                  ? 'text-error'
                  : success
                  ? 'text-success'
                  : isFocused
                  ? 'text-primary-500'
                  : 'text-neutral-600'
              )
            )}
          >
            {label}
          </motion.label>

          {/* Action/State Icons */}
          <div className="absolute right-3.5 flex items-center justify-center gap-1.5 z-10">
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-neutral-600 hover:text-primary-500 focus:outline-none rounded-full min-w-[28px] min-h-[28px] flex items-center justify-center cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            )}

            {error && <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />}
            {!error && success && <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p id={`${inputId}-error`} role="alert" className="text-xs text-error font-medium pl-1">
            {error}
          </p>
        )}
      </motion.div>
    );
  }
);

Input.displayName = 'Input';
