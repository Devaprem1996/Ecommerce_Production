import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "../controllers/auth.controller.js";
import { requireAuth, validateRequest } from "../middleware/auth.middleware.js";
import { OtpController } from "../controllers/otp.controller.js";
import {
  registerSchema,
  loginSchema,
  googleLoginSchema,
} from "../validations/auth.validation.js";
import {
  sendOtpSchema,
  verifyOtpSchema,
} from "../validations/otp.validation.js";

const router = Router();

// Rate limiter for auth endpoints (30 attempts per 15 min window)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Dedicated limiter for SMS OTP to prevent abuse (10 requests per 15 min)
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many OTP requests. Please wait 15 minutes before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post(
  "/register",
  authLimiter,
  validateRequest(registerSchema),
  AuthController.register
);

router.post(
  "/login",
  authLimiter,
  validateRequest(loginSchema),
  AuthController.login
);

router.post(
  "/google",
  authLimiter,
  validateRequest(googleLoginSchema),
  AuthController.googleLogin
);

router.post(
  "/refresh",
  AuthController.refresh
);

// Mobile SMS OTP endpoints
router.post(
  "/otp/send",
  otpLimiter,
  validateRequest(sendOtpSchema),
  OtpController.sendOtp
);

router.post(
  "/otp/verify",
  authLimiter,
  validateRequest(verifyOtpSchema),
  OtpController.verifyOtp
);

// Protected routes
router.post(
  "/logout",
  requireAuth,
  AuthController.logout
);

router.get(
  "/me",
  requireAuth,
  AuthController.me
);

export default router;
