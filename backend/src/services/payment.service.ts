import crypto from "crypto";
import prisma from "../config/db.js";
import { ApiError } from "../exceptions/api-error.js";
import logger from "../logger/index.js";
import {
  validateRazorpayConfig,
  executeWithRetry,
} from "../config/razorpay.js";
import { SmsService } from "./sms.service.js";
import { EmailService } from "./email.service.js";

export interface CreateOrderParams {
  orderId?: string;
  userId?: string;
  amount?: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, any>;
}

export interface VerifyPaymentParams {
  orderId?: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export class PaymentService {
  /**
   * Generates HMAC-SHA256 signature for Razorpay verification
   */
  static generateSignature(orderId: string, paymentId: string): string {
    const { keySecret } = validateRazorpayConfig();
    return crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");
  }

  /**
   * Constant-time comparison of expected and received signatures
   */
  static verifySignatureConstantTime(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    const expected = this.generateSignature(orderId, paymentId);
    const expectedBuffer = Buffer.from(expected, "utf-8");
    const actualBuffer = Buffer.from(signature, "utf-8");

    if (expectedBuffer.length !== actualBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  }

  /**
   * Initiate a Razorpay payment order via Razorpay Orders API
   * Computes amount strictly server-side from order record when orderId is provided.
   */
  static async createPaymentOrder(params: CreateOrderParams) {
    const { keyId } = validateRazorpayConfig();
    let amountInPaise = 0;
    let currency = (params.currency || "INR").toUpperCase();
    let receipt = params.receipt;
    let notes: Record<string, any> = params.notes || {};
    let matchedOrder: any = null;

    if (params.orderId) {
      // Find internal database order
      matchedOrder = await prisma.order.findFirst({
        where: {
          id: params.orderId,
          ...(params.userId ? { userId: params.userId } : {}),
          deletedAt: null,
        },
      });

      if (!matchedOrder) {
        throw ApiError.notFound("Internal order not found.");
      }

      // Compute amount SERVER-SIDE from order record (paise)
      amountInPaise = Math.round(Number(matchedOrder.grandTotal) * 100);
      receipt = (matchedOrder.orderNumber || params.orderId).slice(0, 40);
      notes = {
        ...notes,
        order_id: matchedOrder.id,
        order_number: matchedOrder.orderNumber,
      };
    } else if (params.amount !== undefined) {
      // Standalone curl / testing support
      amountInPaise = Math.round(Number(params.amount));
      if (!receipt) {
        receipt = `rcpt_${Date.now().toString().slice(-8)}`;
      }
    } else {
      throw ApiError.badRequest("Either orderId or amount must be specified.");
    }

    // Amount validation: minimum 100 subunits (100 paise = 1 INR)
    if (!Number.isInteger(amountInPaise) || amountInPaise < 100) {
      throw ApiError.badRequest(
        "Order amount must resolve to an integer >= 100 in smallest currency unit (paise)."
      );
    }

    // Currency code validation (ISO 4217, 3 letters)
    if (!/^[A-Z]{3}$/.test(currency)) {
      throw ApiError.badRequest("Currency must be a valid 3-letter ISO 4217 code.");
    }

    // Call official Razorpay Orders API with bounded retry backoff
    const safeReceipt = (receipt || `rcpt_${Date.now().toString().slice(-8)}`).slice(0, 40);
    const razorpayOrder = await executeWithRetry<any>(
      (client) =>
        client.orders.create({
          amount: amountInPaise,
          currency,
          receipt: safeReceipt,
          notes,
        }),
      "Create Razorpay Order"
    );

    // Response contract validation
    if (!razorpayOrder || !razorpayOrder.id) {
      logger.error("[Razorpay Response Error] Orders API response missing id attribute.");
      throw ApiError.badGateway("Payment gateway response contract mismatch: missing order id.");
    }

    // Persist Razorpay order id against internal order if DB order exists
    if (matchedOrder) {
      await prisma.payment.create({
        data: {
          orderId: matchedOrder.id,
          provider: "razorpay",
          providerOrderId: razorpayOrder.id,
          amount: matchedOrder.grandTotal,
          currency: razorpayOrder.currency || currency,
          status: "CREATED",
        },
      });

      logger.info(
        `Razorpay Order ${razorpayOrder.id} successfully created and linked to internal Order #${matchedOrder.orderNumber}`
      );
    }

    return {
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: keyId,
      receipt: razorpayOrder.receipt,
    };
  }

  /**
   * Verify Razorpay payment signature server-side using constant-time comparison
   * Enforces idempotency while validating signature first before any short-circuit
   */
  static async verifyPayment(data: VerifyPaymentParams) {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = data;

    // Runtime input validation: all 3 fields required
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      typeof razorpay_order_id !== "string" ||
      typeof razorpay_payment_id !== "string" ||
      typeof razorpay_signature !== "string"
    ) {
      throw ApiError.badRequest(
        "Missing required payment verification fields: razorpay_payment_id, razorpay_order_id, and razorpay_signature."
      );
    }

    // Constant-time HMAC-SHA256 signature verification
    const isValid = this.verifySignatureConstantTime(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      logger.warn(
        `[Razorpay Signature Mismatch] Verification failed for order ${razorpay_order_id} with payment ${razorpay_payment_id}`
      );

      // Record failure on existing payment record if present
      await prisma.payment.updateMany({
        where: { providerOrderId: razorpay_order_id },
        data: {
          status: "FAILED",
          failureReason: "Payment verification failed due to signature mismatch.",
        },
      });

      throw ApiError.badRequest("Payment verification failed due to signature mismatch.");
    }

    // Check existing payment/order record for idempotency
    const existingPayment = await prisma.payment.findFirst({
      where: { providerOrderId: razorpay_order_id },
      include: { order: true },
    });

    if (
      existingPayment &&
      (existingPayment.status === "SUCCESSFUL" ||
        existingPayment.order?.status === "PAYMENT_VERIFIED")
    ) {
      logger.info(
        `[Razorpay Idempotency] Order ${razorpay_order_id} already marked as paid. Returning idempotent success.`
      );
      return {
        verified: true,
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        alreadyProcessed: true,
      };
    }

    // Update DB records transactionally
    await prisma.$transaction(async (tx) => {
      await tx.payment.updateMany({
        where: { providerOrderId: razorpay_order_id },
        data: {
          status: "SUCCESSFUL",
          providerPaymentId: razorpay_payment_id,
          providerSignature: razorpay_signature,
          paidAt: new Date(),
        },
      });

      // Target order by orderId or via the payment relation
      if (orderId) {
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: "PAYMENT_VERIFIED",
            orderedAt: new Date(),
          },
        });
      } else if (existingPayment?.orderId) {
        await tx.order.update({
          where: { id: existingPayment.orderId },
          data: {
            status: "PAYMENT_VERIFIED",
            orderedAt: new Date(),
          },
        });
      }
    });

    logger.info(
      `Payment successfully verified and order marked PAID for Razorpay Order ${razorpay_order_id}`
    );

    // Dispatch order confirmation SMS and Email now that payment is verified
    const targetOrderId = orderId || existingPayment?.orderId;
    if (targetOrderId) {
      prisma.order
        .findUnique({
          where: { id: targetOrderId },
          include: { address: true, user: true },
        })
        .then((orderRecord) => {
          if (!orderRecord) return;

          const phoneToNotify =
            orderRecord.address?.phone || orderRecord.user?.phone;
          if (phoneToNotify) {
            SmsService.sendOrderConfirmation({
              phone: phoneToNotify,
              orderNumber: orderRecord.orderNumber,
              grandTotal: Number(orderRecord.grandTotal),
            }).catch((err) =>
              logger.error("Failed to send payment verified SMS:", err)
            );
          }

          if (
            orderRecord.user?.email &&
            !orderRecord.user.email.endsWith(".local")
          ) {
            EmailService.sendOrderConfirmation(
              orderRecord.user.email,
              orderRecord.orderNumber,
              Number(orderRecord.grandTotal),
              orderRecord.address?.fullName || "Customer"
            ).catch((err) =>
              logger.error("Failed to send payment verified Email:", err)
            );
          }
        })
        .catch((err) =>
          logger.error("Failed to load order for notification dispatch:", err)
        );
    }

    return {
      verified: true,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      alreadyProcessed: false,
    };
  }

  /**
   * Query status fallback for a Razorpay order
   */
  static async getOrderStatus(razorpayOrderId: string) {
    if (!razorpayOrderId) {
      throw ApiError.badRequest("Razorpay order ID is required.");
    }

    validateRazorpayConfig();

    const payments = await executeWithRetry(
      (client) => client.orders.fetchPayments(razorpayOrderId),
      "Fetch Order Payments"
    );

    return {
      order_id: razorpayOrderId,
      payments: (payments as any)?.items || payments || [],
    };
  }

  /**
   * Initiate a Razorpay payment refund via Razorpay Refunds API
   */
  static async refundPayment(params: {
    paymentId: string;
    amountInPaise?: number;
    notes?: Record<string, any>;
    reason?: string;
  }) {
    const { paymentId, amountInPaise, notes = {}, reason = "Customer Cancellation" } = params;
    if (!paymentId) {
      throw ApiError.badRequest("Razorpay payment ID is required for refund.");
    }

    validateRazorpayConfig();

    const refundPayload: any = {
      notes: {
        ...notes,
        reason: reason.slice(0, 255),
      },
    };

    if (amountInPaise !== undefined) {
      if (!Number.isInteger(amountInPaise) || amountInPaise < 100) {
        throw ApiError.badRequest(
          "Refund amount must resolve to an integer >= 100 in smallest currency unit (paise)."
        );
      }
      refundPayload.amount = amountInPaise;
    }

    logger.info(
      `Initiating Razorpay refund for payment ${paymentId} (Amount: ${
        amountInPaise ? `₹${amountInPaise / 100}` : "Full"
      })...`
    );

    const refundResult = await executeWithRetry<any>(
      (client) => client.payments.refund(paymentId, refundPayload),
      "Create Razorpay Refund"
    );

    logger.info(
      `Razorpay refund created: ID=${refundResult.id}, Payment=${paymentId}, Status=${refundResult.status}`
    );

    return {
      success: true,
      refundId: refundResult.id,
      paymentId: refundResult.payment_id || paymentId,
      amount: refundResult.amount,
      currency: refundResult.currency || "INR",
      status: refundResult.status,
      speedProcessed: refundResult.speed_processed,
    };
  }

  /**
   * Process Razorpay Webhook Event for async updates
   */
  static async handleWebhook(rawBody: string, signature: string) {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      throw ApiError.internal("Payment webhook secret is not configured.");
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf-8");
    const actualBuf = Buffer.from(signature, "utf-8");

    if (
      expectedBuf.length !== actualBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, actualBuf)
    ) {
      throw ApiError.badRequest("Invalid webhook signature.");
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    if (event === "payment.captured") {
      const paymentEntity = payload.payload?.payment?.entity;
      const providerOrderId = paymentEntity?.order_id;
      const providerPaymentId = paymentEntity?.id;

      if (providerOrderId) {
        await prisma.payment.updateMany({
          where: { providerOrderId },
          data: {
            status: "CAPTURED",
            providerPaymentId,
            paidAt: new Date(),
          },
        });
        logger.info(`Webhook: Payment captured for Razorpay Order ${providerOrderId}`);
      }
    } else if (event === "payment.failed") {
      const paymentEntity = payload.payload?.payment?.entity;
      const providerOrderId = paymentEntity?.order_id;

      if (providerOrderId) {
        await prisma.payment.updateMany({
          where: { providerOrderId },
          data: {
            status: "FAILED",
            failureReason:
              paymentEntity?.error_description || "Payment failed at gateway.",
          },
        });
        logger.warn(`Webhook: Payment failed for Razorpay Order ${providerOrderId}`);
      }
    } else if (event === "refund.processed") {
      const refundEntity = payload.payload?.refund?.entity;
      const paymentId = refundEntity?.payment_id;

      if (paymentId) {
        await prisma.payment.updateMany({
          where: { providerPaymentId: paymentId },
          data: {
            status: "REFUNDED",
          },
        });
        logger.info(
          `Webhook: Refund processed for Payment ${paymentId} (Refund ID: ${refundEntity?.id})`
        );
      }
    } else if (event === "refund.failed") {
      const refundEntity = payload.payload?.refund?.entity;
      const paymentId = refundEntity?.payment_id;

      if (paymentId) {
        logger.error(
          `Webhook: Refund failed for Payment ${paymentId}. Reason: ${
            refundEntity?.error_description || "Unknown"
          }`
        );
      }
    }

    return { processed: true };
  }
}
