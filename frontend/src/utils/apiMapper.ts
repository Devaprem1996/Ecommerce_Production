import { ProductType, CategoryType } from '@/types';

// Fallback images map based on slug
const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'fruits-vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=400',
  'dairy-eggs': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400',
  'honey-spices': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400',
  'grains-flours': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400',
  'beverages': 'https://images.unsplash.com/photo-1523906630133-f6934a1ab26e?auto=format&fit=crop&q=80&w=400',
};

const DEFAULT_CATEGORY_IMAGE = '/images/placeholder.svg';
const DEFAULT_PRODUCT_IMAGE = '/images/placeholder.svg';

export function mapCategoryToFrontend(backendCategory: any): CategoryType {
  const slug = backendCategory.slug;
  const image = backendCategory.imageUrl || CATEGORY_IMAGE_MAP[slug] || DEFAULT_CATEGORY_IMAGE;

  return {
    id: backendCategory.id,
    name: backendCategory.nameEn,
    nameTamil: backendCategory.nameTa || undefined,
    slug: slug,
    image: image,
    itemCount: backendCategory._count?.products ?? 0,
  };
}

export function mapProductToFrontend(backendProduct: any): ProductType {
  const categorySlug = backendProduct.category?.slug || '';
  const fallbackImage = CATEGORY_IMAGE_MAP[categorySlug] || DEFAULT_PRODUCT_IMAGE;

  // Use product thumbnailUrl or first variant image or fallback
  const firstVariant = backendProduct.variants?.[0];
  const image = backendProduct.thumbnailUrl || firstVariant?.images?.[0] || fallbackImage;

  // Stock is total across variants or first variant quantity
  const stock = firstVariant?.inventory?.availableQuantity ?? 0;
  const price = firstVariant?.price ? Number(firstVariant.price) : 0;
  const unit = firstVariant?.weight 
    ? `${firstVariant.weight}${firstVariant.unit || 'kg'}`
    : firstVariant?.nameEn || '1 unit';

  return {
    id: backendProduct.id,
    name: backendProduct.nameEn,
    nameTamil: backendProduct.nameTa || undefined,
    description: backendProduct.descriptionEn || '',
    descriptionTamil: backendProduct.descriptionTa || undefined,
    price: price,
    images: [image],
    category: backendProduct.category?.nameEn || 'General',
    stock: stock,
    rating: backendProduct.rating ? Number(backendProduct.rating) : 4.5,
    reviewsCount: backendProduct.reviewsCount ?? 0,
    isOrganic: backendProduct.isOrganic ?? true,
    isLabTested: backendProduct.isLabTested ?? false,
    unit: unit,
  };
}
