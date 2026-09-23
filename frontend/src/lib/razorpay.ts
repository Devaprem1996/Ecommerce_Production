/**
 * Razorpay Standard Web Checkout Dynamic Script Loader
 * Loads checkout.js from Razorpay CDN without self-hosting or bundling
 */

declare global {
  interface Window {
    Razorpay?: any;
  }
}

let scriptLoadingPromise: Promise<boolean> | null = null;

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise((resolve) => {
    // Check if script tag already exists in the document
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      if (window.Razorpay) {
        resolve(true);
      } else {
        existingScript.addEventListener("load", () => resolve(true));
        existingScript.addEventListener("error", () => resolve(false));
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      console.error("Failed to load Razorpay checkout.js script from CDN.");
      resolve(false);
    };

    document.body.appendChild(script);
  });

  return scriptLoadingPromise;
}

export interface RazorpayOrderData {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}

export interface RazorpayCheckoutOptions {
  orderData: RazorpayOrderData;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  themeColor?: string;
  onSuccess: (paymentResult: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void | Promise<void>;
  onDismiss?: () => void;
  onFailure?: (error: { description: string; code?: string }) => void;
}

/**
 * Opens Razorpay Standard Checkout modal with complete event handling
 */
export async function openRazorpayCheckout(
  options: RazorpayCheckoutOptions
): Promise<void> {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    throw new Error(
      "Unable to load Razorpay payment gateway. Please check your internet connection."
    );
  }

  const { orderData, name, description, prefill, notes, themeColor } = options;

  const rzpOptions = {
    key: orderData.key_id,
    order_id: orderData.order_id,
    amount: orderData.amount,
    currency: orderData.currency,
    name: name || "Yathu Arokiyagam",
    description: description || "Order Payment",
    image: "/images/logo.png",
    prefill: {
      name: prefill?.name || "",
      email: prefill?.email || "",
      contact: prefill?.contact || "",
    },
    notes: {
      ...notes,
      order_id: orderData.order_id,
    },
    theme: {
      color: themeColor || "#16a34a",
    },
    handler: function (response: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) {
      // Payment authorized in modal -> caller must post to /api/verify-payment
      options.onSuccess(response);
    },
    modal: {
      ondismiss: function () {
        // Customer dismissed/closed modal: treat as cancelled, not error
        if (options.onDismiss) {
          options.onDismiss();
        }
      },
    },
  };

  const rzp = new window.Razorpay(rzpOptions);

  // Failure event: customer can retry, never call verify on failure
  rzp.on("payment.failed", function (response: any) {
    const errorDesc =
      response?.error?.description ||
      response?.error?.reason ||
      "Payment failed. Please try again.";
    if (options.onFailure) {
      options.onFailure({
        description: errorDesc,
        code: response?.error?.code,
      });
    }
  });

  rzp.open();
}
