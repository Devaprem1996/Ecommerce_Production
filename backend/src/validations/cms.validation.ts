import { z } from "zod";

// Create Category Schema
export const createCategorySchema = z.object({
  body: z.object({
    nameEn: z.string().trim().min(1, "English category name is required").max(100),
    nameTa: z.string().trim().min(1, "Tamil category name is required").max(100),
    descriptionEn: z.string().trim().optional(),
    descriptionTa: z.string().trim().optional(),
    imageUrl: z.string().trim().url("Invalid image URL").optional().or(z.literal("")),
    sortOrder: z.number().int().nonnegative().optional(),
  }),
});

// Update Category Schema
export const updateCategorySchema = z.object({
  body: z.object({
    nameEn: z.string().trim().min(1).max(100).optional(),
    nameTa: z.string().trim().min(1).max(100).optional(),
    descriptionEn: z.string().trim().optional(),
    descriptionTa: z.string().trim().optional(),
    imageUrl: z.string().trim().url("Invalid image URL").optional().or(z.literal("")),
    sortOrder: z.number().int().nonnegative().optional(),
    isActive: z.boolean().optional(),
  }),
});

// Create Product Variant Schema (nested inside Product creation or standalone)
const variantBaseSchema = z.object({
  nameEn: z.string().trim().min(1, "English variant unit name is required").max(100),
  nameTa: z.string().trim().min(1, "Tamil variant unit name is required").max(100),
  sku: z.string().trim().min(1, "Unique SKU is required"),
  price: z.number().positive("Price must be greater than zero"),
  discountPrice: z.number().nonnegative("Discount price cannot be negative").optional(),
  weight: z.number().positive("Weight must be positive").optional(),
  availableQuantity: z.number().int().nonnegative("Available quantity cannot be negative").default(0),
});

// Create Product Schema
export const createProductSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid("Invalid category ID"),
    nameEn: z.string().trim().min(1, "English product name is required").max(150),
    nameTa: z.string().trim().min(1, "Tamil product name is required").max(150),
    brand: z.string().trim().min(1, "Brand is required").max(100).default("Yathu Arokiyagam"),
    descriptionEn: z.string().trim().min(1, "English description is required"),
    descriptionTa: z.string().trim().min(1, "Tamil description is required"),
    thumbnailUrl: z.string().trim().url("Invalid thumbnail URL").optional().or(z.literal("")),
    variants: z.array(variantBaseSchema).min(1, "At least one product variant must be provided"),
  }),
});

// Update Product Schema
export const updateProductSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid("Invalid category ID").optional(),
    nameEn: z.string().trim().min(1).max(150).optional(),
    nameTa: z.string().trim().min(1).max(150).optional(),
    brand: z.string().trim().min(1).max(100).optional(),
    descriptionEn: z.string().trim().optional(),
    descriptionTa: z.string().trim().optional(),
    thumbnailUrl: z.string().trim().url("Invalid thumbnail URL").optional().or(z.literal("")),
    isActive: z.boolean().optional(),
  }),
});

// Standalone Create Product Variant Schema
export const createProductVariantSchema = z.object({
  body: variantBaseSchema,
});

// Standalone Update Product Variant Schema
export const updateProductVariantSchema = z.object({
  body: z.object({
    nameEn: z.string().trim().min(1).max(100).optional(),
    nameTa: z.string().trim().min(1).max(100).optional(),
    sku: z.string().trim().min(1).optional(),
    price: z.number().positive("Price must be greater than zero").optional(),
    discountPrice: z.number().nonnegative("Discount price cannot be negative").optional(),
    weight: z.number().positive("Weight must be positive").optional(),
    isActive: z.boolean().optional(),
  }),
});

// List Products Filter Query Validation Schema
export const listProductsQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "Page must be a positive integer").optional().default("1"),
    limit: z.string().regex(/^\d+$/, "Limit must be a positive integer").optional().default("20"),
    search: z.string().trim().optional(),
    category: z.string().trim().optional(), // slug or uuid
    minPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "minPrice must be a valid number").optional(),
    maxPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "maxPrice must be a valid number").optional(),
    sortBy: z.enum(["price", "createdAt", "nameEn"]).optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});
