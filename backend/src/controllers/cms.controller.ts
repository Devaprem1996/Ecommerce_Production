import { Request, Response, NextFunction } from "express";
import { CmsService } from "../services/cms.service.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { ApiError } from "../exceptions/api-error.js";

export class CmsController {
  /* =========================================================================
     CATEGORY CONTROLLERS
     ========================================================================= */

  static async listCategories(req: Request, res: Response, next: NextFunction) {
    try {
      // Admins can toggle seeing inactive categories via query params
      const includeInactive = req.query.includeInactive === "true" && req.user?.role === "ADMIN";
      const categories = await CmsService.listCategories(includeInactive);

      return res.status(200).json({
        success: true,
        message: "Categories fetched successfully.",
        data: { categories },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const category = await CmsService.getCategoryBySlug(slug);

      return res.status(200).json({
        success: true,
        message: "Category details fetched successfully.",
        data: { category },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CmsService.createCategory(req.body);

      return res.status(201).json({
        success: true,
        message: "Category created successfully.",
        data: { category },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await CmsService.updateCategory(id, req.body);

      return res.status(200).json({
        success: true,
        message: "Category updated successfully.",
        data: { category },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await CmsService.deleteCategory(id);

      return res.status(200).json({
        success: true,
        message: "Category deleted successfully.",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /* =========================================================================
     PRODUCT CONTROLLERS
     ========================================================================= */

  static async listProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || "1", 10);
      const limit = parseInt(req.query.limit as string || "20", 10);
      const search = req.query.search as string || undefined;
      const category = req.query.category as string || undefined;
      const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
      const sortBy = (req.query.sortBy as any) || "createdAt";
      const sortOrder = (req.query.sortOrder as any) || "desc";
      const includeInactive = req.query.includeInactive === "true" && req.user?.role === "ADMIN";

      const result = await CmsService.listProducts({
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
    } catch (error) {
      next(error);
    }
  }

  static async getProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const product = await CmsService.getProductBySlug(slug);

      return res.status(200).json({
        success: true,
        message: "Product details fetched successfully.",
        data: { product },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await CmsService.createProduct(req.body);

      return res.status(201).json({
        success: true,
        message: "Product created successfully.",
        data: { product },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await CmsService.updateProduct(id, req.body);

      return res.status(200).json({
        success: true,
        message: "Product updated successfully.",
        data: { product },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await CmsService.deleteProduct(id);

      return res.status(200).json({
        success: true,
        message: "Product soft deleted successfully.",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /* =========================================================================
     PRODUCT VARIANT CONTROLLERS
     ========================================================================= */

  static async createVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.params;
      const variant = await CmsService.createVariant(productId, req.body);

      return res.status(201).json({
        success: true,
        message: "Variant added successfully.",
        data: { variant },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const variant = await CmsService.updateVariant(id, req.body);

      return res.status(200).json({
        success: true,
        message: "Variant updated successfully.",
        data: { variant },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await CmsService.deleteVariant(id);

      return res.status(200).json({
        success: true,
        message: "Variant soft deleted successfully.",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /* =========================================================================
     IMAGE UPLOAD CONTROLLER
     ========================================================================= */

  static async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw ApiError.badRequest("No image file uploaded.");
      }

      // Determine folder based on request body or default to "products"
      const folder = (req.body.folder as string) || "products";

      const imageUrl = await uploadToCloudinary(req.file.buffer, folder);

      return res.status(200).json({
        success: true,
        message: "Image uploaded successfully to Cloudinary.",
        data: { url: imageUrl },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
