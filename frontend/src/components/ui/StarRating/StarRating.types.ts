import { HTMLAttributes } from 'react';

export type StarRatingSize = 'sm' | 'md' | 'lg';

export interface StarRatingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  rating: number;
  maxStars?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: StarRatingSize;
}
