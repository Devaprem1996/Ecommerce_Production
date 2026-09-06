"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProductsQuerySchema = exports.updateProductVariantSchema = exports.createProductVariantSchema = exports.updateProductSchema = exports.createProductSchema = exports.updateCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
// Create Category Schema
exports.createCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        nameEn: zod_1.z.string().trim().min(1, "English category name is required").max(100),
        nameTa: zod_1.z.string().trim().min(1, "Tamil category name is required").max(100),
        descriptionEn: zod_1.z.string().trim().optional(),
        descriptionTa: zod_1.z.string().trim().optional(),
        imageUrl: zod_1.z.string().trim().url("Invalid image URL").optional().or(zod_1.z.literal("")),
        sortOrder: zod_1.z.number().int().nonnegative().optional(),
    }),
});
// Update Category Schema
exports.updateCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        nameEn: zod_1.z.string().trim().min(1).max(100).optional(),
        nameTa: zod_1.z.string().trim().min(1).max(100).optional(),
        descriptionEn: zod_1.z.string().trim().optional(),
        descriptionTa: zod_1.z.string().trim().optional(),
        imageUrl: zod_1.z.string().trim().url("Invalid image URL").optional().or(zod_1.z.literal("")),
        sortOrder: zod_1.z.number().int().nonnegative().optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
// Create Product Variant Schema (nested inside Product creation or standalone)
const variantBaseSchema = zod_1.z.object({
    nameEn: zod_1.z.string().trim().min(1, "English variant unit name is required").max(100),
    nameTa: zod_1.z.string().trim().min(1, "Tamil variant unit name is required").max(100),
    sku: zod_1.z.string().trim().min(1, "Unique SKU is required"),
    price: zod_1.z.number().positive("Price must be greater than zero"),
    discountPrice: zod_1.z.number().nonnegative("Discount price cannot be negative").optional(),
    weight: zod_1.z.number().positive("Weight must be positive").optional(),
    availableQuantity: zod_1.z.number().int().nonnegative("Available quantity cannot be negative").default(0),
});
// Create Product Schema
exports.createProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        categoryId: zod_1.z.string().uuid("Invalid category ID"),
        nameEn: zod_1.z.string().trim().min(1, "English product name is required").max(150),
        nameTa: zod_1.z.string().trim().min(1, "Tamil product name is required").max(150),
        brand: zod_1.z.string().trim().min(1, "Brand is required").max(100).default("Yathu Iyarkaiyagam"),
        descriptionEn: zod_1.z.string().trim().min(1, "English description is required"),
        descriptionTa: zod_1.z.string().trim().min(1, "Tamil description is required"),
        thumbnailUrl: zod_1.z.string().trim().url("Invalid thumbnail URL").optional().or(zod_1.z.literal("")),
        variants: zod_1.z.array(variantBaseSchema).min(1, "At least one product variant must be provided"),
    }),
});
// Update Product Schema
exports.updateProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        categoryId: zod_1.z.string().uuid("Invalid category ID").optional(),
        nameEn: zod_1.z.string().trim().min(1).max(150).optional(),
        nameTa: zod_1.z.string().trim().min(1).max(150).optional(),
        brand: zod_1.z.string().trim().min(1).max(100).optional(),
        descriptionEn: zod_1.z.string().trim().optional(),
        descriptionTa: zod_1.z.string().trim().optional(),
        thumbnailUrl: zod_1.z.string().trim().url("Invalid thumbnail URL").optional().or(zod_1.z.literal("")),
        isActive: zod_1.z.boolean().optional(),
    }),
});
// Standalone Create Product Variant Schema
exports.createProductVariantSchema = zod_1.z.object({
    body: variantBaseSchema,
});
// Standalone Update Product Variant Schema
exports.updateProductVariantSchema = zod_1.z.object({
    body: zod_1.z.object({
        nameEn: zod_1.z.string().trim().min(1).max(100).optional(),
        nameTa: zod_1.z.string().trim().min(1).max(100).optional(),
        sku: zod_1.z.string().trim().min(1).optional(),
        price: zod_1.z.number().positive("Price must be greater than zero").optional(),
        discountPrice: zod_1.z.number().nonnegative("Discount price cannot be negative").optional(),
        weight: zod_1.z.number().positive("Weight must be positive").optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
// List Products Filter Query Validation Schema
exports.listProductsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().regex(/^\d+$/, "Page must be a positive integer").optional().default("1"),
        limit: zod_1.z.string().regex(/^\d+$/, "Limit must be a positive integer").optional().default("20"),
        search: zod_1.z.string().trim().optional(),
        category: zod_1.z.string().trim().optional(), // slug or uuid
        minPrice: zod_1.z.string().regex(/^\d+(\.\d{1,2})?$/, "minPrice must be a valid number").optional(),
        maxPrice: zod_1.z.string().regex(/^\d+(\.\d{1,2})?$/, "maxPrice must be a valid number").optional(),
        sortBy: zod_1.z.enum(["price", "createdAt", "nameEn"]).optional().default("createdAt"),
        sortOrder: zod_1.z.enum(["asc", "desc"]).optional().default("desc"),
    }),
});
