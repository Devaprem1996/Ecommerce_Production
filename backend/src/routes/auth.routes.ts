import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "../controllers/auth.controller.js";
import { requireAuth, validateRequest } from "../middleware/auth.middleware.js";
import {
  registerSchema,
  loginSchema,
  googleLoginSchema,
} from "../validations/auth.validation.js";

const router = Router();

// Strict rate limiter for auth endpoints (5 attempts per 15 min window)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
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
