declare module "razorpay" {
  interface RazorpayOptions {
    key_id: string;
    key_secret: string;
    headers?: Record<string, string>;
  }

  interface OrderCreateArgs {
    amount: number | string;
    currency: string;
    receipt?: string;
    notes?: Record<string, any>;
    partial_payment?: boolean;
  }

  interface RazorpayOrder {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    status: string;
    attempts: number;
    notes: Record<string, any>;
    created_at: number;
  }

  class Razorpay {
    constructor(options: RazorpayOptions);
    orders: {
      create(params: OrderCreateArgs): Promise<RazorpayOrder>;
      fetch(orderId: string): Promise<RazorpayOrder>;
      fetchPayments(orderId: string): Promise<{ items: any[]; count: number }>;
    };
    payments: {
      fetch(paymentId: string): Promise<any>;
      capture(paymentId: string, amount: number, currency: string): Promise<any>;
      refund(
        paymentId: string,
        params?: {
          amount?: number;
          notes?: Record<string, any>;
          speed?: "normal" | "optimum";
          receipt?: string;
        }
      ): Promise<any>;
    };
    refunds: {
      create(params: {
        payment_id: string;
        amount?: number;
        notes?: Record<string, any>;
        speed?: "normal" | "optimum";
        receipt?: string;
      }): Promise<any>;
      fetch(refundId: string): Promise<any>;
    };
  }

  export default Razorpay;
}
