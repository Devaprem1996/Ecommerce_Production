import type { Metadata } from "next";
import { Inter, Playfair_Display, Noto_Sans_Tamil, Caveat } from "next/font/google";
import "./globals.css";

import { Toaster } from "@/components/ui/Toast";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { BackToTop } from "@/components/layout/BackToTop";
import { I18nProvider } from "@/components/layout/I18nProvider";
import { MiniCart } from "@/components/layout/MiniCart";
import { SmoothScrollProvider } from "@/providers/SmoothScrollProvider";
import { AuthSessionSync } from "@/components/auth/AuthSessionSync";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-script",
  weight: ["400", "600", "700"],
});

const tamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-tamil",
  weight: ["400", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://yathuarokiyagam.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Yathu Arokiyagam | Pure, Traditional & Healthy Organic Foods",
    template: "%s | Yathu Arokiyagam",
  },
  description:
    "A dedicated store for those who choose a healthy lifestyle. Honest, unadulterated, preservative-free traditional foods, wood-pressed oils, and indigenous staples.",
  keywords: [
    "Yathu Arokiyagam",
    "யாத்து ஆரோக்கியகம்",
    "organic food online",
    "cold pressed oils",
    "wood pressed oil",
    "pure cow ghee",
    "traditional millets",
    "preservative free",
    "tamil nadu organic store",
  ],
  authors: [{ name: "Yathu Arokiyagam", url: siteUrl }],
  creator: "Yathu Arokiyagam",
  publisher: "Yathu Arokiyagam",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: "ta_IN",
    url: siteUrl,
    siteName: "Yathu Arokiyagam",
    title: "Yathu Arokiyagam | Pure, Traditional & Healthy Organic Foods",
    description:
      "A dedicated store for those who choose a healthy lifestyle. Honest, unadulterated, preservative-free traditional food.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yathu Arokiyagam | Pure Traditional Organic Foods",
    description:
      "Honest, unadulterated, preservative-free traditional food for a healthy lifestyle.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Yathu Arokiyagam",
        alternateName: "யாத்து ஆரோக்கியகம்",
        url: siteUrl,
        logo: `${siteUrl}/favicon.ico`,
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+91-8870159766",
          contactType: "customer service",
          areaServed: "IN",
          availableLanguage: ["en", "ta"],
        },
        sameAs: [
          "https://instagram.com/yathuarokiyagam",
          "https://facebook.com/yathuarokiyagam",
          "https://twitter.com/yathuarokiyagam",
          "https://youtube.com/yathuarokiyagam",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Yathu Arokiyagam",
        description:
          "A dedicated store for those who choose a healthy lifestyle. Honest, unadulterated, preservative-free traditional food.",
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/shop?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${caveat.variable} ${tamil.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-neutral-50 dark:bg-neutral-905">
        <SmoothScrollProvider>
          <I18nProvider>
            <AuthSessionSync />
            <AnnouncementBar />
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <MobileBottomNav />
            <WhatsAppFloat />
            <BackToTop />
            <MiniCart />
          </I18nProvider>
        </SmoothScrollProvider>

        <Toaster />
      </body>
    </html>
  );
}
