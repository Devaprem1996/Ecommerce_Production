import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Create Razorpay Payment Order
router.post("/create-order", optionalAuth, PaymentController.createOrder);

// Verify Razorpay Payment Signature
router.post("/verify-payment", optionalAuth, PaymentController.verifyPayment);
router.post("/verify", optionalAuth, PaymentController.verifyPayment);

// Payment status fallback
router.get("/order-status/:order_id", optionalAuth, PaymentController.getOrderStatus);

// Webhook endpoint (Public, signature-verified)
router.post("/webhook", PaymentController.handleWebhook);

export default router;
