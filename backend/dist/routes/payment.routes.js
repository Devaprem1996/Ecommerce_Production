"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_js_1 = require("../controllers/payment.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
// Create Razorpay Payment Order
router.post("/create-order", auth_middleware_js_1.optionalAuth, payment_controller_js_1.PaymentController.createOrder);
// Verify Razorpay Payment Signature
router.post("/verify-payment", auth_middleware_js_1.optionalAuth, payment_controller_js_1.PaymentController.verifyPayment);
router.post("/verify", auth_middleware_js_1.optionalAuth, payment_controller_js_1.PaymentController.verifyPayment);
// Payment status fallback
router.get("/order-status/:order_id", auth_middleware_js_1.optionalAuth, payment_controller_js_1.PaymentController.getOrderStatus);
// Webhook endpoint (Public, signature-verified)
router.post("/webhook", payment_controller_js_1.PaymentController.handleWebhook);
exports.default = router;
