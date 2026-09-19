import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { requireAuth, validateRequest } from "../middleware/auth.middleware.js";
import {
  updateProfileSchema,
  createAddressSchema,
  updateAddressSchema,
} from "../validations/user.validation.js";

const router = Router();

// All user routes require customer or admin authentication
router.use(requireAuth);

// Profile
router.get("/profile", UserController.getProfile);
router.put(
  "/profile",
  validateRequest(updateProfileSchema),
  UserController.updateProfile
);

// Orders
router.get("/orders", UserController.getOrders);
router.get("/orders/:id", UserController.getOrderById);
router.post("/orders/:id/cancel", UserController.cancelOrder);

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
