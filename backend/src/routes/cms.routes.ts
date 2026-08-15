import { Router } from "express";
import { CmsController } from "../controllers/cms.controller.js";
import { requireAuth, requireRole, validateRequest } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
  createProductSchema,
  updateProductSchema,
  createProductVariantSchema,
  updateProductVariantSchema,
  listProductsQuerySchema,
} from "../validations/cms.validation.js";

const router = Router();

/* =========================================================================
   PUBLIC ROUTE DEFINITIONS
   ========================================================================= */

// Categories Catalog List
router.get("/categories", CmsController.listCategories);

// Category Details by Slug
router.get("/categories/:slug", CmsController.getCategory);

// Products Catalog List with filters
router.get(
  "/products",
  validateRequest(listProductsQuerySchema),
  CmsController.listProducts
);

// Product Details by Slug
router.get("/products/:slug", CmsController.getProduct);

/* =========================================================================
   ADMIN DASHBOARD ROUTE DEFINITIONS (PROTECTED)
   ========================================================================= */

// Upload Image (single file under fieldname 'image')
router.post(
  "/upload",
  requireAuth,
  requireRole(["ADMIN"]),
  upload.single("image"),
  CmsController.uploadImage
);

// Create Category
router.post(
  "/categories",
  requireAuth,
  requireRole(["ADMIN"]),
  validateRequest(createCategorySchema),
  CmsController.createCategory
);

// Update Category properties
router.patch(
  "/categories/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  validateRequest(updateCategorySchema),
  CmsController.updateCategory
);

// Delete Category (hard delete if empty)
router.delete(
  "/categories/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  CmsController.deleteCategory
);

// Create Product with initial variants
router.post(
  "/products",
  requireAuth,
  requireRole(["ADMIN"]),
  validateRequest(createProductSchema),
  CmsController.createProduct
);

// Update Product general settings
router.patch(
  "/products/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  validateRequest(updateProductSchema),
  CmsController.updateProduct
);

// Soft Delete Product
router.delete(
  "/products/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  CmsController.deleteProduct
);

// Add Standalone Product Variant
router.post(
  "/products/:productId/variants",
  requireAuth,
  requireRole(["ADMIN"]),
  validateRequest(createProductVariantSchema),
  CmsController.createVariant
);

// Update Standalone Variant details
router.patch(
  "/variants/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  validateRequest(updateProductVariantSchema),
  CmsController.updateVariant
);

// Soft Delete Variant
router.delete(
  "/variants/:id",
  requireAuth,
  requireRole(["ADMIN"]),
  CmsController.deleteVariant
);

export default router;
