"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ChevronRight, Printer, AlertTriangle, Scale, ShieldCheck, HeartHandshake } from "lucide-react";

export default function TermsConditionsPage() {
  const { t } = useTranslation();

  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "use", title: "2. Use of Website" },
    { id: "account", title: "3. Account & Registration" },
    { id: "products", title: "4. Products & Pricing" },
    { id: "orders", title: "5. Orders & Payment" },
    { id: "delivery", title: "6. Delivery Policy" },
    { id: "returns", title: "7. Returns & Refunds" },
    { id: "intellectual", title: "8. Intellectual Property" },
    { id: "privacy", title: "9. Privacy & Data" },
    { id: "liability", title: "10. Limitation of Liability" },
    { id: "governing", title: "11. Governing Law" },
    { id: "contact", title: "12. Contact Us" }
  ];

  const handleScrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans pb-16 transition-colors duration-normal">
      
      {/* Global Print Styling */}
      <style jsx global>{`
        @media print {
          header, footer, nav, button, .no-print, [role="banner"], [role="contentinfo"] {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
            font-size: 12px !important;
          }
          .print-container {
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* Breadcrumbs */}
      <div className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-3 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-650 dark:text-neutral-400 uppercase tracking-wider">
            <Link href="/" className="hover:text-primary-500 transition-colors">
              {t("shop.breadcrumb_home", "Home")}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary-500 select-none">
              Terms & Conditions
            </span>
          </nav>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-neutral-905 dark:text-white tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-widest select-none">
            Last Updated: January 2026
          </p>
          <p className="text-xs sm:text-sm font-semibold text-neutral-500 dark:text-neutral-450 max-w-xl mx-auto">
            Please read these terms and conditions carefully before using our services or purchasing fresh organic products.
          </p>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-neutral-300 dark:border-neutral-750 bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-750 dark:text-neutral-300 rounded-card hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer shadow-sm no-print"
          >
            <Printer className="w-4 h-4 text-primary-500" />
            <span>Print Terms</span>
          </button>
        </div>
      </div>

      {/* Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 print-container">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation (Desktop) */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-24 self-start bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 rounded-feature shadow-sm no-print">
            <h3 className="text-xs font-bold text-neutral-950 dark:text-white uppercase tracking-wider border-b border-neutral-50 dark:border-neutral-805 pb-3.5 mb-4">
              Sections
            </h3>
            <ul className="space-y-3">
              {sections.map((sec) => (
                <li key={sec.id}>
                  <a
                    href={`#${sec.id}`}
                    onClick={(e) => handleScrollTo(e, sec.id)}
                    className="text-xs font-bold text-neutral-550 dark:text-neutral-400 hover:text-primary-500 transition-colors block leading-tight py-0.5"
                  >
                    {sec.title}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          {/* Policy Text Column */}
          <main className="col-span-1 lg:col-span-3 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 sm:p-10 shadow-sm space-y-8 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 font-medium">
            
            {/* Callout box for important terms */}
            <div className="p-5 bg-amber-500/5 border border-amber-500/15 rounded-card flex gap-4 text-xs leading-relaxed text-neutral-805 dark:text-neutral-400">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider text-[10px] select-none">
                  ⚠️ Important Notice
                </p>
                <p className="mt-1">
                  By accessing this website, creating an account, or placing an order, you agree to comply with and be bound by these terms and conditions, including our Privacy Policy and Shipping & Return Policies.
                </p>
              </div>
            </div>

            <section id="acceptance" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                <Scale className="w-4.5 h-4.5 text-primary-500" />
                1. Acceptance of Terms
              </h2>
              <p>
                These terms constitute a legally binding agreement between you ("Customer", "User", or "You") and Aether Organic. If you do not agree to these terms, please do not access or use our services.
              </p>
            </section>

            <section id="use" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                2. Use of Website
              </h2>
              <p>
                You may use our platform solely for personal, non-commercial purposes. You represent that you are at least 18 years of age or accessing the site under the supervision of a parent or legal guardian.
              </p>
            </section>

            <section id="account" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                3. Account & Registration
              </h2>
              <p>
                To place orders, you may register or check out as a guest. You are responsible for keeping your login credentials confidential and for all actions occurring under your account. Notify us immediately of unauthorized account access.
              </p>
            </section>

            <section id="products" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                4. Products & Pricing
              </h2>
              <p>
                We strive for absolute accuracy in organic products, specifications, and prices. However, item weights may vary slightly due to their fresh, organic, or unpackaged nature. We reserve the right to modify prices and quantities without prior notice.
              </p>
            </section>

            <section id="orders" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                5. Orders & Payment
              </h2>
              <p>
                All orders are subject to acceptance and availability. Payments can be processed via secure credit/debit cards, UPI channels, Net Banking, or Cash on Delivery. Order completion is confirmed only after successful payment authorization.
              </p>
            </section>

            <section id="delivery" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                6. Delivery Policy
              </h2>
              <p>
                We deliver fresh farm items directly to your address within defined pincode delivery zones. For delivery zones, times, and fees, please check our dedicated <Link href="/shipping-policy" className="text-primary-500 font-bold hover:underline">Shipping Policy</Link>.
              </p>
            </section>

            <section id="returns" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                7. Returns & Refunds
              </h2>
              <p>
                Eligible fresh organic products can be returned or refunded within 7 days of delivery. Refer to our detailed <Link href="/return-policy" className="text-primary-500 font-bold hover:underline">Return & Refund Policy</Link> for step-by-step processes.
              </p>
            </section>

            <section id="intellectual" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                8. Intellectual Property
              </h2>
              <p>
                All graphics, brand logo designs, text content, database schemas, and custom code on this site are the intellectual property of Aether Organic, protected by copyright and international intellectual property laws.
              </p>
            </section>

            <section id="privacy" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                9. Privacy & Data
              </h2>
              <p>
                Your privacy is paramount. Please review our <Link href="/privacy-policy" className="text-primary-500 font-bold hover:underline">Privacy Policy</Link> to understand how we process, store, and safeguard your personal details.
              </p>
            </section>

            <section id="liability" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                10. Limitation of Liability
              </h2>
              <p>
                Aether Organic is not liable for any indirect, incidental, or consequential damages arising from your use of the website or consumption of products, to the maximum extent permitted by applicable laws.
              </p>
            </section>

            <section id="governing" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                11. Governing Law
              </h2>
              <p>
                These terms are governed and construed in accordance with the laws of India. Any disputes arising out of these terms shall be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu.
              </p>
            </section>

            <section id="contact" className="space-y-3 scroll-mt-24 border-t border-neutral-100 dark:border-neutral-800 pt-8">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white pb-2 flex items-center gap-2">
                <HeartHandshake className="w-4.5 h-4.5 text-primary-500" />
                12. Contact Us
              </h2>
              <p>
                If you have questions, feedback, or concerns regarding these Terms, contact us:
              </p>
              <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-card border border-neutral-150 dark:border-neutral-850 text-xs space-y-1">
                <p>Legal Counsel Email: <span className="font-bold text-primary-500">legal@aetherorganic.com</span></p>
                <p>Support Hotline: +91-98765-43210</p>
              </div>
            </section>

          </main>
        </div>
      </div>

    </div>
  );
}
