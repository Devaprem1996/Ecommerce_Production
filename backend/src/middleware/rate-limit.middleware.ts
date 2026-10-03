import rateLimit from "express-rate-limit";

/**
 * Global API rate limiter (protects backend against general scrapers and bot floods)
 * 300 requests per 15 minutes per IP
 */
export const apiGlobalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict Rate Limiter for Authentication endpoints (login, register, token refresh)
 * 30 attempts per 15 minutes per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Dedicated Rate Limiter for SMS OTP dispatching & verification
 * 10 requests per 15 minutes per IP to prevent SMS API credit burn & brute force
 */
export const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many OTP requests. Please wait 15 minutes before trying again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict Rate Limiter for Checkout & Order Creation
 * 20 orders per 10 minutes per IP to prevent inventory locking attacks
 */
export const checkoutRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many checkout requests in a short period. Please wait 10 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict Rate Limiter for Payment Operations (Razorpay order creation & signature verification)
 * 30 requests per 10 minutes per IP to prevent payment gateway abuse
 */
export const paymentRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: "Too many payment requests. Please wait 10 minutes before retrying.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
