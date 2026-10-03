import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { requireAuth, validateRequest } from "../middleware/auth.middleware.js";
import {
  updateProfileSchema,
  changePasswordSchema,
  createAddressSchema,
  updateAddressSchema,
  createOrderSchema,
  cancelOrderSchema,
  wishlistSchema,
} from "../validations/user.validation.js";
import { trackByOtpSchema } from "../validations/otp.validation.js";
import { checkoutRateLimiter } from "../middleware/rate-limit.middleware.js";

const router = Router();

// Public Guest Order Tracking Route (No auth token required, uses SMS OTP verification)
router.post(
  "/orders/track-by-otp",
  validateRequest(trackByOtpSchema),
  UserController.trackOrdersByOtp
);

// Public Direct Order Tracking Route (No auth token or OTP required, verified via SMS cryptographic tracking token)
router.get("/orders/track-by-token", UserController.trackOrderByToken);

// All subsequent user routes require customer or admin authentication
router.use(requireAuth);

// Profile & Password
router.get("/profile", UserController.getProfile);
router.put(
  "/profile",
  validateRequest(updateProfileSchema),
  UserController.updateProfile
);
router.post(
  "/change-password",
  validateRequest(changePasswordSchema),
  UserController.changePassword
);

// Wishlist
router.get("/wishlist", UserController.getWishlist);
router.post(
  "/wishlist",
  validateRequest(wishlistSchema),
  UserController.addToWishlist
);
router.delete("/wishlist/:productId", UserController.removeFromWishlist);
router.post(
  "/wishlist/toggle",
  validateRequest(wishlistSchema),
  UserController.toggleWishlist
);

// Orders
router.get("/orders", UserController.getOrders);
router.get("/orders/:id", UserController.getOrderById);
router.post(
  "/orders",
  checkoutRateLimiter,
  validateRequest(createOrderSchema),
  UserController.createOrder
);
router.post(
  "/orders/:id/cancel",
  validateRequest(cancelOrderSchema),
  UserController.cancelOrder
);

// Addresses
router.get("/addresses", UserController.getAddresses);
router.post(
  "/addresses",
  validateRequest(createAddressSchema),
  UserController.createAddress
);
router.put(
  "/addresses/:id",
  validateRequest(updateAddressSchema),
  UserController.updateAddress
);
router.delete("/addresses/:id", UserController.deleteAddress);
router.patch("/addresses/:id/default", UserController.setDefaultAddress);

export default router;
