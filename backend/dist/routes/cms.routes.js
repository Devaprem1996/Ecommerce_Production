"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cms_controller_js_1 = require("../controllers/cms.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const upload_middleware_js_1 = require("../middleware/upload.middleware.js");
const cms_validation_js_1 = require("../validations/cms.validation.js");
const router = (0, express_1.Router)();
/* =========================================================================
   PUBLIC ROUTE DEFINITIONS
   ========================================================================= */
// Categories Catalog List
router.get("/categories", cms_controller_js_1.CmsController.listCategories);
// Category Details by Slug
router.get("/categories/:slug", cms_controller_js_1.CmsController.getCategory);
// Products Catalog List with filters
router.get("/products", (0, auth_middleware_js_1.validateRequest)(cms_validation_js_1.listProductsQuerySchema), cms_controller_js_1.CmsController.listProducts);
// Product Details by Slug
router.get("/products/:slug", cms_controller_js_1.CmsController.getProduct);
/* =========================================================================
   ADMIN DASHBOARD ROUTE DEFINITIONS (PROTECTED)
   ========================================================================= */
// Upload Image (single file under fieldname 'image')
router.post("/upload", auth_middleware_js_1.requireAuth, (0, auth_middleware_js_1.requireRole)(["ADMIN"]), upload_middleware_js_1.upload.single("image"), cms_controller_js_1.CmsController.uploadImage);
// Create Category
router.post("/categories", auth_middleware_js_1.requireAuth, (0, auth_middleware_js_1.requireRole)(["ADMIN"]), (0, auth_middleware_js_1.validateRequest)(cms_validation_js_1.createCategorySchema), cms_controller_js_1.CmsController.createCategory);
// Update Category properties
router.patch("/categories/:id", auth_middleware_js_1.requireAuth, (0, auth_middleware_js_1.requireRole)(["ADMIN"]), (0, auth_middleware_js_1.validateRequest)(cms_validation_js_1.updateCategorySchema), cms_controller_js_1.CmsController.updateCategory);
// Delete Category (hard delete if empty)
router.delete("/categories/:id", auth_middleware_js_1.requireAuth, (0, auth_middleware_js_1.requireRole)(["ADMIN"]), cms_controller_js_1.CmsController.deleteCategory);
// Create Product with initial variants
router.post("/products", auth_middleware_js_1.requireAuth, (0, auth_middleware_js_1.requireRole)(["ADMIN"]), (0, auth_middleware_js_1.validateRequest)(cms_validation_js_1.createProductSchema), cms_controller_js_1.CmsController.createProduct);
// Update Product general settings
router.patch("/products/:id", auth_middleware_js_1.requireAuth, (0, auth_middleware_js_1.requireRole)(["ADMIN"]), (0, auth_middleware_js_1.validateRequest)(cms_validation_js_1.updateProductSchema), cms_controller_js_1.CmsController.updateProduct);
// Soft Delete Product
router.delete("/products/:id", auth_middleware_js_1.requireAuth, (0, auth_middleware_js_1.requireRole)(["ADMIN"]), cms_controller_js_1.CmsController.deleteProduct);
// Add Standalone Product Variant
router.post("/products/:productId/variants", auth_middleware_js_1.requireAuth, (0, auth_middleware_js_1.requireRole)(["ADMIN"]), (0, auth_middleware_js_1.validateRequest)(cms_validation_js_1.createProductVariantSchema), cms_controller_js_1.CmsController.createVariant);
// Update Standalone Variant details
router.patch("/variants/:id", auth_middleware_js_1.requireAuth, (0, auth_middleware_js_1.requireRole)(["ADMIN"]), (0, auth_middleware_js_1.validateRequest)(cms_validation_js_1.updateProductVariantSchema), cms_controller_js_1.CmsController.updateVariant);
// Soft Delete Variant
router.delete("/variants/:id", auth_middleware_js_1.requireAuth, (0, auth_middleware_js_1.requireRole)(["ADMIN"]), cms_controller_js_1.CmsController.deleteVariant);
exports.default = router;
