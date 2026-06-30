"use client";

import React from 'react';
import { useTranslation } from 'react-i18next';
import { BadgeProps } from './Badge.types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  label,
  ...props
}) => {
  const { t } = useTranslation();

  const variantClasses = {
    hot: 'bg-secondary-600 text-white font-semibold',
    new: 'bg-success text-white font-semibold',
    discount: 'bg-error text-white font-semibold',
    'sold-out': 'bg-neutral-600 text-white font-semibold',
    organic: 'bg-primary-500 text-white font-medium',
  };

  // Resolve localized text or fall back to default capitalized variant name
  const text = label || t(`badge.${variant}`, variant.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()));

  return (
    <div
      className={twMerge(
        clsx(
          'inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-sans rounded-badge leading-none tracking-wide select-none',
          variantClasses[variant],
          className
        )
      )}
      role="status"
      aria-label={text}
      {...props}
    >
      {text}
    </div>
  );
};

Badge.displayName = 'Badge';
