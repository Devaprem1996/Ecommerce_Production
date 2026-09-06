"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const payment_service_js_1 = require("../services/payment.service.js");
const api_error_js_1 = require("../exceptions/api-error.js");
class PaymentController {
    /**
     * Create Razorpay payment order
     */
    static async createOrder(req, res, next) {
        try {
            const { orderId } = req.body;
            const userId = req.user?.userId;
            if (!orderId) {
                throw api_error_js_1.ApiError.badRequest("Order ID is required.");
            }
            if (!userId) {
                throw api_error_js_1.ApiError.unauthorized("Authentication required.");
            }
            const result = await payment_service_js_1.PaymentService.createPaymentOrder(orderId, userId);
            return res.status(200).json({
                success: true,
                message: "Razorpay payment order created successfully.",
                data: result,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Verify checkout payment signature
     */
    static async verifyPayment(req, res, next) {
        try {
            const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
            if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
                throw api_error_js_1.ApiError.badRequest("Missing required payment verification parameters.");
            }
            const result = await payment_service_js_1.PaymentService.verifyPayment({
                orderId,
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature,
            });
            return res.status(200).json({
                success: true,
                message: "Payment verified successfully.",
                data: result,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
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
                message: "Webhook processed.",
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PaymentController = PaymentController;
