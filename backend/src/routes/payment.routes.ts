import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";
import { paymentRateLimiter } from "../middleware/rate-limit.middleware.js";

const router = Router();

// Create Razorpay Payment Order (Strict rate limiting applied)
router.post("/create-order", paymentRateLimiter, optionalAuth, PaymentController.createOrder);

// Verify Razorpay Payment Signature (Strict rate limiting applied)
router.post("/verify-payment", paymentRateLimiter, optionalAuth, PaymentController.verifyPayment);
router.post("/verify", paymentRateLimiter, optionalAuth, PaymentController.verifyPayment);

// Payment status fallback
router.get("/order-status/:order_id", optionalAuth, PaymentController.getOrderStatus);

// Webhook endpoint (Public, signature-verified)
router.post("/webhook", PaymentController.handleWebhook);

export default router;
