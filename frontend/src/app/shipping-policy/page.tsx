"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { 
  ChevronRight, 
  Printer, 
  MapPin, 
  Clock, 
  Truck, 
  AlertOctagon, 
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ShippingPolicyPage() {
  const { t } = useTranslation();

  const sections = [
    { id: "zones", title: "1. Delivery Zones & Pincode Checker" },
    { id: "timeframes", title: "2. Delivery Timeframes" },
    { id: "charges", title: "3. Delivery Charges" },
    { id: "processing", title: "4. Order Processing Time" },
    { id: "tracking", title: "5. Tracking Your Order" },
    { id: "attempts", title: "6. Delivery Attempts" },
    { id: "damaged", title: "7. Damaged in Transit" },
    { id: "special", title: "8. Special Handling & Packaging" },
    { id: "faqs", title: "9. Shipping FAQs" }
  ];

  // Pincode Checker State
  const [pincode, setPincode] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<{ status: "success" | "error"; message: string } | null>(null);

  const handleScrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length !== 6 || isNaN(Number(pincode))) {
      setResult({ status: "error", message: "Please enter a valid 6-digit number." });
      return;
    }

    setChecking(true);
    setResult(null);

    setTimeout(() => {
      setChecking(false);
      if (pincode.startsWith("600")) {
        setResult({
          status: "success",
          message: "Express Delivery Available (2-3 Business Days) - Fulfilled by our Chennai Main Hub. Eligible for fresh greens!"
        });
      } else if (pincode.startsWith("6")) {
        setResult({
          status: "success",
          message: "Standard Delivery Available (3-5 Business Days) - Fulfilled by Tamil Nadu Regional Hub."
        });
      } else {
        setResult({
          status: "success",
          message: "Outstation Delivery Available (5-7 Business Days) - Handed over to BlueDart/Delhivery courier network."
        });
      }
    }, 800);
  };

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    { q: "Can I change my delivery address after placing an order?", a: "Yes, you can edit your address by contacting support within 1 hour of placing the order, before it reaches the packaging line." },
    { q: "Do you deliver fresh leafy greens outside Chennai?", a: "To maintain maximum freshness, leafy greens and fresh milk are limited to next-day delivery within Chennai city pincodes (600xxx)." },
    { q: "What happens if a product in my order goes out of stock?", a: "Our team will call you to offer a fresh alternative or issue an instant wallet refund for the item value before dispatching the remainder." }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans pb-16 transition-colors duration-normal">
      
      {/* Global Print Style */}
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
              Shipping Policy
            </span>
          </nav>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading text-neutral-905 dark:text-white tracking-tight">
            Shipping & Delivery Policy
          </h1>
          <p className="text-[10px] sm:text-xs font-bold text-neutral-450 uppercase tracking-widest select-none">
            Last Updated: January 2026
          </p>
          <p className="text-xs sm:text-sm font-semibold text-neutral-500 dark:text-neutral-455 max-w-xl mx-auto">
            Review delivery estimates, rates, processing windows, and check your specific address delivery availability.
          </p>

          <button
            onClick={() => window.print()}
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
            
            {/* 1. DELIVERY ZONES & PINCODE CHECKER */}
            <section id="zones" className="space-y-4 scroll-mt-24">
              <h2 className="text-lg font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-500" />
                1. Delivery Zones & Pincode Checker
              </h2>
              <p>
                We dispatch fresh organic products across most states in India. Some highly perishable items (like organic milk, fresh greens, and seasonal fruits) are limited to local regional zones to guarantee maximum quality.
              </p>
              
              {/* Interactive Pincode Checker Card */}
              <div className="bg-neutral-50 dark:bg-neutral-950 p-5 rounded-feature border border-neutral-150 dark:border-neutral-850 space-y-4 no-print max-w-md">
                <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider select-none">
                  Check Delivery Serviceability
                </h4>
                <form onSubmit={handleCheckPincode} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter 6-digit Pincode"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    className="flex-1 text-xs font-semibold px-3 py-2 border border-neutral-250 dark:border-neutral-750 bg-white dark:bg-neutral-900 rounded-card text-neutral-900 dark:text-white focus:outline-none focus:border-primary-500"
                  />
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={checking}
                    className="font-bold text-xs py-2"
                  >
                    {checking ? "Checking..." : "Verify"}
                  </Button>
                </form>

                {result && (
                  <div className={`p-3 rounded-card text-xs font-semibold flex gap-2 leading-relaxed border ${
                    result.status === "success" 
                      ? "bg-green-500/5 border-green-200 text-green-700 dark:text-green-400" 
                      : "bg-red-50 dark:bg-red-950/20 border-red-200 text-red-700 dark:text-red-400"
                  }`}>
                    {result.status === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-550 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <span>{result.message}</span>
                  </div>
                )}
              </div>
            </section>

            {/* 2. DELIVERY TIMEFRAMES */}
            <section id="timeframes" className="space-y-4 scroll-mt-24">
              <h2 className="text-lg font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                2. Delivery Timeframes
              </h2>
              <p>
                Our estimated shipping times vary according to delivery destination:
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs border border-neutral-200 dark:border-neutral-800">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-950 text-neutral-450 uppercase font-bold tracking-wider border-b border-neutral-200 dark:border-neutral-800">
                      <th className="py-2.5 px-4">Destination Zone</th>
                      <th className="py-2.5 px-4">Estimated Delivery Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-semibold text-neutral-700 dark:text-neutral-300">
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-neutral-900 dark:text-white">Chennai Metro Cities</td>
                      <td className="py-2.5 px-4">2 - 3 Business Days</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-neutral-900 dark:text-white">Tamil Nadu Tier-2 Cities</td>
                      <td className="py-2.5 px-4">3 - 5 Business Days</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-neutral-900 dark:text-white">Regional Rural Districts</td>
                      <td className="py-2.5 px-4">5 - 7 Business Days</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-neutral-900 dark:text-white">Other Remote Locations</td>
                      <td className="py-2.5 px-4">7 - 10 Business Days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 3. DELIVERY CHARGES */}
            <section id="charges" className="space-y-4 scroll-mt-24">
              <h2 className="text-lg font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary-500" />
                3. Delivery Charges
              </h2>
              <p>
                Shipping costs are calculated based on the total order value:
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs border border-neutral-200 dark:border-neutral-800">
                  <thead>
                    <tr className="bg-neutral-50 dark:bg-neutral-950 text-neutral-450 uppercase font-bold tracking-wider border-b border-neutral-200 dark:border-neutral-800">
                      <th className="py-2.5 px-4">Order Value threshold</th>
                      <th className="py-2.5 px-4">Shipping Rates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-semibold text-neutral-700 dark:text-neutral-300">
                    <tr>
                      <td className="py-2.5 px-4">Orders below ₹499</td>
                      <td className="py-2.5 px-4">₹49 Standard Fee</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-neutral-900 dark:text-white">Orders ₹499 and above</td>
                      <td className="py-2.5 px-4 text-green-550 font-bold uppercase tracking-wider">FREE Delivery</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4">Bulk Shipments (Exceeding 10kg)</td>
                      <td className="py-2.5 px-4">Custom rates (Connect with support)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 4. ORDER PROCESSING TIME */}
            <section id="processing" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2">
                4. Order Processing Time
              </h2>
              <p>
                All orders placed on our site undergo a brief preparation process:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
                <li><span className="font-bold">Before 2:00 PM (Mon-Sat):</span> Dispatched on the same day from our packing warehouse.</li>
                <li><span className="font-bold">After 2:00 PM:</span> Dispatched on the subsequent business day.</li>
                <li><span className="font-bold">Weekends & National Holidays:</span> Processed on the next working business day.</li>
              </ul>
            </section>

            {/* 5. TRACKING YOUR ORDER */}
            <section id="tracking" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2">
                5. Tracking Your Order
              </h2>
              <p>
                Upon parcel dispatch, you will receive an SMS containing a tracking link and courier code. You can also view shipping stages in real-time by visiting our <Link href="/track-order" className="text-primary-500 font-bold hover:underline">Track Order</Link> page. Our delivery associates include Professional Couriers, Delhivery, and BlueDart.
              </p>
            </section>

            {/* 6. DELIVERY ATTEMPTS */}
            <section id="attempts" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2">
                6. Delivery Attempts
              </h2>
              <p>
                Our courier partners make up to three attempts to deliver your package. If all attempts fail (due to incorrect addresses, locked houses, or unreachable contacts), the package returns to our warehouse. Re-delivery requests in these cases will incur an additional shipping fee.
              </p>
            </section>

            {/* 7. DAMAGED IN TRANSIT */}
            <section id="damaged" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2 flex items-center gap-2">
                <AlertOctagon className="w-4.5 h-4.5 text-red-500" />
                7. Damaged in Transit
              </h2>
              <p>
                If your parcel arrives with physical package damages or seals broken, please document it by taking photos instantly. Reach out to our customer care team within 24 hours of delivery. We will initiate a priority pickup and send a replacement immediately at no extra charge.
              </p>
            </section>

            {/* 8. SPECIAL HANDLING & PACKAGING */}
            <section id="special" className="space-y-3 scroll-mt-24">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-2">
                8. Special Handling & Packaging
              </h2>
              <p>
                Freshness is our trademark. Organic groceries receive special handling rules during packaging:
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
                <li><span className="font-bold">Perishables:</span> Dispatched in insulated packs with cold gel inserts.</li>
                <li><span className="font-bold">Glass Bottles (Oils/Ghee):</span> Secured in double-layered honeycomb eco-wraps.</li>
                <li><span className="font-bold">Eco-friendly:</span> We use biodegradable cotton carry bags and zero single-use plastic.</li>
              </ul>
            </section>

            {/* 9. SHIPPING FAQS */}
            <section id="faqs" className="space-y-4 scroll-mt-24 border-t border-neutral-100 dark:border-neutral-800 pt-8 no-print">
              <h2 className="text-base font-bold font-heading text-neutral-905 dark:text-white pb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary-500" />
                9. Shipping FAQs
              </h2>
              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="border border-neutral-150 dark:border-neutral-850 rounded-card overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full text-left font-bold text-xs p-4 bg-neutral-50 dark:bg-neutral-950 flex justify-between items-center text-neutral-900 dark:text-white hover:text-primary-500 transition-colors border-none cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${openFaq === idx ? "rotate-90 text-primary-500" : "text-neutral-400"}`} />
                    </button>
                    {openFaq === idx && (
                      <div className="p-4 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400 border-t border-neutral-150 dark:border-neutral-850 bg-white dark:bg-neutral-900">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

          </main>
        </div>
      </div>

    </div>
  );
}
