"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const db_js_1 = __importDefault(require("../config/db.js"));
const api_error_js_1 = require("../exceptions/api-error.js");
const index_js_1 = __importDefault(require("../logger/index.js"));
class PaymentService {
    /**
     * Generates signature for Razorpay payment verification
     */
    static generateSignature(orderId, paymentId) {
        const secret = process.env.RAZORPAY_KEY_SECRET || "dummy_secret_for_development";
        return crypto_1.default
            .createHmac("sha256", secret)
            .update(`${orderId}|${paymentId}`)
            .digest("hex");
    }
    /**
     * Initiate a Razorpay payment order for an existing Order record
     */
    static async createPaymentOrder(orderId, userId) {
        const order = await db_js_1.default.order.findFirst({
            where: { id: orderId, userId, deletedAt: null },
        });
        if (!order) {
            throw api_error_js_1.ApiError.notFound("Order not found.");
        }
        // Amount in paise (1 INR = 100 paise)
        const amountInPaise = Math.round(Number(order.grandTotal) * 100);
        const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder";
        // Create Payment record in DB
        const payment = await db_js_1.default.payment.create({
            data: {
                orderId: order.id,
                provider: "razorpay",
                providerOrderId: `razorpay_ord_${order.orderNumber}_${Date.now()}`,
                amount: order.grandTotal,
                currency: "INR",
                status: "CREATED",
            },
        });
        index_js_1.default.info(`Razorpay payment initiated for Order #${order.orderNumber}`);
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
    static async verifyPayment(data) {
        const expectedSignature = this.generateSignature(data.razorpayOrderId, data.razorpayPaymentId);
        const isValid = expectedSignature === data.razorpaySignature;
        if (!isValid) {
            // Mark payment as FAILED
            await db_js_1.default.payment.updateMany({
                where: { providerOrderId: data.razorpayOrderId },
                data: {
                    status: "FAILED",
                    failureReason: "Invalid payment signature verification.",
                },
            });
            throw api_error_js_1.ApiError.badRequest("Payment verification failed due to signature mismatch.");
        }
        // Transactionally update Payment and Order statuses
        await db_js_1.default.$transaction([
            db_js_1.default.payment.updateMany({
                where: { providerOrderId: data.razorpayOrderId },
                data: {
                    status: "SUCCESSFUL",
                    providerPaymentId: data.razorpayPaymentId,
                    providerSignature: data.razorpaySignature,
                    paidAt: new Date(),
                },
            }),
            db_js_1.default.order.update({
                where: { id: data.orderId },
                data: {
                    status: "PAYMENT_VERIFIED",
                    orderedAt: new Date(),
                },
            }),
        ]);
        index_js_1.default.info(`Payment verified successfully for Order ID: ${data.orderId}`);
        return { verified: true };
    }
    /**
     * Process Razorpay Webhook Event for async updates
     */
    static async handleWebhook(rawBody, signature) {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "webhook_secret_placeholder";
        const expectedSignature = crypto_1.default
            .createHmac("sha256", secret)
            .update(rawBody)
            .digest("hex");
        if (expectedSignature !== signature) {
            throw api_error_js_1.ApiError.badRequest("Invalid webhook signature.");
        }
        const payload = JSON.parse(rawBody);
        const event = payload.event;
        if (event === "payment.captured") {
            const paymentEntity = payload.payload.payment.entity;
            const providerOrderId = paymentEntity.order_id;
            const providerPaymentId = paymentEntity.id;
            await db_js_1.default.payment.updateMany({
                where: { providerOrderId },
                data: {
                    status: "CAPTURED",
                    providerPaymentId,
                    paidAt: new Date(),
                },
            });
            index_js_1.default.info(`Webhook: Payment captured for Razorpay Order ${providerOrderId}`);
        }
        else if (event === "payment.failed") {
            const paymentEntity = payload.payload.payment.entity;
            const providerOrderId = paymentEntity.order_id;
            await db_js_1.default.payment.updateMany({
                where: { providerOrderId },
                data: {
                    status: "FAILED",
                    failureReason: paymentEntity.error_description || "Payment failed at gateway.",
                },
            });
            index_js_1.default.warn(`Webhook: Payment failed for Razorpay Order ${providerOrderId}`);
        }
        return { processed: true };
    }
}
exports.PaymentService = PaymentService;
