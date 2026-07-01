"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Printer, Download, Sparkles, Loader2 } from "lucide-react";
import { mockProducts } from "@/constants/mockData";
import { formatPrice } from "@/utils/formatPrice";
import { toast } from "@/components/ui/Toast";

interface InvoiceItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

interface InvoiceData {
  id: string;
  invoiceNo: string;
  date: string;
  customerName: string;
  address: string;
  mobile: string;
  paymentMethod: string;
  paymentStatus: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
}

export default function OrderInvoicePage() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const params = useParams();
  const router = useRouter();
  const orderId = params?.orderId as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !orderId) return;

    // Try to load order from localStorage
    const storedOrders = localStorage.getItem("user_orders");
    let foundInvoice: InvoiceData | null = null;

    if (storedOrders) {
      const ordersList = JSON.parse(storedOrders);
      const order = ordersList.find((o: any) => o.id === orderId || o.id === `#${orderId}` || `#${o.id}` === orderId);
      
      if (order) {
        // Calculate subtotal, tax, discount
        const calculatedItems = order.items.map((item: any) => {
          const prod = mockProducts.find(p => p.id === item.productId);
          return {
            productId: item.productId,
            name: prod?.name || item.name || "Organic Product",
            price: item.price,
            quantity: item.quantity,
            unit: prod?.unit || "1kg"
          };
        });

        const subtotal = calculatedItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
        // Tax is roughly 5% GST included or extra
        const tax = Math.round(subtotal * 0.05);
        const discount = order.discountAmount || 0;
        const deliveryFee = subtotal > 500 ? 0 : 40;
        const total = order.total;

        foundInvoice = {
          id: order.id,
          invoiceNo: `INV-${order.id.slice(-6).toUpperCase()}`,
          date: order.date || "12 Jan 2025",
          customerName: order.shippingAddress?.name || "Customer Name",
          address: order.shippingAddress 
            ? `${order.shippingAddress.street || ""}, ${order.shippingAddress.city || ""}, ${order.shippingAddress.state || ""} - ${order.shippingAddress.pincode || ""}`
            : "123 Anna Nagar, Chennai - 600040",
          mobile: order.shippingAddress?.mobile || order.mobile || "9876543210",
          paymentMethod: order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment (UPI/Card)",
          paymentStatus: order.paymentStatus === "paid" ? "PAID" : "PENDING",
          items: calculatedItems,
          subtotal,
          discount,
          deliveryFee,
          tax,
          total
        };
      }
    }

    // Fallback Mock Order if not found in user_orders
    if (!foundInvoice) {
      const items = [
        { productId: "p1", name: "Organic Red Rice", price: 299, quantity: 2, unit: "1kg" },
        { productId: "p2", name: "Cold Pressed Coconut Oil", price: 399, quantity: 1, unit: "500ml" }
      ];
      const subtotal = 997;
      const discount = 100;
      const deliveryFee = 0; // FREE
      const tax = 44; // 5% GST
      const total = 941;

      foundInvoice = {
        id: orderId || "ORD-2025-00123",
        invoiceNo: `INV-${(orderId || "00123").replace("#", "").slice(-5).toUpperCase()}`,
        date: "12 Jan 2025",
        customerName: "John Doe",
        address: "123 Anna Nagar, Chennai, Tamil Nadu - 600040",
        mobile: "9876543210",
        paymentMethod: "Online UPI Payment",
        paymentStatus: "PAID",
        items,
        subtotal,
        discount,
        deliveryFee,
        tax,
        total
      };
    }

    setInvoice(foundInvoice);
    setLoading(false);
  }, [orderId]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleDownloadPDF = () => {
    if (typeof window !== "undefined") {
      toast.info(
        currentLang === "ta"
          ? "PDF ஆகச் சேமிக்க 'Save to PDF' என்ற கூரியர் அச்சு வழியைப் பயன்படுத்தவும்."
          : "Please choose 'Save as PDF' option in the print dialog to download this invoice."
      );
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto" />
          <p className="text-xs font-bold text-neutral-450 uppercase tracking-widest">
            {t("shop.checking", "Generating Invoice...")}
          </p>
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 py-8 sm:py-12 transition-colors duration-normal">
      {/* Global CSS to handle A4 page styling during printing */}
      <style jsx global>{`
        @media print {
          /* Hide headers, footers, breadcrumbs, chat bubbles, buttons, etc. */
          header, footer, nav, button, .no-print, [role="banner"], [role="contentinfo"], .floating-whatsapp, .back-to-top {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
            font-size: 12px !important;
          }
          .print-page-wrapper {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .print-border-table th, .print-border-table td {
            border-color: #000000 !important;
          }
        }
        @page {
          size: A4;
          margin: 1.5cm;
        }
      `}</style>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Actions Controls (hidden on print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 no-print">
          <Link
            href={`/account/orders/${invoice.id.replace("#", "")}`}
            className="text-xs font-bold text-neutral-500 hover:text-primary-500 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("invoice.back_to_order", "Back to Order")}
          </Link>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 border border-neutral-300 dark:border-neutral-750 bg-white dark:bg-neutral-900 text-xs font-bold text-neutral-700 dark:text-neutral-300 rounded-card hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4 text-primary-500" />
              <span>{t("invoice.print", "Print Invoice")}</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-xs font-bold text-white rounded-card cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>{t("invoice.download_pdf", "Download PDF")}</span>
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Container */}
        <div className="print-page-wrapper bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-feature p-8 sm:p-12 shadow-sm text-neutral-800 dark:text-neutral-200 font-sans">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-neutral-200 dark:border-neutral-800 pb-8">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold font-heading tracking-wide text-primary-700 dark:text-primary-400">
                  Aether Organic<span className="text-secondary-400">.</span>
                </span>
                <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-500/5 px-2 py-0.5 rounded border border-primary-500/10 uppercase tracking-widest">
                  Organic & Fresh
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                Plot No. 42, Green Farms Road,<br />
                Alwarpet, Chennai, Tamil Nadu - 600018<br />
                Phone: +91 98765 43210 | Email: support@aetherorganic.com<br />
                <span className="font-bold text-neutral-700 dark:text-neutral-300">GSTIN: 33AAAAA1111A1Z1</span>
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1 sm:self-stretch flex flex-col justify-between">
              <h1 className="text-2.5xl font-black font-heading tracking-tight text-neutral-900 dark:text-white">
                TAX INVOICE
              </h1>
              <div className="text-xs text-neutral-505 dark:text-neutral-400 font-semibold space-y-1 mt-3">
                <p>Invoice No: <span className="font-bold text-neutral-900 dark:text-white">{invoice.invoiceNo}</span></p>
                <p>Date: <span className="font-bold text-neutral-900 dark:text-white">{invoice.date}</span></p>
                <p>Order Reference: <span className="font-bold text-neutral-900 dark:text-white">{invoice.id}</span></p>
              </div>
            </div>
          </div>

          {/* Bill To Block */}
          <div className="my-8 space-y-2">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              BILL TO:
            </h3>
            <div className="text-xs font-bold text-neutral-900 dark:text-white">
              {invoice.customerName}
            </div>
            <p className="text-xs text-neutral-505 dark:text-neutral-400 leading-relaxed max-w-sm">
              {invoice.address}
            </p>
            <p className="text-xs text-neutral-500 font-semibold pt-1">
              Mobile: {invoice.mobile}
            </p>
          </div>

          {/* Invoice Items Table */}
          <div className="overflow-x-auto my-8">
            <table className="w-full text-left border-collapse print-border-table">
              <thead>
                <tr className="border-b-2 border-neutral-200 dark:border-neutral-750 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="py-3 px-2 w-10">#</th>
                  <th className="py-3 px-4">{t("invoice.product_name", "Product Name")}</th>
                  <th className="py-3 px-4 w-20">{t("invoice.uom", "UoM")}</th>
                  <th className="py-3 px-4 w-20 text-center">{t("invoice.qty", "Qty")}</th>
                  <th className="py-3 px-4 w-24 text-right">{t("invoice.rate", "Rate")}</th>
                  <th className="py-3 px-4 w-28 text-right">{t("invoice.amount", "Amount")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                {invoice.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-2">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white">{item.name}</td>
                    <td className="py-3 px-4 text-neutral-500">{item.unit}</td>
                    <td className="py-3 px-4 text-center">{item.quantity}</td>
                    <td className="py-3 px-4 text-right">₹{item.price}</td>
                    <td className="py-3 px-4 text-right font-bold text-neutral-900 dark:text-white">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary and Payment row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
            
            {/* Left side: Payment Info */}
            <div className="space-y-4">
              <div className="text-xs space-y-1.5">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Payment Details
                </span>
                <p className="font-semibold text-neutral-705 dark:text-neutral-400">
                  Payment Method: <span className="font-bold text-neutral-900 dark:text-white">{invoice.paymentMethod}</span>
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-705 dark:text-neutral-400">Payment Status:</span>
                  <span className="px-2.5 py-0.5 rounded bg-green-500/10 text-green-600 border border-green-500/20 text-[10px] font-bold tracking-wider">
                    {invoice.paymentStatus} ✅
                  </span>
                </div>
              </div>

              {/* Terms */}
              <div className="text-[10px] text-neutral-500 dark:text-neutral-450 space-y-1.5 leading-relaxed bg-neutral-50 dark:bg-neutral-950 p-4 rounded-card border border-neutral-100 dark:border-neutral-850">
                <h4 className="font-bold text-neutral-750 dark:text-neutral-300 uppercase tracking-wider">Terms & Conditions</h4>
                <p>&bull; This is a computer-generated tax invoice. No signature is required.</p>
                <p>&bull; All organic products are non-returnable unless damaged upon arrival.</p>
                <p>&bull; For customer support, reach out to support@aetherorganic.com or call +91-98765-43210.</p>
              </div>
            </div>

            {/* Right side: Calculations */}
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-2.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-neutral-900 dark:text-white font-bold">₹{invoice.subtotal}</span>
                </div>
                
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Discount</span>
                    <span className="font-bold">-₹{invoice.discount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Tax (Included GST 5%)</span>
                  <span className="text-neutral-900 dark:text-white font-bold">₹{invoice.tax}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="text-neutral-900 dark:text-white font-bold">
                    {invoice.deliveryFee === 0 ? "FREE" : `₹${invoice.deliveryFee}`}
                  </span>
                </div>

                <div className="flex justify-between text-base font-black text-neutral-900 dark:text-white pt-2.5 border-t border-neutral-200 dark:border-neutral-850">
                  <span>Grand Total</span>
                  <span className="text-primary-700 dark:text-primary-400 text-lg">₹{invoice.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Thank You */}
          <div className="text-center mt-12 pt-8 border-t border-neutral-150 dark:border-neutral-800">
            <p className="text-sm font-bold text-primary-600 dark:text-primary-400 flex items-center justify-center gap-1.5 font-heading">
              <Sparkles className="w-4.5 h-4.5 text-secondary-400" />
              Thank you for supporting organic agriculture! 🌿
            </p>
            <p className="text-[10px] text-neutral-400 mt-1">
              Visit again at www.aetherorganic.com
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
