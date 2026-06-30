import { HTMLAttributes } from 'react';

export type SkeletonVariant = 'card' | 'text' | 'image' | 'table-row';

export interface SkeletonLoaderProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
}
