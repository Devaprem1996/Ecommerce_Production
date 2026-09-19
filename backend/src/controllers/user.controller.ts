import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service.js";
import { ApiError } from "../exceptions/api-error.js";

export class UserController {
  /**
   * GET /api/v1/user/profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw ApiError.unauthorized("Authentication required.");
      }

      const user = await UserService.getProfile(userId);

      return res.status(200).json({
        success: true,
        message: "Profile fetched successfully.",
        data: { user },
        timestamp: new Date().toISOString(),
        requestId: req.headers["x-request-id"],
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/user/profile
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw ApiError.unauthorized("Authentication required.");
      }

      const { firstName, lastName, phone, dateOfBirth, gender, avatarUrl } = req.body;
      const profile = await UserService.updateProfile(userId, {
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
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/user/orders
   */
  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw ApiError.unauthorized("Authentication required.");
      }

      const orders = await UserService.getOrders(userId);

      return res.status(200).json({
        success: true,
        message: "Orders fetched successfully.",
        data: { orders },
        timestamp: new Date().toISOString(),
        requestId: req.headers["x-request-id"],
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/user/orders/:id
   */
  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw ApiError.unauthorized("Authentication required.");
      }

      const order = await UserService.getOrderById(userId, req.params.id);

      return res.status(200).json({
        success: true,
        message: "Order details fetched successfully.",
        data: { order },
        timestamp: new Date().toISOString(),
        requestId: req.headers["x-request-id"],
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/user/orders/:id/cancel
   */
  static async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw ApiError.unauthorized("Authentication required.");
      }

      const order = await UserService.cancelOrder(userId, req.params.id);

      return res.status(200).json({
        success: true,
        message: "Order cancelled successfully.",
        data: { order },
        timestamp: new Date().toISOString(),
        requestId: req.headers["x-request-id"],
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/user/addresses
   */
  static async getAddresses(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw ApiError.unauthorized("Authentication required.");
      }

      const addresses = await UserService.getAddresses(userId);

      return res.status(200).json({
        success: true,
        message: "Addresses fetched successfully.",
        data: { addresses },
        timestamp: new Date().toISOString(),
        requestId: req.headers["x-request-id"],
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/user/addresses
   */
  static async createAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw ApiError.unauthorized("Authentication required.");
      }

      const address = await UserService.createAddress(userId, req.body);

      return res.status(201).json({
        success: true,
        message: "Address created successfully.",
        data: { address },
        timestamp: new Date().toISOString(),
        requestId: req.headers["x-request-id"],
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/user/addresses/:id
   */
  static async updateAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw ApiError.unauthorized("Authentication required.");
      }

      const address = await UserService.updateAddress(userId, req.params.id, req.body);

      return res.status(200).json({
        success: true,
        message: "Address updated successfully.",
        data: { address },
        timestamp: new Date().toISOString(),
        requestId: req.headers["x-request-id"],
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/user/addresses/:id
   */
  static async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw ApiError.unauthorized("Authentication required.");
      }

      const result = await UserService.deleteAddress(userId, req.params.id);

      return res.status(200).json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString(),
        requestId: req.headers["x-request-id"],
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/user/addresses/:id/default
   */
  static async setDefaultAddress(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw ApiError.unauthorized("Authentication required.");
      }

      const result = await UserService.setDefaultAddress(userId, req.params.id);

      return res.status(200).json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString(),
        requestId: req.headers["x-request-id"],
      });
    } catch (error) {
      next(error);
    }
  }
}
