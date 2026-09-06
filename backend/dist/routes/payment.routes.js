"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_js_1 = require("../controllers/payment.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
// Create Razorpay Payment Order (Protected)
router.post("/create-order", auth_middleware_js_1.requireAuth, payment_controller_js_1.PaymentController.createOrder);
// Verify Razorpay Payment Signature (Protected)
router.post("/verify", auth_middleware_js_1.requireAuth, payment_controller_js_1.PaymentController.verifyPayment);
// Webhook endpoint (Public, signature-verified)
router.post("/webhook", payment_controller_js_1.PaymentController.handleWebhook);
exports.default = router;
