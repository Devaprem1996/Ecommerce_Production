"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payment_service_js_1 = require("../services/payment.service.js");
const api_error_js_1 = require("../exceptions/api-error.js");
class PaymentController {
    /**
     * POST /api/create-order
     * Creates a Razorpay Order via the official Orders API
     */
    static async createOrder(req, res, next) {
        try {
            const { orderId, amount, currency, receipt, notes } = req.body;
            const userId = req.user?.userId;
            const result = await payment_service_js_1.PaymentService.createPaymentOrder({
                orderId,
                userId,
                amount,
                currency,
                receipt,
                notes,
            });
            return res.status(200).json({
                success: true,
                message: "Razorpay order created successfully.",
                order_id: result.order_id,
                amount: result.amount,
                currency: result.currency,
                key_id: result.key_id,
                receipt: result.receipt,
                data: result,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/verify-payment
     * Verifies the Razorpay payment signature server-side before marking the order paid
     */
    static async verifyPayment(req, res, next) {
        try {
            const body = req.body || {};
            const razorpay_order_id = body.razorpay_order_id || body.razorpayOrderId;
            const razorpay_payment_id = body.razorpay_payment_id || body.razorpayPaymentId;
            const razorpay_signature = body.razorpay_signature || body.razorpaySignature;
            const orderId = body.orderId || body.order_id;
            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                throw api_error_js_1.ApiError.badRequest("Missing required payment verification parameters: razorpay_payment_id, razorpay_order_id, and razorpay_signature.");
            }
            const result = await payment_service_js_1.PaymentService.verifyPayment({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                orderId,
            });
            return res.status(200).json({
                success: true,
                message: result.alreadyProcessed
                    ? "Payment already verified."
                    : "Payment verified successfully.",
                verified: result.verified,
                order_id: result.order_id,
                payment_id: result.payment_id,
                data: result,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/order-status/:order_id
     * Payment status fallback query for a Razorpay order
     */
    static async getOrderStatus(req, res, next) {
        try {
            const { order_id } = req.params;
            if (!order_id) {
                throw api_error_js_1.ApiError.badRequest("Razorpay order ID parameter is required.");
            }
            const result = await payment_service_js_1.PaymentService.getOrderStatus(order_id);
            return res.status(200).json({
                success: true,
                order_id: result.order_id,
                payments: result.payments,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/payments/webhook
     * Handle Razorpay webhook notifications
     */
    static async handleWebhook(req, res, next) {
        try {
            const signature = req.headers["x-razorpay-signature"];
            if (!signature) {
                throw api_error_js_1.ApiError.badRequest("Missing Razorpay signature header.");
            }
            const rawBody = req.rawBody || JSON.stringify(req.body);
            const result = await payment_service_js_1.PaymentService.handleWebhook(rawBody, signature);
            return res.status(200).json({
                success: true,
                message: "Webhook processed successfully.",
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PaymentController = PaymentController;
