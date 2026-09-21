"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_js_1 = require("../controllers/user.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const user_validation_js_1 = require("../validations/user.validation.js");
const otp_validation_js_1 = require("../validations/otp.validation.js");
const router = (0, express_1.Router)();
// Public Guest Order Tracking Route (No auth token required, uses SMS OTP verification)
router.post("/orders/track-by-otp", (0, auth_middleware_js_1.validateRequest)(otp_validation_js_1.trackByOtpSchema), user_controller_js_1.UserController.trackOrdersByOtp);
// All subsequent user routes require customer or admin authentication
router.use(auth_middleware_js_1.requireAuth);
// Profile
router.get("/profile", user_controller_js_1.UserController.getProfile);
router.put("/profile", (0, auth_middleware_js_1.validateRequest)(user_validation_js_1.updateProfileSchema), user_controller_js_1.UserController.updateProfile);
// Wishlist
router.get("/wishlist", user_controller_js_1.UserController.getWishlist);
router.post("/wishlist", (0, auth_middleware_js_1.validateRequest)(user_validation_js_1.wishlistSchema), user_controller_js_1.UserController.addToWishlist);
router.delete("/wishlist/:productId", user_controller_js_1.UserController.removeFromWishlist);
router.post("/wishlist/toggle", (0, auth_middleware_js_1.validateRequest)(user_validation_js_1.wishlistSchema), user_controller_js_1.UserController.toggleWishlist);
// Orders
router.get("/orders", user_controller_js_1.UserController.getOrders);
router.get("/orders/:id", user_controller_js_1.UserController.getOrderById);
router.post("/orders", (0, auth_middleware_js_1.validateRequest)(user_validation_js_1.createOrderSchema), user_controller_js_1.UserController.createOrder);
router.post("/orders/:id/cancel", user_controller_js_1.UserController.cancelOrder);
// Addresses
router.get("/addresses", user_controller_js_1.UserController.getAddresses);
router.post("/addresses", (0, auth_middleware_js_1.validateRequest)(user_validation_js_1.createAddressSchema), user_controller_js_1.UserController.createAddress);
router.put("/addresses/:id", (0, auth_middleware_js_1.validateRequest)(user_validation_js_1.updateAddressSchema), user_controller_js_1.UserController.updateAddress);
router.delete("/addresses/:id", user_controller_js_1.UserController.deleteAddress);
router.patch("/addresses/:id/default", user_controller_js_1.UserController.setDefaultAddress);
exports.default = router;
