import { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/admin.service.js";

export class AdminController {
  /**
   * Get live admin dashboard overview metrics and aggregations
   */
  static async getDashboardOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getDashboardOverview();

      return res.status(200).json({
        success: true,
        message: "Admin dashboard overview retrieved successfully.",
        data,
        timestamp: new Date().toISOString(),
        requestId: req.headers["x-request-id"] || "N/A",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Orders
   */
  static async listOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, search, page, limit } = req.query;
      const data = await AdminService.listOrders({
        status: status as string,
        search: search as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      return res.status(200).json({
        success: true,
        message: "Orders retrieved successfully.",
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, courierPartner, trackingNumber, trackingUrl } = req.body;
      const data = await AdminService.updateOrderStatus(id, status, {
        courierPartner,
        trackingNumber,
        trackingUrl,
      });

      return res.status(200).json({
        success: true,
        message: "Order status updated successfully.",
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Coupons
   */
  static async listCoupons(req: Request, res: Response, next: NextFunction) {
    try {
      const coupons = await AdminService.listCoupons();
      return res.status(200).json({
        success: true,
        message: "Coupons retrieved successfully.",
        data: { coupons },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const coupon = await AdminService.createCoupon(req.body);
      return res.status(201).json({
        success: true,
        message: "Coupon created successfully.",
        data: { coupon },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const coupon = await AdminService.toggleCoupon(id);
      return res.status(200).json({
        success: true,
        message: "Coupon status toggled successfully.",
        data: { coupon },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await AdminService.deleteCoupon(id);
      return res.status(200).json({
        success: true,
        message: "Coupon deleted successfully.",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Pincodes
   */
  static async createPincode(req: Request, res: Response, next: NextFunction) {
    try {
      const pincode = await AdminService.createPincode(req.body);
      return res.status(201).json({
        success: true,
        message: "Pincode created successfully.",
        data: { pincode },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async updatePincode(req: Request, res: Response, next: NextFunction) {
    try {
      const { pincode } = req.params;
      const updated = await AdminService.updatePincode(pincode, req.body);
      return res.status(200).json({
        success: true,
        message: "Pincode updated successfully.",
        data: { pincode: updated },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async deletePincode(req: Request, res: Response, next: NextFunction) {
    try {
      const { pincode } = req.params;
      await AdminService.deletePincode(pincode);
      return res.status(200).json({
        success: true,
        message: "Pincode deleted successfully.",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Customers / Users Management
   */
  static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, role, page, limit } = req.query;
      const data = await AdminService.listUsers({
        search: search as string,
        role: role as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      return res.status(200).json({
        success: true,
        message: "Users retrieved successfully.",
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await AdminService.getUserDetail(id);

      return res.status(200).json({
        success: true,
        message: "User details retrieved successfully.",
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await AdminService.toggleUserStatus(id);

      return res.status(200).json({
        success: true,
        message: `User status changed to ${user.isActive ? "active" : "inactive"}.`,
        data: { user },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Payments & Transactions
   */
  static async listPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, status, provider, page, limit } = req.query;
      const data = await AdminService.listPayments({
        search: search as string,
        status: status as string,
        provider: provider as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      return res.status(200).json({
        success: true,
        message: "Payment transactions retrieved successfully.",
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyCodPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = await AdminService.verifyCodPayment(id);

      return res.status(200).json({
        success: true,
        message: "COD payment verified and collected successfully.",
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Pending Actions & Live Operational Alerts
   */
  static async getPendingActions(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getPendingActions();

      return res.status(200).json({
        success: true,
        message: "Operational pending actions retrieved successfully.",
        data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
