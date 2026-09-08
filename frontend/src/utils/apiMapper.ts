import { ProductType, CategoryType } from '@/types';

const PRODUCT_TYPE_IMAGE = {
  oils: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600',
  noodles: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&q=80&w=600',
  vermicelli: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=600',
  sweeteners: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600',
  millets: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600',
  rices: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&q=80&w=600',
  flours: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
  flakes: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&q=80&w=600',
  pulses: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&q=80&w=600',
  snacks: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&q=80&w=600',
  produce: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=600',
  dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=600',
  beverages: 'https://images.unsplash.com/photo-1523906630133-f6934a1ab26e?auto=format&fit=crop&q=80&w=600',
};

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  'traditional-oils': PRODUCT_TYPE_IMAGE.oils,
  'millet-noodles': PRODUCT_TYPE_IMAGE.noodles,
  'millet-vermicelli': PRODUCT_TYPE_IMAGE.vermicelli,
  'natural-sweeteners': PRODUCT_TYPE_IMAGE.sweeteners,
  'organic-millets': PRODUCT_TYPE_IMAGE.millets,
  'traditional-rices': PRODUCT_TYPE_IMAGE.rices,
  'healthy-flours': PRODUCT_TYPE_IMAGE.flours,
  'millet-rice-flakes': PRODUCT_TYPE_IMAGE.flakes,
  'organic-pulses-dals': PRODUCT_TYPE_IMAGE.pulses,
  'traditional-snacks-sweets': PRODUCT_TYPE_IMAGE.snacks,
  'natural-sweeteners-salts': PRODUCT_TYPE_IMAGE.sweeteners,
  'traditional-heritage-rices': PRODUCT_TYPE_IMAGE.rices,
  'healthy-grain-flours': PRODUCT_TYPE_IMAGE.flours,
  'millet-rice-flakes-aval': PRODUCT_TYPE_IMAGE.flakes,
  'traditional-healthy-snacks-sweets': PRODUCT_TYPE_IMAGE.snacks,
  'fruits-vegetables': PRODUCT_TYPE_IMAGE.produce,
  'dairy-eggs': PRODUCT_TYPE_IMAGE.dairy,
  'honey-spices': PRODUCT_TYPE_IMAGE.sweeteners,
  'grains-flours': PRODUCT_TYPE_IMAGE.flours,
  'beverages': PRODUCT_TYPE_IMAGE.beverages,
};

const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400';
const DEFAULT_PRODUCT_IMAGE = '/images/placeholder.svg';

export function resolveProductImage(slug: string, categorySlug: string): string {
  const s = (slug || '').toLowerCase();
  const has = (...words: string[]) => words.some((w) => s.includes(w));

  if (has('vermicelli')) return PRODUCT_TYPE_IMAGE.vermicelli;
  if (has('noodles')) return PRODUCT_TYPE_IMAGE.noodles;
  if (has('biscuits', 'chikki', 'candy', 'burfi', 'seedai', 'murukku', 'mittai')
    || s.includes('balls')
    || s.includes('fried')
    || s.includes('-coco-')) return PRODUCT_TYPE_IMAGE.snacks;
  if (has('flakes')) return PRODUCT_TYPE_IMAGE.flakes;
  if (has('oil')) return PRODUCT_TYPE_IMAGE.oils;
  if (has('honey', 'jaggery', 'salt')) return PRODUCT_TYPE_IMAGE.sweeteners;
  if (has('flour')) return PRODUCT_TYPE_IMAGE.flours;
  if (s.includes('groundnut')) return CATEGORY_IMAGE_MAP[categorySlug] || PRODUCT_TYPE_IMAGE.pulses;
  if (has('gram', 'dal', 'urad', 'toor', 'moong')) return PRODUCT_TYPE_IMAGE.pulses;

  return CATEGORY_IMAGE_MAP[categorySlug] || CATEGORY_IMAGE_MAP['fruits-vegetables'] || DEFAULT_PRODUCT_IMAGE;
}

export function mapCategoryToFrontend(backendCategory: any): CategoryType {
  const slug = backendCategory.slug;
  const rawImage = backendCategory.imageUrl || '';

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
  const isPlaceholderUrl = !rawImage || rawImage.includes('yathu/products/') || rawImage.includes('placeholder');

  const image = isPlaceholderUrl
    ? resolveProductImage(backendProduct.slug, backendProduct.category?.slug)
    : rawImage;

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