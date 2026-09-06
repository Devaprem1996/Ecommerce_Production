"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CmsService = void 0;
const db_js_1 = __importDefault(require("../config/db.js"));
const api_error_js_1 = require("../exceptions/api-error.js");
const index_js_1 = __importDefault(require("../logger/index.js"));
function toSlug(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}
class CmsService {
    /* =========================================================================
       CATEGORY SERVICES
       ========================================================================= */
    /**
     * List all categories (public endpoint)
     */
    static async listCategories(includeInactive = false) {
        return await db_js_1.default.category.findMany({
            where: includeInactive ? {} : { isActive: true },
            include: {
                _count: {
                    select: {
                        products: {
                            where: { deletedAt: null, isActive: true }
                        }
                    }
                }
            },
            orderBy: { sortOrder: "asc" },
        });
    }
    /**
     * Fetch category detail by slug
     */
    static async getCategoryBySlug(slug) {
        const category = await db_js_1.default.category.findUnique({
            where: { slug },
            include: {
                products: {
                    where: { deletedAt: null, isActive: true },
                    include: {
                        variants: {
                            where: { deletedAt: null, isActive: true },
                        },
                    },
                },
            },
        });
        if (!category) {
            throw api_error_js_1.ApiError.notFound("Category not found.");
        }
        return category;
    }
    /**
     * Create a new category (admin function)
     */
    static async createCategory(data, userId) {
        const slug = toSlug(data.nameEn);
        const existing = await db_js_1.default.category.findUnique({
            where: { slug },
        });
        if (existing) {
            throw api_error_js_1.ApiError.conflict("Category with this name slug already exists.");
        }
        const category = await db_js_1.default.category.create({
            data: {
                nameEn: data.nameEn,
                nameTa: data.nameTa,
                slug,
                descriptionEn: data.descriptionEn,
                descriptionTa: data.descriptionTa,
                imageUrl: data.imageUrl,
                sortOrder: data.sortOrder || 0,
            },
        });
        await db_js_1.default.auditLog.create({
            data: {
                userId,
                action: "CREATE_CATEGORY",
                entity: "Category",
                entityId: category.id,
                newValue: JSON.parse(JSON.stringify(category)),
            },
        }).catch(err => index_js_1.default.error("AuditLog creation failed:", err));
        index_js_1.default.info(`Category created: ${category.nameEn} (ID: ${category.id})`);
        return category;
    }
    /**
     * Update category properties (admin function)
     */
    static async updateCategory(id, data, userId) {
        const category = await db_js_1.default.category.findUnique({
            where: { id },
        });
        if (!category) {
            throw api_error_js_1.ApiError.notFound("Category not found.");
        }
        const updateData = { ...data };
        if (data.nameEn) {
            updateData.slug = toSlug(data.nameEn);
        }
        const updated = await db_js_1.default.category.update({
            where: { id },
            data: updateData,
        });
        await db_js_1.default.auditLog.create({
            data: {
                userId,
                action: "UPDATE_CATEGORY",
                entity: "Category",
                entityId: updated.id,
                oldValue: JSON.parse(JSON.stringify(category)),
                newValue: JSON.parse(JSON.stringify(updated)),
            },
        }).catch(err => index_js_1.default.error("AuditLog creation failed:", err));
        index_js_1.default.info(`Category updated: ${updated.nameEn} (ID: ${updated.id})`);
        return updated;
    }
    /**
     * Delete category (admin function)
     */
    static async deleteCategory(id, userId) {
        const category = await db_js_1.default.category.findUnique({
            where: { id },
            include: { _count: { select: { products: true } } },
        });
        if (!category) {
            throw api_error_js_1.ApiError.notFound("Category not found.");
        }
        if (category._count.products > 0) {
            // Disallow deleting category if it has linked products to protect database referential integrity
            throw api_error_js_1.ApiError.badRequest("Cannot delete category containing products. De-associate products first.");
        }
        await db_js_1.default.category.delete({
            where: { id },
        });
        await db_js_1.default.auditLog.create({
            data: {
                userId,
                action: "DELETE_CATEGORY",
                entity: "Category",
                entityId: id,
                oldValue: JSON.parse(JSON.stringify(category)),
            },
        }).catch(err => index_js_1.default.error("AuditLog creation failed:", err));
        index_js_1.default.info(`Category deleted: ${category.nameEn} (ID: ${category.id})`);
        return true;
    }
    /* =========================================================================
       PRODUCT SERVICES
       ========================================================================= */
    /**
     * List all products with advanced filtering and search pagination (public endpoint)
     */
    static async listProducts(filters) {
        const skip = (filters.page - 1) * filters.limit;
        // Build Prisma query condition block
        const where = {
            deletedAt: null,
        };
        if (!filters.includeInactive) {
            where.isActive = true;
        }
        // Category Filter (can be Slug or Category ID)
        if (filters.category) {
            where.category = {
                OR: [
                    { id: filters.category },
                    { slug: filters.category }
                ]
            };
        }
        // Search query (case-insensitive check against Product name/brand)
        if (filters.search) {
            where.OR = [
                { nameEn: { contains: filters.search, mode: "insensitive" } },
                { nameTa: { contains: filters.search, mode: "insensitive" } },
                { brand: { contains: filters.search, mode: "insensitive" } },
            ];
        }
        // Price Filtering (checks if any variant matches price range)
        if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
            where.variants = {
                some: {
                    deletedAt: null,
                    isActive: true,
                    AND: [
                        filters.minPrice !== undefined ? { price: { gte: filters.minPrice } } : {},
                        filters.maxPrice !== undefined ? { price: { lte: filters.maxPrice } } : {},
                    ],
                },
            };
        }
        // Configure Sorting
        let orderBy = {};
        if (filters.sortBy === "price") {
            // Sorting parent products by variant price (checks min variant price)
            orderBy = {
                variants: {
                    _count: filters.sortOrder,
                },
            };
        }
        else {
            orderBy = { [filters.sortBy]: filters.sortOrder };
        }
        // Fetch products
        const [products, total] = await Promise.all([
            db_js_1.default.product.findMany({
                where,
                include: {
                    category: {
                        select: { id: true, nameEn: true, slug: true },
                    },
                    variants: {
                        where: { deletedAt: null, isActive: true },
                        include: {
                            inventory: {
                                select: { availableQuantity: true },
                            },
                        },
                    },
                },
                orderBy,
                skip,
                take: filters.limit,
            }),
            db_js_1.default.product.count({ where }),
        ]);
        const pages = Math.ceil(total / filters.limit);
        return {
            products,
            pagination: {
                total,
                page: filters.page,
                limit: filters.limit,
                pages,
            },
        };
    }
    /**
     * Fetch single product detail by slug
     */
    static async getProductBySlug(slug) {
        const product = await db_js_1.default.product.findFirst({
            where: { slug, deletedAt: null },
            include: {
                category: true,
                variants: {
                    where: { deletedAt: null, isActive: true },
                    include: {
                        inventory: true,
                    },
                },
            },
        });
        if (!product) {
            throw api_error_js_1.ApiError.notFound("Product not found.");
        }
        return product;
    }
    /**
     * Create product and initial variants/inventories in a single transaction (admin function)
     */
    static async createProduct(data, userId) {
        const slug = toSlug(data.nameEn);
        // Verify slug uniqueness
        const existing = await db_js_1.default.product.findFirst({
            where: { slug, deletedAt: null },
        });
        if (existing) {
            throw api_error_js_1.ApiError.conflict("Product with this name slug already exists.");
        }
        // Run transaction
        const newProduct = await db_js_1.default.$transaction(async (tx) => {
            const product = await tx.product.create({
                data: {
                    categoryId: data.categoryId,
                    nameEn: data.nameEn,
                    nameTa: data.nameTa,
                    slug,
                    brand: data.brand,
                    descriptionEn: data.descriptionEn,
                    descriptionTa: data.descriptionTa,
                    thumbnailUrl: data.thumbnailUrl,
                },
            });
            for (const v of data.variants) {
                // Verify SKU uniqueness
                const existingSku = await tx.productVariant.findUnique({
                    where: { sku: v.sku },
                });
                if (existingSku) {
                    throw api_error_js_1.ApiError.conflict(`Variant SKU "${v.sku}" already exists.`);
                }
                const variant = await tx.productVariant.create({
                    data: {
                        productId: product.id,
                        nameEn: v.nameEn,
                        nameTa: v.nameTa,
                        sku: v.sku,
                        price: v.price,
                        discountPrice: v.discountPrice,
                        weight: v.weight,
                    },
                });
                // Initialize Inventory record
                await tx.inventory.create({
                    data: {
                        variantId: variant.id,
                        availableQuantity: v.availableQuantity,
                        minimumStock: 5,
                    },
                });
            }
            return product;
        });
        await db_js_1.default.auditLog.create({
            data: {
                userId,
                action: "CREATE_PRODUCT",
                entity: "Product",
                entityId: newProduct.id,
                newValue: JSON.parse(JSON.stringify(newProduct)),
            },
        }).catch(err => index_js_1.default.error("AuditLog creation failed:", err));
        index_js_1.default.info(`Product created: ${newProduct.nameEn} (ID: ${newProduct.id})`);
        return this.getProductBySlug(newProduct.slug);
    }
    /**
     * Update product properties (admin function)
     */
    static async updateProduct(id, data, userId) {
        const product = await db_js_1.default.product.findFirst({
            where: { id, deletedAt: null },
        });
        if (!product) {
            throw api_error_js_1.ApiError.notFound("Product not found.");
        }
        const updateData = { ...data };
        if (data.nameEn) {
            updateData.slug = toSlug(data.nameEn);
        }
        const updated = await db_js_1.default.product.update({
            where: { id },
            data: updateData,
        });
        await db_js_1.default.auditLog.create({
            data: {
                userId,
                action: "UPDATE_PRODUCT",
                entity: "Product",
                entityId: updated.id,
                oldValue: JSON.parse(JSON.stringify(product)),
                newValue: JSON.parse(JSON.stringify(updated)),
            },
        }).catch(err => index_js_1.default.error("AuditLog creation failed:", err));
        index_js_1.default.info(`Product updated: ${updated.nameEn} (ID: ${updated.id})`);
        return updated;
    }
    /**
     * Soft delete product (admin function)
     */
    static async deleteProduct(id, userId) {
        const product = await db_js_1.default.product.findFirst({
            where: { id, deletedAt: null },
        });
        if (!product) {
            throw api_error_js_1.ApiError.notFound("Product not found.");
        }
        await db_js_1.default.product.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        await db_js_1.default.auditLog.create({
            data: {
                userId,
                action: "DELETE_PRODUCT",
                entity: "Product",
                entityId: id,
                oldValue: JSON.parse(JSON.stringify(product)),
            },
        }).catch(err => index_js_1.default.error("AuditLog creation failed:", err));
        index_js_1.default.info(`Product soft deleted: ${product.nameEn} (ID: ${product.id})`);
        return true;
    }
    /* =========================================================================
       PRODUCT VARIANT SERVICES
       ========================================================================= */
    /**
     * Add standalone product variant (admin function)
     */
    static async createVariant(productId, data, userId) {
        const product = await db_js_1.default.product.findFirst({
            where: { id: productId, deletedAt: null },
        });
        if (!product) {
            throw api_error_js_1.ApiError.notFound("Parent product not found.");
        }
        const existingSku = await db_js_1.default.productVariant.findUnique({
            where: { sku: data.sku },
        });
        if (existingSku) {
            throw api_error_js_1.ApiError.conflict(`Variant SKU "${data.sku}" already exists.`);
        }
        const newVariant = await db_js_1.default.$transaction(async (tx) => {
            const variant = await tx.productVariant.create({
                data: {
                    productId,
                    nameEn: data.nameEn,
                    nameTa: data.nameTa,
                    sku: data.sku,
                    price: data.price,
                    discountPrice: data.discountPrice,
                    weight: data.weight,
                },
            });
            await tx.inventory.create({
                data: {
                    variantId: variant.id,
                    availableQuantity: data.availableQuantity,
                    minimumStock: 5,
                },
            });
            return variant;
        });
        await db_js_1.default.auditLog.create({
            data: {
                userId,
                action: "CREATE_VARIANT",
                entity: "ProductVariant",
                entityId: newVariant.id,
                newValue: JSON.parse(JSON.stringify(newVariant)),
            },
        }).catch(err => index_js_1.default.error("AuditLog creation failed:", err));
        index_js_1.default.info(`Product variant created: SKU ${newVariant.sku} (ID: ${newVariant.id})`);
        return newVariant;
    }
    /**
     * Update variant details (admin function)
     */
    static async updateVariant(id, data, userId) {
        const variant = await db_js_1.default.productVariant.findFirst({
            where: { id, deletedAt: null },
        });
        if (!variant) {
            throw api_error_js_1.ApiError.notFound("Product variant not found.");
        }
        if (data.sku && data.sku !== variant.sku) {
            const existingSku = await db_js_1.default.productVariant.findUnique({
                where: { sku: data.sku },
            });
            if (existingSku) {
                throw api_error_js_1.ApiError.conflict(`Variant SKU "${data.sku}" already exists.`);
            }
        }
        const updated = await db_js_1.default.productVariant.update({
            where: { id },
            data,
        });
        await db_js_1.default.auditLog.create({
            data: {
                userId,
                action: "UPDATE_VARIANT",
                entity: "ProductVariant",
                entityId: updated.id,
                oldValue: JSON.parse(JSON.stringify(variant)),
                newValue: JSON.parse(JSON.stringify(updated)),
            },
        }).catch(err => index_js_1.default.error("AuditLog creation failed:", err));
        index_js_1.default.info(`Product variant updated: SKU ${updated.sku} (ID: ${updated.id})`);
        return updated;
    }
    /**
     * Soft delete variant (admin function)
     */
    static async deleteVariant(id, userId) {
        const variant = await db_js_1.default.productVariant.findFirst({
            where: { id, deletedAt: null },
        });
        if (!variant) {
            throw api_error_js_1.ApiError.notFound("Product variant not found.");
        }
        await db_js_1.default.productVariant.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        await db_js_1.default.auditLog.create({
            data: {
                userId,
                action: "DELETE_VARIANT",
                entity: "ProductVariant",
                entityId: id,
                oldValue: JSON.parse(JSON.stringify(variant)),
            },
        }).catch(err => index_js_1.default.error("AuditLog creation failed:", err));
        index_js_1.default.info(`Product variant soft deleted: SKU ${variant.sku} (ID: ${variant.id})`);
        return true;
    }
}
exports.CmsService = CmsService;
