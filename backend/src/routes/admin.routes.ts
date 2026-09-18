import { Router } from "express";
import { AdminController } from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

const adminAuth = [requireAuth, requireRole(["ADMIN", "admin"])];

/**
 * Dashboard Overview
 */
router.get("/dashboard", ...adminAuth, AdminController.getDashboardOverview);
router.get("/overview", ...adminAuth, AdminController.getDashboardOverview);

/**
 * Orders Management
 */
router.get("/orders", ...adminAuth, AdminController.listOrders);
router.patch("/orders/:id/status", ...adminAuth, AdminController.updateOrderStatus);

/**
 * Coupons Management
 */
router.get("/coupons", ...adminAuth, AdminController.listCoupons);
router.post("/coupons", ...adminAuth, AdminController.createCoupon);
router.patch("/coupons/:id/toggle", ...adminAuth, AdminController.toggleCoupon);
router.delete("/coupons/:id", ...adminAuth, AdminController.deleteCoupon);

/**
 * Pincodes Management
 */
router.post("/pincodes", ...adminAuth, AdminController.createPincode);
router.patch("/pincodes/:pincode", ...adminAuth, AdminController.updatePincode);
router.delete("/pincodes/:pincode", ...adminAuth, AdminController.deletePincode);

export default router;
