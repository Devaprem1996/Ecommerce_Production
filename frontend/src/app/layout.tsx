import type { Metadata } from "next";
import { Inter, Playfair_Display, Noto_Sans_Tamil } from "next/font/google";
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


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const tamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-tamil",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Aether Organic | Pure & Lab Tested E-Commerce",
  description: "Premium organic products sourced directly from local farms. 100% certified organic and lab tested.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${tamil.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-50 dark:bg-neutral-905">
        <I18nProvider>
          <AnnouncementBar />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <MobileBottomNav />
          <WhatsAppFloat />
          <BackToTop />
          <MiniCart />
        </I18nProvider>

        <Toaster />
      </body>
    </html>
  );
}
