import type { MetadataRoute } from 'next';
import { mockProducts, mockCategories } from '@/constants/mockData';
import { slugify } from '@/utils/slugify';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yathuarokiyagam.com';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

  // 1. Static informational and policy pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-conditions`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/shipping-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/return-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // 2. Fetch live products or fallback to mock catalog
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${apiUrl}/cms/products?limit=200`, {
      next: { revalidate: 3600 },
      cache: 'force-cache',
    });

    if (res.ok) {
      const data = await res.json();
      const products = data.data || [];
      if (Array.isArray(products) && products.length > 0) {
        productEntries = products.map((p: any) => ({
          url: `${baseUrl}/shop/${p.slug || slugify(p.name)}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }));
      }
    }
  } catch (err) {
    // If backend is offline during build time, gracefully fallback to mock catalog
    console.warn('Sitemap builder: API offline, falling back to mock catalog.');
  }

  // Fallback if API returned empty or errored
  if (productEntries.length === 0) {
    productEntries = mockProducts.map((p) => ({
      url: `${baseUrl}/shop/${p.slug || slugify(p.name)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  }

  // 3. Category search filter routes
  const categoryEntries: MetadataRoute.Sitemap = mockCategories.map((c) => ({
    url: `${baseUrl}/shop?category=${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryEntries, ...productEntries];
}
