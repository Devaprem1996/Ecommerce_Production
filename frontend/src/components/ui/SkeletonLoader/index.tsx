"use client";

import React from 'react';
import { SkeletonLoaderProps } from './SkeletonLoader.types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className,
  variant = 'text',
  ...props
}) => {
  // Base class for the animate-pulse background
  const baseShimmer = 'animate-pulse bg-neutral-100 dark:bg-neutral-800 rounded-md';

  if (variant === 'card') {
    return (
      <div
        className={twMerge(
          clsx(
            'flex flex-col w-full bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-card p-4 gap-4 overflow-hidden',
            className
          )
        )}
        {...props}
      >
        {/* Card Image Skeleton */}
        <div className={clsx(baseShimmer, 'w-full aspect-square rounded-feature')} />

        <div className="flex flex-col gap-2 flex-1">
          {/* Category Tag */}
          <div className={clsx(baseShimmer, 'w-16 h-4')} />

          {/* Title */}
          <div className={clsx(baseShimmer, 'w-3/4 h-5')} />

          {/* Ratings */}
          <div className={clsx(baseShimmer, 'w-24 h-4')} />

          {/* Price & Cart row */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <div className={clsx(baseShimmer, 'w-16 h-6')} />
            <div className={clsx(baseShimmer, 'w-24 h-9 rounded-card')} />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'image') {
    return (
      <div
        className={twMerge(clsx(baseShimmer, 'w-full aspect-square', className))}
        {...props}
      />
    );
  }

  if (variant === 'table-row') {
    return (
      <div
        className={twMerge(
          clsx('flex items-center w-full justify-between gap-4 py-4 border-b border-neutral-100 dark:border-neutral-800', className)
        )}
        {...props}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className={clsx(baseShimmer, 'w-12 h-12 rounded-card flex-shrink-0')} />
          <div className="flex flex-col gap-2 flex-1">
            <div className={clsx(baseShimmer, 'w-1/3 h-4')} />
            <div className={clsx(baseShimmer, 'w-1/4 h-3')} />
          </div>
        </div>
        <div className={clsx(baseShimmer, 'w-16 h-4')} />
        <div className={clsx(baseShimmer, 'w-20 h-8 rounded-card')} />
      </div>
    );
  }

  // Default: text line skeleton
  return (
    <div
      className={twMerge(clsx(baseShimmer, 'w-full h-4', className))}
      {...props}
    />
  );
};

SkeletonLoader.displayName = 'SkeletonLoader';
