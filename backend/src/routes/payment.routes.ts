import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Create Razorpay Payment Order (Protected)
router.post(
  "/create-order",
  requireAuth,
  PaymentController.createOrder
);

// Verify Razorpay Payment Signature (Protected)
router.post(
  "/verify",
  requireAuth,
  PaymentController.verifyPayment
);

// Webhook endpoint (Public, signature-verified)
router.post(
  "/webhook",
  PaymentController.handleWebhook
);

export default router;
