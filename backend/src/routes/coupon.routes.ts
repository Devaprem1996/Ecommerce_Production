import { Router } from "express";
import { CouponController } from "../controllers/coupon.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Public coupon validation endpoint (supports optionalAuth to check customer 1-time usage)
router.post("/validate", optionalAuth, CouponController.validateCoupon);

// Public active coupons listing
router.get("/active", CouponController.getActiveCoupons);

export default router;
