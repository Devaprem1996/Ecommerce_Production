"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ChevronRight, Printer, ShieldCheck, Lock, EyeOff, Info } from "lucide-react";

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();

  const sections = [
    { id: "collect", title: "1. Information We Collect" },
    { id: "use", title: "2. How We Use Information" },
    { id: "share", title: "3. Information Sharing" },
    { id: "security", title: "4. Storage & Security" },
    { id: "cookies", title: "5. Cookies Policy" },
    { id: "rights", title: "6. Your Rights" },
    { id: "children", title: "7. Children's Privacy" },
    { id: "changes", title: "8. Policy Changes" },
    { id: "contact", title: "9. Contact Us" }
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
              Privacy Policy
            </span>
          </nav>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-neutral-905 dark:text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-[10px] sm:text-xs font-bold text-neutral-450 uppercase tracking-widest select-none">
            Last Updated: January 2026
          </p>
          <p className="text-xs sm:text-sm font-semibold text-neutral-500 dark:text-neutral-455 max-w-xl mx-auto">
            Your trust is our priority. Read how Aether Organic gathers, uses, stores, and protects your personal credentials.
          </p>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-neutral-300 dark:border-neutral-750 bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-750 dark:text-neutral-300 rounded-card hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer shadow-sm no-print"
          >
            <Printer className="w-4 h-4 text-primary-500" />
            <span>Print Policy</span>
          </button>
        </div>
      </div>

      {/* Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 print-container">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation (Desktop) */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-24 self-start bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 rounded-feature shadow-sm no-print">
            <h3 className="text-xs font-bold text-neutral-955 dark:text-white uppercase tracking-wider border-b border-neutral-50 dark:border-neutral-805 pb-3.5 mb-4">
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
            
            {/* Callout box */}
            <div className="p-5 bg-primary-500/5 border border-primary-500/10 rounded-card flex gap-4 text-xs leading-relaxed text-neutral-800 dark:text-neutral-400">
              <ShieldCheck className="w-6 h-6 text-primary-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-primary-650 dark:text-primary-400 uppercase tracking-wider text-[10px] select-none">
                  Privacy Protection Standard
                </p>
                <p className="mt-1">
                  We are committed to Indian IT Act, 2000, and global data confidentiality frameworks. We do not sell or trade your details to marketing agencies.
                </p>
              </div>
            </div>

            <section id="collect" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                <Lock className="w-4.5 h-4.5 text-primary-500" />
                1. Information We Collect
              </h2>
              <p>
                We collect personal information to provide farm-fresh organic grocery delivery services:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
                <li><span className="font-bold">Contact details:</span> Name, mobile number, email address, billing/shipping addresses.</li>
                <li><span className="font-bold">Order history:</span> Bought items, search history, order dates, promo code usages.</li>
                <li><span className="font-bold">Device details:</span> IP addresses, device model details, browser preferences.</li>
                <li><span className="font-bold">Payment logs:</span> Transaction confirmation reference (credit card tokens are handled directly by PCI-compliant gateways; we do not store raw card numbers).</li>
              </ul>
            </section>

            <section id="use" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                2. How We Use Information
              </h2>
              <p>
                Aether Organic processes your information for the following specific purposes:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
                <li>Processing transactions and delivering organic shipments.</li>
                <li>Sending transactional updates via SMS and email alerts.</li>
                <li>Providing customized search results and recommended products.</li>
                <li>Sending newsletter updates and deals (if you have opted-in).</li>
              </ul>
            </section>

            <section id="share" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                3. Information Sharing
              </h2>
              <p>
                We share details only with verified partners crucial to fulfilling orders:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
                <li><span className="font-bold">Payment Gateways:</span> Secure processors handling UPI/Card payment approvals.</li>
                <li><span className="font-bold">Delivery Associates:</span> Local couriers completing order parcel deliveries.</li>
              </ul>
              <p>
                We do not sell, rent, or distribute customer databases to third-party brokers.
              </p>
            </section>

            <section id="security" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                4. Storage & Security
              </h2>
              <p>
                All user accounts and payment sessions run on 256-bit SSL encryption. We house data on secure servers with restricted employee clearance levels to guard against leakages.
              </p>
            </section>

            <section id="cookies" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                5. Cookies Policy
              </h2>
              <p>
                We use operational cookies to remember active cart items, session logins, and language translations (English/Tamil). You may disable cookies through your browser settings, though some storefront functions might stop responding.
              </p>
            </section>

            <section id="rights" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                6. Your Rights
              </h2>
              <p>
                You retain complete control of your account details. You can request access, update incorrect details, delete your user account, or opt-out of notifications at any point.
              </p>
            </section>

            <section id="children" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                7. Children's Privacy
              </h2>
              <p>
                We do not intentionally collect details from minors under the age of 18. If a minor has supplied details without parental approval, notify us to delete the information.
              </p>
            </section>

            <section id="changes" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                8. Policy Changes
              </h2>
              <p>
                We may revise this policy periodically to reflect operational changes. Updated versions will be posted here, with notice flags shown on the dashboard for significant modifications.
              </p>
            </section>

            <section id="contact" className="space-y-3 scroll-mt-24 border-t border-neutral-100 dark:border-neutral-800 pt-8">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white pb-2 flex items-center gap-2">
                <EyeOff className="w-4.5 h-4.5 text-primary-500" />
                9. Contact Us
              </h2>
              <p>
                For questions on data privacy, cookie settings, or user rights, connect with our protection officer:
              </p>
              <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-card border border-neutral-150 dark:border-neutral-850 text-xs space-y-1">
                <p>Data Privacy Officer: <span className="font-bold text-primary-500">privacy@aetherorganic.com</span></p>
                <p>Hotline: +91-98765-43210</p>
              </div>
            </section>

          </main>
        </div>
      </div>

    </div>
  );
}
