"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_controller_js_1 = require("../controllers/auth.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const otp_controller_js_1 = require("../controllers/otp.controller.js");
const auth_validation_js_1 = require("../validations/auth.validation.js");
const otp_validation_js_1 = require("../validations/otp.validation.js");
const router = (0, express_1.Router)();
// Rate limiter for auth endpoints (30 attempts per 15 min window)
const authLimiter = (0, express_rate_limit_1.default)({
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
const otpLimiter = (0, express_rate_limit_1.default)({
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
router.post("/register", authLimiter, (0, auth_middleware_js_1.validateRequest)(auth_validation_js_1.registerSchema), auth_controller_js_1.AuthController.register);
router.post("/login", authLimiter, (0, auth_middleware_js_1.validateRequest)(auth_validation_js_1.loginSchema), auth_controller_js_1.AuthController.login);
router.post("/google", authLimiter, (0, auth_middleware_js_1.validateRequest)(auth_validation_js_1.googleLoginSchema), auth_controller_js_1.AuthController.googleLogin);
router.post("/refresh", auth_controller_js_1.AuthController.refresh);
// Mobile SMS OTP endpoints
router.post("/otp/send", otpLimiter, (0, auth_middleware_js_1.validateRequest)(otp_validation_js_1.sendOtpSchema), otp_controller_js_1.OtpController.sendOtp);
router.post("/otp/verify", authLimiter, (0, auth_middleware_js_1.validateRequest)(otp_validation_js_1.verifyOtpSchema), otp_controller_js_1.OtpController.verifyOtp);
// Protected routes
router.post("/logout", auth_middleware_js_1.requireAuth, auth_controller_js_1.AuthController.logout);
router.get("/me", auth_middleware_js_1.requireAuth, auth_controller_js_1.AuthController.me);
exports.default = router;
