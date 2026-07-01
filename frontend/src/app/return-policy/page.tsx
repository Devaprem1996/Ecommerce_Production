"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ChevronRight, ArrowRight, ShieldCheck, RefreshCw, Truck, HeartHandshake, X } from "lucide-react";

export default function ReturnPolicyPage() {
  const { t } = useTranslation();

  const sections = [
    { id: "window", title: t("return_policy.sec_window_title", "1. Return Window") },
    { id: "eligible", title: t("return_policy.sec_eligible_title", "2. What Can Be Returned") },
    { id: "ineligible", title: t("return_policy.sec_ineligible_title", "3. What Cannot Be Returned") },
    { id: "timeline", title: t("return_policy.sec_timeline_title", "4. Refund Timeline") },
    { id: "process", title: t("return_policy.sec_process_title", "5. Step-by-Step Return Process") },
    { id: "contact", title: t("return_policy.sec_contact_title", "6. Contact & Support") },
  ];

  const handleScrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90; // offset navbar
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans pb-16 transition-colors duration-normal">
      
      {/* Breadcrumbs */}
      <div className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            <Link href="/" className="hover:text-primary-500 transition-colors">
              {t("shop.breadcrumb_home", "Home")}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary-500 select-none">
              {t("return_policy.title", "Return & Refund Policy")}
            </span>
          </nav>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-12 text-center">
        <div className="max-w-3xl mx-auto px-4 space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-neutral-905 dark:text-white tracking-tight">
            {t("return_policy.title", "Return & Refund Policy")}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-neutral-500 dark:text-neutral-450 max-w-lg mx-auto">
            {t("return_policy.subtitle", "Our commitment to freshness. Read about our easy return processes and refund conditions.")}
          </p>
        </div>
      </div>

      {/* Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation (Desktop) */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-24 self-start bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 rounded-feature shadow-sm">
            <h3 className="text-xs font-bold text-neutral-950 dark:text-white uppercase tracking-wider border-b border-neutral-50 dark:border-neutral-805 pb-3.5 mb-4">
              {t("policies.table_contents", "Table of Contents")}
            </h3>
            <ul className="space-y-3">
              {sections.map((sec) => (
                <li key={sec.id}>
                  <a
                    href={`#${sec.id}`}
                    onClick={(e) => handleScrollTo(e, sec.id)}
                    className="text-xs font-bold text-neutral-550 dark:text-neutral-400 hover:text-primary-500 transition-colors block leading-tight py-1"
                  >
                    {sec.title}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          {/* Policy Text Column */}
          <main className="col-span-1 lg:col-span-3 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-feature p-6 sm:p-10 shadow-sm space-y-8 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 font-medium">
            
            <section id="window" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-lg font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary-500" />
                {t("return_policy.sec_window_title", "1. Return Window")}
              </h2>
              <p>
                {t("return_policy.window_desc_1", "At Aether Organic, we strive to deliver the freshest products from our farms to your table. If you are not completely satisfied with your purchase, you may initiate a return or exchange request within")} <span className="font-bold text-primary-600 dark:text-primary-400">7 {t("return_policy.days", "days")}</span> {t("return_policy.window_desc_2", "of the delivery date.")}
              </p>
              <p>
                Requests initiated after 7 days will not be accepted. We kindly ask you to verify the condition and freshness of your organic grocery items upon arrival.
              </p>
            </section>

            <section id="eligible" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-lg font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                <RefreshCw className="w-4.5 h-4.5 text-primary-500" />
                {t("return_policy.sec_eligible_title", "2. What Can Be Returned")}
              </h2>
              <p>
                We accept returns for items that meet any of the following criteria:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
                <li><span className="font-bold">{t("return_policy.eligible_point_1_title", "Damaged Products:")}</span> {t("return_policy.eligible_point_1_desc", "Items damaged during transit.")}</li>
                <li><span className="font-bold">{t("return_policy.eligible_point_2_title", "Incorrect Item:")}</span> {t("return_policy.eligible_point_2_desc", "An item delivered does not match your invoice.")}</li>
                <li><span className="font-bold">{t("return_policy.eligible_point_3_title", "Quality Compromise:")}</span> {t("return_policy.eligible_point_3_desc", "Freshness or organic grade issues that do not meet standard expectations.")}</li>
                <li><span className="font-bold">{t("return_policy.eligible_point_4_title", "Shortage:")}</span> {t("return_policy.eligible_point_4_desc", "Items billed but missing from the package.")}</li>
              </ul>
            </section>

            <section id="ineligible" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-lg font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                <X className="w-5 h-5 text-red-500" />
                {t("return_policy.sec_ineligible_title", "3. What Cannot Be Returned")}
              </h2>
              <p>
                Due to food safety regulations and the perishable nature of fresh farm produce, we cannot accept returns for:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
                <li>Fresh produce (fruits and vegetables) that have been washed, peeled, or cut after delivery.</li>
                <li>Opened packets of grains, pulses, flours, oils, or spices, unless there is a physical contamination or quality issue.</li>
                <li>Products with broken seals, altered packaging, or missing tags that were delivered intact.</li>
                <li>Customized items or organic gift packages.</li>
              </ul>
            </section>

            <section id="timeline" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-lg font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                <RefreshCw className="w-4.5 h-4.5 text-primary-500" />
                {t("return_policy.sec_timeline_title", "4. Refund Timeline")}
              </h2>
              <p>
                Once your return is collected and inspected, your refund will be processed:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-xs">
                <li>
                  <span className="font-bold">Original Payment Method:</span> {t("return_policy.refund_original_desc", "Refund will be credited to your credit card, debit card, or UPI bank account within 3 to 5 business days.")}
                </li>
                <li>
                  <span className="font-bold">Store Credit:</span> {t("return_policy.refund_credit_desc", "Refund is issued instantly as Aether Wallet credit that can be applied to any future order.")}
                </li>
              </ul>
            </section>

            <section id="process" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-lg font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary-500" />
                {t("return_policy.sec_process_title", "5. Step-by-Step Return Process")}
              </h2>
              <div className="relative border-l border-neutral-100 dark:border-neutral-800 pl-6 space-y-6 mt-4">
                <div className="relative">
                  <div className="absolute -left-[30px] top-0.5 w-4 h-4 bg-primary-500 rounded-full border border-white dark:border-neutral-900" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-900 dark:text-white">Step 1: Submit Request</h4>
                  <p className="text-xs text-neutral-500 mt-1">Navigate to your Order Details, click 'Return Items', select which items to return, and upload photo proof.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[30px] top-0.5 w-4 h-4 bg-primary-500 rounded-full border border-white dark:border-neutral-900" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-900 dark:text-white">Step 2: Agent Review</h4>
                  <p className="text-xs text-neutral-500 mt-1">Our customer experience team will review the photos and approve your return within 24 hours.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[30px] top-0.5 w-4 h-4 bg-primary-500 rounded-full border border-white dark:border-neutral-900" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-900 dark:text-white">Step 3: Pickup Package</h4>
                  <p className="text-xs text-neutral-500 mt-1">Our delivery associate will pickup the item from your doorstep at zero additional cost.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[30px] top-0.5 w-4 h-4 bg-primary-500 rounded-full border border-white dark:border-neutral-900" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-900 dark:text-white">Step 4: Refund Settled</h4>
                  <p className="text-xs text-neutral-500 mt-1">Refund will be settled instantly to store credit or within 3-5 days to your bank account.</p>
                </div>
              </div>
            </section>

            <section id="contact" className="space-y-3.5 scroll-mt-24">
              <h2 className="text-lg font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-primary-500" />
                {t("return_policy.sec_contact_title", "6. Contact & Support")}
              </h2>
              <p>
                If you have any questions or require support regarding returns, please connect with us:
              </p>
              <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-card border border-neutral-100 dark:border-neutral-850 space-y-1 text-xs">
                <p>Email Support: <span className="font-bold text-primary-500">support@aetherorganic.com</span></p>
                <p>Customer Care: <span className="font-bold text-neutral-900 dark:text-white">+91-98765-43210</span> (9:00 AM to 6:00 PM, Mon-Sat)</p>
                <p>Chat Support: WhatsApp us using the live float icon on our homepage.</p>
              </div>
            </section>

          </main>
        </div>
      </div>

    </div>
  );
}
