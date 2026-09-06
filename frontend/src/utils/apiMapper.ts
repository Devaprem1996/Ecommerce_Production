import { ProductType, CategoryType } from '@/types';

// Fallback high-resolution organic images map based on category slug
const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'traditional-oils': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400',
  'millet-noodles': 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=400',
  'millet-vermicelli': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400',
  'natural-sweeteners-salts': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400',
  'organic-millets': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
  'traditional-heritage-rices': 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&q=80&w=400',
  'healthy-grain-flours': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400',
  'millet-rice-flakes-aval': 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&q=80&w=400',
  'organic-pulses-dals': 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&q=80&w=400',
  'traditional-healthy-snacks-sweets': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&q=80&w=400',
  // Legacy aliases
  'fruits-vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=400',
  'dairy-eggs': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400',
  'honey-spices': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400',
  'grains-flours': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400',
  'beverages': 'https://images.unsplash.com/photo-1523906630133-f6934a1ab26e?auto=format&fit=crop&q=80&w=400',
};

const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400';
const DEFAULT_PRODUCT_IMAGE = '/images/placeholder.svg';

export function mapCategoryToFrontend(backendCategory: any): CategoryType {
  const slug = backendCategory.slug;
  const rawImage = backendCategory.imageUrl || '';
  
  // Use image mapping fallback if rawImage is un-uploaded placeholder or empty
  const isPlaceholderUrl = !rawImage || rawImage.includes('yathu/categories/');
  const image = isPlaceholderUrl ? (CATEGORY_IMAGE_MAP[slug] || DEFAULT_CATEGORY_IMAGE) : rawImage;

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
  // Use product thumbnailUrl or first variant image
  const firstVariant = backendProduct.variants?.[0];
  const rawImage = backendProduct.thumbnailUrl || firstVariant?.images?.[0] || '';
  
  // Check if rawImage is a valid uploaded URL
  const isRealUploadedImage = Boolean(
    rawImage && 
    !rawImage.includes('yathu/products/') && 
    !rawImage.includes('placeholder') &&
    (rawImage.startsWith('http://') || rawImage.startsWith('https://') || rawImage.startsWith('/'))
  );

  // If real uploaded image exists, use it; otherwise, display clean product placeholder SVG until client uploads real image
  const image = isRealUploadedImage ? rawImage : DEFAULT_PRODUCT_IMAGE;

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
