"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_js_1 = require("../services/user.service.js");
const api_error_js_1 = require("../exceptions/api-error.js");
class UserController {
    /**
     * GET /api/v1/user/profile
     */
    static async getProfile(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw api_error_js_1.ApiError.unauthorized("Authentication required.");
            }
            const user = await user_service_js_1.UserService.getProfile(userId);
            return res.status(200).json({
                success: true,
                message: "Profile fetched successfully.",
                data: { user },
                timestamp: new Date().toISOString(),
                requestId: req.headers["x-request-id"],
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * PUT /api/v1/user/profile
     */
    static async updateProfile(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw api_error_js_1.ApiError.unauthorized("Authentication required.");
            }
            const { firstName, lastName, phone, dateOfBirth, gender, avatarUrl } = req.body;
            const profile = await user_service_js_1.UserService.updateProfile(userId, {
                firstName,
                lastName,
                phone,
                dateOfBirth,
                gender,
                avatarUrl,
            });
            return res.status(200).json({
                success: true,
                message: "Profile updated successfully.",
                data: { profile },
                timestamp: new Date().toISOString(),
                requestId: req.headers["x-request-id"],
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/v1/user/orders
     */
    static async getOrders(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw api_error_js_1.ApiError.unauthorized("Authentication required.");
            }
            const orders = await user_service_js_1.UserService.getOrders(userId);
            return res.status(200).json({
                success: true,
                message: "Orders fetched successfully.",
                data: { orders },
                timestamp: new Date().toISOString(),
                requestId: req.headers["x-request-id"],
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/v1/user/orders/:id
     */
    static async getOrderById(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw api_error_js_1.ApiError.unauthorized("Authentication required.");
            }
            const order = await user_service_js_1.UserService.getOrderById(userId, req.params.id);
            return res.status(200).json({
                success: true,
                message: "Order details fetched successfully.",
                data: { order },
                timestamp: new Date().toISOString(),
                requestId: req.headers["x-request-id"],
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/v1/user/orders/:id/cancel
     */
    static async cancelOrder(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw api_error_js_1.ApiError.unauthorized("Authentication required.");
            }
            const order = await user_service_js_1.UserService.cancelOrder(userId, req.params.id);
            return res.status(200).json({
                success: true,
                message: "Order cancelled successfully.",
                data: { order },
                timestamp: new Date().toISOString(),
                requestId: req.headers["x-request-id"],
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/v1/user/addresses
     */
    static async getAddresses(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw api_error_js_1.ApiError.unauthorized("Authentication required.");
            }
            const addresses = await user_service_js_1.UserService.getAddresses(userId);
            return res.status(200).json({
                success: true,
                message: "Addresses fetched successfully.",
                data: { addresses },
                timestamp: new Date().toISOString(),
                requestId: req.headers["x-request-id"],
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/v1/user/addresses
     */
    static async createAddress(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw api_error_js_1.ApiError.unauthorized("Authentication required.");
            }
            const address = await user_service_js_1.UserService.createAddress(userId, req.body);
            return res.status(201).json({
                success: true,
                message: "Address created successfully.",
                data: { address },
                timestamp: new Date().toISOString(),
                requestId: req.headers["x-request-id"],
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * PUT /api/v1/user/addresses/:id
     */
    static async updateAddress(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw api_error_js_1.ApiError.unauthorized("Authentication required.");
            }
            const address = await user_service_js_1.UserService.updateAddress(userId, req.params.id, req.body);
            return res.status(200).json({
                success: true,
                message: "Address updated successfully.",
                data: { address },
                timestamp: new Date().toISOString(),
                requestId: req.headers["x-request-id"],
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * DELETE /api/v1/user/addresses/:id
     */
    static async deleteAddress(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw api_error_js_1.ApiError.unauthorized("Authentication required.");
            }
            const result = await user_service_js_1.UserService.deleteAddress(userId, req.params.id);
            return res.status(200).json({
                success: true,
                message: result.message,
                timestamp: new Date().toISOString(),
                requestId: req.headers["x-request-id"],
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * PATCH /api/v1/user/addresses/:id/default
     */
    static async setDefaultAddress(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw api_error_js_1.ApiError.unauthorized("Authentication required.");
            }
            const result = await user_service_js_1.UserService.setDefaultAddress(userId, req.params.id);
            return res.status(200).json({
                success: true,
                message: result.message,
                timestamp: new Date().toISOString(),
                requestId: req.headers["x-request-id"],
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/v1/user/orders
     */
    static async createOrder(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw api_error_js_1.ApiError.unauthorized("Authentication required.");
            }
            const { addressId, shippingAddress, items, paymentMethod, couponCode } = req.body;
            const order = await user_service_js_1.UserService.createOrder(userId, {
                addressId,
                shippingAddress,
                items,
                paymentMethod,
                couponCode,
            });
            return res.status(201).json({
                success: true,
                message: "Order placed successfully.",
                data: { order },
                timestamp: new Date().toISOString(),
                requestId: req.headers["x-request-id"],
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /api/v1/user/wishlist
     */
    static async getWishlist(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw api_error_js_1.ApiError.unauthorized("Authentication required.");
            }
            const items = await user_service_js_1.UserService.getWishlist(userId);
            return res.status(200).json({
                success: true,
                message: "Wishlist retrieved successfully.",
                data: { items },
                timestamp: new Date().toISOString(),
                requestId: req.headers["x-request-id"],
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/v1/user/wishlist
     */
    static async addToWishlist(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw api_error_js_1.ApiError.unauthorized("Authentication required.");
            }
            const { productId } = req.body;
            const item = await user_service_js_1.UserService.addToWishlist(userId, productId);
            return res.status(201).json({
                success: true,
                message: "Item added to wishlist successfully.",
                data: { item },
                timestamp: new Date().toISOString(),
                requestId: req.headers["x-request-id"],
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * DELETE /api/v1/user/wishlist/:productId
     */
    static async removeFromWishlist(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw api_error_js_1.ApiError.unauthorized("Authentication required.");
            }
            const { productId } = req.params;
            await user_service_js_1.UserService.removeFromWishlist(userId, productId);
            return res.status(200).json({
                success: true,
                message: "Item removed from wishlist successfully.",
                timestamp: new Date().toISOString(),
                requestId: req.headers["x-request-id"],
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /api/v1/user/wishlist/toggle
     */
    static async toggleWishlist(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw api_error_js_1.ApiError.unauthorized("Authentication required.");
            }
            const { productId } = req.body;
            const result = await user_service_js_1.UserService.toggleWishlist(userId, productId);
            return res.status(200).json({
                success: true,
                message: result.message,
                data: result,
                timestamp: new Date().toISOString(),
                requestId: req.headers["x-request-id"],
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
