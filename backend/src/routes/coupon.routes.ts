import { Router } from "express";
import { CouponController } from "../controllers/coupon.controller.js";

const router = Router();

// Public coupon validation endpoint
router.post("/validate", CouponController.validateCoupon);

// Public active coupons listing
router.get("/active", CouponController.getActiveCoupons);

export default router;
