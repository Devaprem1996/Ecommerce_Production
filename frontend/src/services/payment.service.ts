import { RazorpayOrderData } from "../lib/razorpay.js";

export interface CreateOrderResponse extends RazorpayOrderData {
  success: boolean;
  message?: string;
}

export interface VerifyPaymentPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  orderId?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  verified: boolean;
  order_id?: string;
  payment_id?: string;
}

class PaymentService {
  /**
   * Calls POST /api/create-order to create a Razorpay order
   */
  async createRazorpayOrder(params: {
    orderId?: string;
    amount?: number;
    currency?: string;
    notes?: Record<string, any>;
  }): Promise<CreateOrderResponse> {
    const res = await fetch("/api/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(
        data.message || data.error || `Failed to create payment order (${res.status})`
      );
    }

    return {
      success: true,
      order_id: data.order_id || data.data?.order_id,
      amount: data.amount || data.data?.amount,
      currency: data.currency || data.data?.currency || "INR",
      key_id: data.key_id || data.data?.key_id,
    };
  }

  /**
   * Calls POST /api/verify-payment to verify HMAC-SHA256 signature server-side
   */
  async verifyPaymentSignature(
    payload: VerifyPaymentPayload
  ): Promise<VerifyPaymentResponse> {
    const res = await fetch("/api/verify-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(
        data.message || data.error || `Payment verification failed (${res.status})`
      );
    }

    return data;
  }

  /**
   * Calls GET /api/order-status/:order_id for payment status fallback
   */
  async getOrderStatus(orderId: string): Promise<any> {
    const res = await fetch(`/api/order-status/${encodeURIComponent(orderId)}`, {
      method: "GET",
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Failed to retrieve order status.");
    }

    return data;
  }
}

export const paymentService = new PaymentService();
export default paymentService;
