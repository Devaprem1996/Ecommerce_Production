"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_controller_js_1 = require("../controllers/auth.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const auth_validation_js_1 = require("../validations/auth.validation.js");
const router = (0, express_1.Router)();
// Strict rate limiter for auth endpoints (5 attempts per 15 min window)
const authLimiter = (0, express_rate_limit_1.default)({
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
router.post("/register", authLimiter, (0, auth_middleware_js_1.validateRequest)(auth_validation_js_1.registerSchema), auth_controller_js_1.AuthController.register);
router.post("/login", authLimiter, (0, auth_middleware_js_1.validateRequest)(auth_validation_js_1.loginSchema), auth_controller_js_1.AuthController.login);
router.post("/google", authLimiter, (0, auth_middleware_js_1.validateRequest)(auth_validation_js_1.googleLoginSchema), auth_controller_js_1.AuthController.googleLogin);
router.post("/refresh", auth_controller_js_1.AuthController.refresh);
// Protected routes
router.post("/logout", auth_middleware_js_1.requireAuth, auth_controller_js_1.AuthController.logout);
router.get("/me", auth_middleware_js_1.requireAuth, auth_controller_js_1.AuthController.me);
exports.default = router;
