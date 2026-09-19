"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_js_1 = require("../controllers/admin.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
const adminAuth = [auth_middleware_js_1.requireAuth, (0, auth_middleware_js_1.requireRole)(["ADMIN", "admin"])];
/**
 * Dashboard Overview
 */
router.get("/dashboard", ...adminAuth, admin_controller_js_1.AdminController.getDashboardOverview);
router.get("/overview", ...adminAuth, admin_controller_js_1.AdminController.getDashboardOverview);
/**
 * Orders Management
 */
router.get("/orders", ...adminAuth, admin_controller_js_1.AdminController.listOrders);
router.patch("/orders/:id/status", ...adminAuth, admin_controller_js_1.AdminController.updateOrderStatus);
/**
 * Coupons Management
 */
router.get("/coupons", ...adminAuth, admin_controller_js_1.AdminController.listCoupons);
router.post("/coupons", ...adminAuth, admin_controller_js_1.AdminController.createCoupon);
router.patch("/coupons/:id/toggle", ...adminAuth, admin_controller_js_1.AdminController.toggleCoupon);
router.delete("/coupons/:id", ...adminAuth, admin_controller_js_1.AdminController.deleteCoupon);
/**
 * Pincodes Management
 */
router.post("/pincodes", ...adminAuth, admin_controller_js_1.AdminController.createPincode);
router.patch("/pincodes/:pincode", ...adminAuth, admin_controller_js_1.AdminController.updatePincode);
router.delete("/pincodes/:pincode", ...adminAuth, admin_controller_js_1.AdminController.deletePincode);
exports.default = router;
