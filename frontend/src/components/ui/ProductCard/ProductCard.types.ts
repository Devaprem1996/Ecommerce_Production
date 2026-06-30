import { HTMLAttributes } from 'react';
import { ProductType } from '@/types';

export interface ProductCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'id'> {
  product: ProductType;
  onAddToCart?: (product: ProductType) => void;
  onWishlistToggle?: (product: ProductType) => void;
  isWishlisted?: boolean;
  onQuickView?: (product: ProductType) => void;
}
