"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { StarRatingProps } from './StarRating.types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Star } from 'lucide-react';

export const StarRating: React.FC<StarRatingProps> = ({
  className,
  rating,
  maxStars = 5,
  interactive = false,
  onChange,
  size = 'md',
  ...props
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleStarClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    if (!interactive || !onChange) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(index + 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onChange(Math.min(maxStars, rating + 1));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onChange(Math.max(1, rating - 1));
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const gapClasses = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'inline-flex items-center',
          gapClasses[size],
          interactive && 'cursor-pointer',
          className
        )
      )}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={interactive ? `Rate this product (currently ${rating} stars)` : `Rating: ${rating} out of ${maxStars} stars`}
      {...props}
    >
      {Array.from({ length: maxStars }).map((_, index) => {
        // Calculate fill percentage for each star
        // If hovered in interactive mode, fill completely up to the hovered star
        let fillPercentage = 0;
        if (interactive && hoveredIndex !== null) {
          fillPercentage = index <= hoveredIndex ? 1 : 0;
        } else {
          fillPercentage = Math.max(0, Math.min(1, rating - index));
        }

        const isInteractiveStar = interactive;

        return (
          <motion.div
            key={index}
            tabIndex={isInteractiveStar ? 0 : undefined}
            role={isInteractiveStar ? 'radio' : undefined}
            aria-checked={isInteractiveStar ? rating >= index + 1 : undefined}
            aria-label={isInteractiveStar ? `${index + 1} Star` : undefined}
            onMouseEnter={() => isInteractiveStar && setHoveredIndex(index)}
            onMouseLeave={() => isInteractiveStar && setHoveredIndex(null)}
            onClick={() => handleStarClick(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            whileHover={isInteractiveStar ? { scale: 1.2 } : undefined}
            whileTap={isInteractiveStar ? { scale: 0.9 } : undefined}
            className="relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-sm"
          >
            {/* Base Empty Star */}
            <Star
              className={twMerge(
                clsx(
                  'text-neutral-600 transition-colors duration-normal fill-transparent',
                  sizeClasses[size]
                )
              )}
            />

            {/* Filled Star Overlay (Clipped) */}
            {fillPercentage > 0 && (
              <div
                style={{ width: `${fillPercentage * 100}%` }}
                className="absolute inset-0 overflow-hidden pointer-events-none"
              >
                <Star
                  className={twMerge(
                    clsx(
                      'text-secondary-400 fill-secondary-400',
                      sizeClasses[size]
                    )
                  )}
                />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

StarRating.displayName = 'StarRating';
