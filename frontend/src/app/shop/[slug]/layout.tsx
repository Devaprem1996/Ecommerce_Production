import type { Metadata, ResolvingMetadata } from 'next';
import { mockProducts } from '@/constants/mockData';
import { slugify } from '@/utils/slugify';

type Props = {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yathuarokiyagam.com';

  try {
    const res = await fetch(`${apiUrl}/cms/products/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const json = await res.json();
      const product = json?.data?.product || json?.data;
      if (product) {
        const title = product.nameTamil
          ? `${product.name} (${product.nameTamil})`
          : product.name;
        const description =
          product.shortDescription ||
          (product.description ? product.description.slice(0, 160) : '') ||
          `Buy authentic ${product.name} from Yathu Arokiyagam. 100% pure, natural, and preservative-free traditional foods.`;
        
        const primaryImage =
          product.images?.[0]?.imageUrl ||
          product.images?.[0]?.url ||
          product.image ||
          '/images/hero-traditional.jpg';

        return {
          title,
          description,
          openGraph: {
            title: `${title} | Yathu Arokiyagam`,
            description,
            url: `${siteUrl}/shop/${slug}`,
            siteName: 'Yathu Arokiyagam',
            images: [
              {
                url: primaryImage,
                width: 800,
                height: 800,
                alt: product.name,
              },
            ],
            type: 'website',
          },
          twitter: {
            card: 'summary_large_image',
            title: `${title} | Yathu Arokiyagam`,
            description,
            images: [primaryImage],
          },
          alternates: {
            canonical: `${siteUrl}/shop/${slug}`,
          },
        };
      }
    }
  } catch (error) {
    // API offline during static evaluation, fallback to mock data
  }

  // Fallback to local catalog if database item not resolved
  const fallback = mockProducts.find(
    (p) => p.slug === slug || slugify(p.name) === slug
  );

  if (fallback) {
    const title = fallback.nameTamil
      ? `${fallback.name} (${fallback.nameTamil})`
      : fallback.name;
    const description =
      fallback.description?.slice(0, 160) ||
      `Buy authentic ${fallback.name} from Yathu Arokiyagam.`;

    const fallbackImage =
      fallback.images?.[0] || '/images/hero-traditional.jpg';

    return {
      title,
      description,
      openGraph: {
        title: `${title} | Yathu Arokiyagam`,
        description,
        url: `${siteUrl}/shop/${slug}`,
        siteName: 'Yathu Arokiyagam',
        images: [{ url: fallbackImage, width: 800, height: 800, alt: fallback.name }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | Yathu Arokiyagam`,
        description,
        images: [fallbackImage],
      },
      alternates: {
        canonical: `${siteUrl}/shop/${slug}`,
      },
    };
  }

  return {
    title: 'Product Details | Yathu Arokiyagam',
    description: 'Explore authentic, traditional, and chemical-free products at Yathu Arokiyagam.',
  };
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
