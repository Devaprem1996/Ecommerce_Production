import crypto from "crypto";
import prisma from "../config/db.js";
import { ApiError } from "../exceptions/api-error.js";
import logger from "../logger/index.js";

export class PaymentService {
  /**
   * Generates signature for Razorpay payment verification
   */
  static generateSignature(orderId: string, paymentId: string): string {
    const secret = process.env.RAZORPAY_KEY_SECRET || "dummy_secret_for_development";
    return crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
  }

  /**
   * Initiate a Razorpay payment order for an existing Order record
   */
  static async createPaymentOrder(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId, deletedAt: null },
    });

    if (!order) {
      throw ApiError.notFound("Order not found.");
    }

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(order.grandTotal) * 100);
    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";

    // Create Payment record in DB
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "razorpay",
        providerOrderId: `razorpay_ord_${order.orderNumber}_${Date.now()}`,
        amount: order.grandTotal,
        currency: "INR",
        status: "CREATED",
      },
    });

    logger.info(`Razorpay payment initiated for Order #${order.orderNumber}`);

    return {
      keyId,
      orderId: payment.providerOrderId,
      amount: amountInPaise,
      currency: "INR",
      dbOrderNumber: order.orderNumber,
    };
  }

  /**
   * Verify Razorpay checkout payment signature
   */
  static async verifyPayment(data: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const expectedSignature = this.generateSignature(
      data.razorpayOrderId,
      data.razorpayPaymentId
    );

    const isValid = expectedSignature === data.razorpaySignature;

    if (!isValid) {
      // Mark payment as FAILED
      await prisma.payment.updateMany({
        where: { providerOrderId: data.razorpayOrderId },
        data: {
          status: "FAILED",
          failureReason: "Invalid payment signature verification.",
        },
      });

      throw ApiError.badRequest("Payment verification failed due to signature mismatch.");
    }

    // Transactionally update Payment and Order statuses
    await prisma.$transaction([
      prisma.payment.updateMany({
        where: { providerOrderId: data.razorpayOrderId },
        data: {
          status: "SUCCESSFUL",
          providerPaymentId: data.razorpayPaymentId,
          providerSignature: data.razorpaySignature,
          paidAt: new Date(),
        },
      }),
      prisma.order.update({
        where: { id: data.orderId },
        data: {
          status: "PAYMENT_VERIFIED",
          orderedAt: new Date(),
        },
      }),
    ]);

    logger.info(`Payment verified successfully for Order ID: ${data.orderId}`);
    return { verified: true };
  }

  /**
   * Process Razorpay Webhook Event for async updates
   */
  static async handleWebhook(rawBody: string, signature: string) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "webhook_secret_placeholder";
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      throw ApiError.badRequest("Invalid webhook signature.");
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === "payment.captured") {
      const paymentEntity = payload.payload.payment.entity;
      const providerOrderId = paymentEntity.order_id;
      const providerPaymentId = paymentEntity.id;

      await prisma.payment.updateMany({
        where: { providerOrderId },
        data: {
          status: "CAPTURED",
          providerPaymentId,
          paidAt: new Date(),
        },
      });
      logger.info(`Webhook: Payment captured for Razorpay Order ${providerOrderId}`);
    } else if (event === "payment.failed") {
      const paymentEntity = payload.payload.payment.entity;
      const providerOrderId = paymentEntity.order_id;

      await prisma.payment.updateMany({
        where: { providerOrderId },
        data: {
          status: "FAILED",
          failureReason: paymentEntity.error_description || "Payment failed at gateway.",
        },
      });
      logger.warn(`Webhook: Payment failed for Razorpay Order ${providerOrderId}`);
    }

    return { processed: true };
  }
}
