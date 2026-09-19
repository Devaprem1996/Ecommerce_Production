"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_js_1 = require("../services/admin.service.js");
class AdminController {
    /**
     * Get live admin dashboard overview metrics and aggregations
     */
    static async getDashboardOverview(req, res, next) {
        try {
            const data = await admin_service_js_1.AdminService.getDashboardOverview();
            return res.status(200).json({
                success: true,
                message: "Admin dashboard overview retrieved successfully.",
                data,
                timestamp: new Date().toISOString(),
                requestId: req.headers["x-request-id"] || "N/A",
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Orders
     */
    static async listOrders(req, res, next) {
        try {
            const { status, search, page, limit } = req.query;
            const data = await admin_service_js_1.AdminService.listOrders({
                status: status,
                search: search,
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
            });
            return res.status(200).json({
                success: true,
                message: "Orders retrieved successfully.",
                data,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateOrderStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const data = await admin_service_js_1.AdminService.updateOrderStatus(id, status);
            return res.status(200).json({
                success: true,
                message: "Order status updated successfully.",
                data,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Coupons
     */
    static async listCoupons(req, res, next) {
        try {
            const coupons = await admin_service_js_1.AdminService.listCoupons();
            return res.status(200).json({
                success: true,
                message: "Coupons retrieved successfully.",
                data: { coupons },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createCoupon(req, res, next) {
        try {
            const coupon = await admin_service_js_1.AdminService.createCoupon(req.body);
            return res.status(201).json({
                success: true,
                message: "Coupon created successfully.",
                data: { coupon },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async toggleCoupon(req, res, next) {
        try {
            const { id } = req.params;
            const coupon = await admin_service_js_1.AdminService.toggleCoupon(id);
            return res.status(200).json({
                success: true,
                message: "Coupon status toggled successfully.",
                data: { coupon },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteCoupon(req, res, next) {
        try {
            const { id } = req.params;
            await admin_service_js_1.AdminService.deleteCoupon(id);
            return res.status(200).json({
                success: true,
                message: "Coupon deleted successfully.",
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Pincodes
     */
    static async createPincode(req, res, next) {
        try {
            const pincode = await admin_service_js_1.AdminService.createPincode(req.body);
            return res.status(201).json({
                success: true,
                message: "Pincode created successfully.",
                data: { pincode },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updatePincode(req, res, next) {
        try {
            const { pincode } = req.params;
            const updated = await admin_service_js_1.AdminService.updatePincode(pincode, req.body);
            return res.status(200).json({
                success: true,
                message: "Pincode updated successfully.",
                data: { pincode: updated },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deletePincode(req, res, next) {
        try {
            const { pincode } = req.params;
            await admin_service_js_1.AdminService.deletePincode(pincode);
            return res.status(200).json({
                success: true,
                message: "Pincode deleted successfully.",
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminController = AdminController;
