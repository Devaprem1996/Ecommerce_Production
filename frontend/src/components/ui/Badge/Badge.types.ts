import { HTMLAttributes } from 'react';

export type BadgeVariant = 'hot' | 'new' | 'discount' | 'sold-out' | 'organic';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant: BadgeVariant;
  label?: string; // Optional custom text, otherwise falls back to translation keys
}
