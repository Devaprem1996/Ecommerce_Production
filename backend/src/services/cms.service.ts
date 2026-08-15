import prisma from "../config/db.js";
import { ApiError } from "../exceptions/api-error.js";
import logger from "../logger/index.js";

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export class CmsService {
  /* =========================================================================
     CATEGORY SERVICES
     ========================================================================= */

  /**
   * List all categories (public endpoint)
   */
  static async listCategories(includeInactive = false) {
    return await prisma.category.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
  }

  /**
   * Fetch category detail by slug
   */
  static async getCategoryBySlug(slug: string) {
    const category = await prisma.category.findUnique({
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
      throw ApiError.notFound("Category not found.");
    }
    return category;
  }

  /**
   * Create a new category (admin function)
   */
  static async createCategory(data: {
    nameEn: string;
    nameTa: string;
    descriptionEn?: string;
    descriptionTa?: string;
    imageUrl?: string;
    sortOrder?: number;
  }) {
    const slug = toSlug(data.nameEn);

    const existing = await prisma.category.findUnique({
      where: { slug },
    });
    if (existing) {
      throw ApiError.conflict("Category with this name slug already exists.");
    }

    const category = await prisma.category.create({
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

    logger.info(`Category created: ${category.nameEn} (ID: ${category.id})`);
    return category;
  }

  /**
   * Update category properties (admin function)
   */
  static async updateCategory(
    id: string,
    data: {
      nameEn?: string;
      nameTa?: string;
      descriptionEn?: string;
      descriptionTa?: string;
      imageUrl?: string;
      sortOrder?: number;
      isActive?: boolean;
    }
  ) {
    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw ApiError.notFound("Category not found.");
    }

    const updateData: any = { ...data };
    if (data.nameEn) {
      updateData.slug = toSlug(data.nameEn);
    }

    const updated = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    logger.info(`Category updated: ${updated.nameEn} (ID: ${updated.id})`);
    return updated;
  }

  /**
   * Delete category (admin function)
   */
  static async deleteCategory(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      throw ApiError.notFound("Category not found.");
    }

    if (category._count.products > 0) {
      // Disallow deleting category if it has linked products to protect database referential integrity
      throw ApiError.badRequest("Cannot delete category containing products. De-associate products first.");
    }

    await prisma.category.delete({
      where: { id },
    });

    logger.info(`Category deleted: ${category.nameEn} (ID: ${category.id})`);
    return true;
  }

  /* =========================================================================
     PRODUCT SERVICES
     ========================================================================= */

  /**
   * List all products with advanced filtering and search pagination (public endpoint)
   */
  static async listProducts(filters: {
    page: number;
    limit: number;
    search?: string;
    category?: string; // slug or ID
    minPrice?: number;
    maxPrice?: number;
    sortBy: "price" | "createdAt" | "nameEn";
    sortOrder: "asc" | "desc";
    includeInactive?: boolean;
  }) {
    const skip = (filters.page - 1) * filters.limit;

    // Build Prisma query condition block
    const where: any = {
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
    let orderBy: any = {};
    if (filters.sortBy === "price") {
      // Sorting parent products by variant price (checks min variant price)
      orderBy = {
        variants: {
          _count: filters.sortOrder,
        },
      };
    } else {
      orderBy = { [filters.sortBy]: filters.sortOrder };
    }

    // Fetch products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
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
      prisma.product.count({ where }),
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
  static async getProductBySlug(slug: string) {
    const product = await prisma.product.findFirst({
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
      throw ApiError.notFound("Product not found.");
    }
    return product;
  }

  /**
   * Create product and initial variants/inventories in a single transaction (admin function)
   */
  static async createProduct(data: {
    categoryId: string;
    nameEn: string;
    nameTa: string;
    brand: string;
    descriptionEn: string;
    descriptionTa: string;
    thumbnailUrl?: string;
    variants: Array<{
      nameEn: string;
      nameTa: string;
      sku: string;
      price: number;
      discountPrice?: number;
      weight?: number;
      availableQuantity: number;
    }>;
  }) {
    const slug = toSlug(data.nameEn);

    // Verify slug uniqueness
    const existing = await prisma.product.findFirst({
      where: { slug, deletedAt: null },
    });
    if (existing) {
      throw ApiError.conflict("Product with this name slug already exists.");
    }

    // Run transaction
    const newProduct = await prisma.$transaction(async (tx) => {
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
          throw ApiError.conflict(`Variant SKU "${v.sku}" already exists.`);
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

    logger.info(`Product created: ${newProduct.nameEn} (ID: ${newProduct.id})`);
    return this.getProductBySlug(newProduct.slug);
  }

  /**
   * Update product properties (admin function)
   */
  static async updateProduct(
    id: string,
    data: {
      categoryId?: string;
      nameEn?: string;
      nameTa?: string;
      brand?: string;
      descriptionEn?: string;
      descriptionTa?: string;
      thumbnailUrl?: string;
      isActive?: boolean;
    }
  ) {
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
    });

    if (!product) {
      throw ApiError.notFound("Product not found.");
    }

    const updateData: any = { ...data };
    if (data.nameEn) {
      updateData.slug = toSlug(data.nameEn);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    logger.info(`Product updated: ${updated.nameEn} (ID: ${updated.id})`);
    return updated;
  }

  /**
   * Soft delete product (admin function)
   */
  static async deleteProduct(id: string) {
    const product = await prisma.product.findFirst({
      where: { id, deletedAt: null },
    });

    if (!product) {
      throw ApiError.notFound("Product not found.");
    }

    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info(`Product soft deleted: ${product.nameEn} (ID: ${product.id})`);
    return true;
  }

  /* =========================================================================
     PRODUCT VARIANT SERVICES
     ========================================================================= */

  /**
   * Add standalone product variant (admin function)
   */
  static async createVariant(
    productId: string,
    data: {
      nameEn: string;
      nameTa: string;
      sku: string;
      price: number;
      discountPrice?: number;
      weight?: number;
      availableQuantity: number;
    }
  ) {
    const product = await prisma.product.findFirst({
      where: { id: productId, deletedAt: null },
    });
    if (!product) {
      throw ApiError.notFound("Parent product not found.");
    }

    const existingSku = await prisma.productVariant.findUnique({
      where: { sku: data.sku },
    });
    if (existingSku) {
      throw ApiError.conflict(`Variant SKU "${data.sku}" already exists.`);
    }

    const newVariant = await prisma.$transaction(async (tx) => {
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

    logger.info(`Product variant created: SKU ${newVariant.sku} (ID: ${newVariant.id})`);
    return newVariant;
  }

  /**
   * Update variant details (admin function)
   */
  static async updateVariant(
    id: string,
    data: {
      nameEn?: string;
      nameTa?: string;
      sku?: string;
      price?: number;
      discountPrice?: number;
      weight?: number;
      isActive?: boolean;
    }
  ) {
    const variant = await prisma.productVariant.findFirst({
      where: { id, deletedAt: null },
    });
    if (!variant) {
      throw ApiError.notFound("Product variant not found.");
    }

    if (data.sku && data.sku !== variant.sku) {
      const existingSku = await prisma.productVariant.findUnique({
        where: { sku: data.sku },
      });
      if (existingSku) {
        throw ApiError.conflict(`Variant SKU "${data.sku}" already exists.`);
      }
    }

    const updated = await prisma.productVariant.update({
      where: { id },
      data,
    });

    logger.info(`Product variant updated: SKU ${updated.sku} (ID: ${updated.id})`);
    return updated;
  }

  /**
   * Soft delete variant (admin function)
   */
  static async deleteVariant(id: string) {
    const variant = await prisma.productVariant.findFirst({
      where: { id, deletedAt: null },
    });
    if (!variant) {
      throw ApiError.notFound("Product variant not found.");
    }

    await prisma.productVariant.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info(`Product variant soft deleted: SKU ${variant.sku} (ID: ${variant.id})`);
    return true;
  }
}
