import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { requireAuth, validateRequest } from "../middleware/auth.middleware.js";
import {
  registerSchema,
  loginSchema,
  googleLoginSchema,
} from "../validations/auth.validation.js";

const router = Router();

// Public routes
router.post(
  "/register",
  validateRequest(registerSchema),
  AuthController.register
);

router.post(
  "/login",
  validateRequest(loginSchema),
  AuthController.login
);

router.post(
  "/google",
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
