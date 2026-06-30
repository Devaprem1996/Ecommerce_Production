"use client";

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ButtonProps, RippleType } from './Button.types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      rippleColor = 'rgba(255, 255, 255, 0.3)',
      onClick,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<RippleType[]>([]);
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    const handleCreateRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) return;

      const button = buttonRef.current || event.currentTarget;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      
      // Calculate coordinates relative to the button
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const newRipple: RippleType = {
        x,
        y,
        size,
        id: Date.now() + Math.random(),
      };

      setRipples((prev) => [...prev, newRipple]);
      
      // Clean up ripple after animation is done
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);

      if (onClick) {
        onClick(event);
      }
    };

    const variantClasses = {
      primary: 'bg-primary-500 text-white hover:bg-primary-400 active:bg-primary-700 focus-visible:ring-primary-400 focus-visible:ring-2 focus-visible:ring-offset-2',
      secondary: 'bg-primary-700 text-white hover:bg-primary-500 active:bg-primary-700 focus-visible:ring-primary-500 focus-visible:ring-2 focus-visible:ring-offset-2',
      ghost: 'bg-transparent text-primary-500 hover:bg-neutral-100 active:bg-neutral-200 focus-visible:ring-primary-400 focus-visible:ring-2 focus-visible:ring-offset-2',
      danger: 'bg-error text-white hover:bg-red-600 active:bg-red-700 focus-visible:ring-red-400 focus-visible:ring-2 focus-visible:ring-offset-2',
      cta: 'bg-gradient-to-r from-secondary-400 to-secondary-600 text-white hover:brightness-110 active:brightness-95 shadow-md hover:shadow-lg focus-visible:ring-secondary-400 focus-visible:ring-2 focus-visible:ring-offset-2',
    };

    const sizeClasses = {
      sm: 'h-9 px-4 text-sm rounded-card',
      md: 'h-11 px-5 text-base rounded-card', // 44px min touch target (standard: 11 * 4px = 44px)
      lg: 'h-12 px-6 text-lg rounded-feature',
      xl: 'h-14 px-8 text-xl rounded-feature',
    };

    return (
      <motion.button
        ref={(el) => {
          buttonRef.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
        }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={twMerge(
          clsx(
            'relative overflow-hidden inline-flex items-center justify-center font-sans font-medium transition-colors duration-normal focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none select-none cursor-pointer',
            variantClasses[variant],
            sizeClasses[size],
            className
          )
        )}
        onClick={handleCreateRipple}
        disabled={disabled || isLoading}
        type={type}
        aria-busy={isLoading}
        aria-disabled={disabled || isLoading}
        {...props}
      >
        {/* Ripples container using Framer Motion */}
        <span className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: ripple.y,
                left: ripple.x,
                width: ripple.size,
                height: ripple.size,
                borderRadius: '9999px',
                backgroundColor: rippleColor,
                pointerEvents: 'none',
              }}
            />
          ))}
        </span>

        {/* Loading Spinner */}
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.svg
              initial={{ opacity: 0, width: 0, marginRight: 0 }}
              animate={{ opacity: 1, width: '1.25rem', marginRight: '0.5rem' }}
              exit={{ opacity: 0, width: 0, marginRight: 0 }}
              className="animate-spin h-5 w-5 text-current flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Left Icon */}
        {!isLoading && leftIcon && (
          <span className="mr-2 inline-flex items-center justify-center flex-shrink-0">{leftIcon}</span>
        )}

        {/* Button Content */}
        <span className="relative z-10 flex items-center justify-center">{children}</span>

        {/* Right Icon */}
        {!isLoading && rightIcon && (
          <span className="ml-2 inline-flex items-center justify-center flex-shrink-0">{rightIcon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
