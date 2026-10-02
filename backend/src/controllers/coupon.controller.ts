import { Request, Response, NextFunction } from "express";
import { CouponService } from "../services/coupon.service.js";

export class CouponController {
  /**
   * POST /api/v1/coupons/validate
   * Validates a promotional coupon code entered by customer and returns verified discount
   */
  static async validateCoupon(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, subtotal } = req.body;
      const numSubtotal = Number(subtotal || 0);

      const result = await CouponService.validateCoupon(code, numSubtotal);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/coupons/active
   * Retrieves public active promotional coupons
   */
  static async getActiveCoupons(req: Request, res: Response, next: NextFunction) {
    try {
      const coupons = await CouponService.listActiveCoupons();

      return res.status(200).json({
        success: true,
        data: { coupons },
      });
    } catch (error) {
      next(error);
    }
  }
}
