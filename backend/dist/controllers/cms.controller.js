"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmsController = void 0;
const cms_service_js_1 = require("../services/cms.service.js");
const cloudinary_js_1 = require("../config/cloudinary.js");
const api_error_js_1 = require("../exceptions/api-error.js");
class CmsController {
    /* =========================================================================
       CATEGORY CONTROLLERS
       ========================================================================= */
    static async listCategories(req, res, next) {
        try {
            // Admins can toggle seeing inactive categories via query params
            const includeInactive = req.query.includeInactive === "true" && req.user?.role === "ADMIN";
            const categories = await cms_service_js_1.CmsService.listCategories(includeInactive);
            return res.status(200).json({
                success: true,
                message: "Categories fetched successfully.",
                data: { categories },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getCategory(req, res, next) {
        try {
            const { slug } = req.params;
            const category = await cms_service_js_1.CmsService.getCategoryBySlug(slug);
            return res.status(200).json({
                success: true,
                message: "Category details fetched successfully.",
                data: { category },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createCategory(req, res, next) {
        try {
            const category = await cms_service_js_1.CmsService.createCategory(req.body, req.user?.userId);
            return res.status(201).json({
                success: true,
                message: "Category created successfully.",
                data: { category },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateCategory(req, res, next) {
        try {
            const { id } = req.params;
            const category = await cms_service_js_1.CmsService.updateCategory(id, req.body, req.user?.userId);
            return res.status(200).json({
                success: true,
                message: "Category updated successfully.",
                data: { category },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteCategory(req, res, next) {
        try {
            const { id } = req.params;
            await cms_service_js_1.CmsService.deleteCategory(id, req.user?.userId);
            return res.status(200).json({
                success: true,
                message: "Category deleted successfully.",
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /* =========================================================================
       PRODUCT CONTROLLERS
       ========================================================================= */
    static async listProducts(req, res, next) {
        try {
            const page = parseInt(req.query.page || "1", 10);
            const limit = parseInt(req.query.limit || "20", 10);
            const search = req.query.search || undefined;
            const category = req.query.category || undefined;
            const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : undefined;
            const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined;
            const sortBy = req.query.sortBy || "createdAt";
            const sortOrder = req.query.sortOrder || "desc";
            const includeInactive = req.query.includeInactive === "true" && req.user?.role === "ADMIN";
            const result = await cms_service_js_1.CmsService.listProducts({
                page,
                limit,
                search,
                category,
                minPrice,
                maxPrice,
                sortBy,
                sortOrder,
                includeInactive,
            });
            return res.status(200).json({
                success: true,
                message: "Products fetched successfully.",
                data: result,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getProduct(req, res, next) {
        try {
            const { slug } = req.params;
            const product = await cms_service_js_1.CmsService.getProductBySlug(slug);
            return res.status(200).json({
                success: true,
                message: "Product details fetched successfully.",
                data: { product },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async createProduct(req, res, next) {
        try {
            const product = await cms_service_js_1.CmsService.createProduct(req.body, req.user?.userId);
            return res.status(201).json({
                success: true,
                message: "Product created successfully.",
                data: { product },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateProduct(req, res, next) {
        try {
            const { id } = req.params;
            const product = await cms_service_js_1.CmsService.updateProduct(id, req.body, req.user?.userId);
            return res.status(200).json({
                success: true,
                message: "Product updated successfully.",
                data: { product },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteProduct(req, res, next) {
        try {
            const { id } = req.params;
            await cms_service_js_1.CmsService.deleteProduct(id, req.user?.userId);
            return res.status(200).json({
                success: true,
                message: "Product soft deleted successfully.",
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /* =========================================================================
       PRODUCT VARIANT CONTROLLERS
       ========================================================================= */
    static async createVariant(req, res, next) {
        try {
            const { productId } = req.params;
            const variant = await cms_service_js_1.CmsService.createVariant(productId, req.body, req.user?.userId);
            return res.status(201).json({
                success: true,
                message: "Variant added successfully.",
                data: { variant },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async updateVariant(req, res, next) {
        try {
            const { id } = req.params;
            const variant = await cms_service_js_1.CmsService.updateVariant(id, req.body, req.user?.userId);
            return res.status(200).json({
                success: true,
                message: "Variant updated successfully.",
                data: { variant },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async deleteVariant(req, res, next) {
        try {
            const { id } = req.params;
            await cms_service_js_1.CmsService.deleteVariant(id, req.user?.userId);
            return res.status(200).json({
                success: true,
                message: "Variant soft deleted successfully.",
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /* =========================================================================
       IMAGE UPLOAD CONTROLLER
       ========================================================================= */
    static async uploadImage(req, res, next) {
        try {
            if (!req.file) {
                throw api_error_js_1.ApiError.badRequest("No image file uploaded.");
            }
            // Determine folder based on request body or default to "products"
            const folder = req.body.folder || "products";
            const imageUrl = await (0, cloudinary_js_1.uploadToCloudinary)(req.file.buffer, folder);
            return res.status(200).json({
                success: true,
                message: "Image uploaded successfully to Cloudinary.",
                data: { url: imageUrl },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CmsController = CmsController;
