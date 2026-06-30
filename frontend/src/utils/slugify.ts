import { mockProducts } from '@/constants/mockData';
import { ProductType } from '@/types';

/**
 * Converts a string into a clean, URL-friendly slug.
 * Example: "Organic Red Tomatoes" -> "organic-red-tomatoes"
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
};

/**
 * Finds a product in the mock database by its slugified name.
 */
export const getProductBySlug = (slug: string): ProductType | undefined => {
  return mockProducts.find((p) => slugify(p.name) === slug);
};
