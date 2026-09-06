import { Request, Response, NextFunction } from "express";
import { ShippingService } from "../services/shipping.service.js";

export class ShippingController {
  /**
   * Check serviceability for a given pincode
   */
  static async checkPincode(req: Request, res: Response, next: NextFunction) {
    try {
      const { pincode } = req.params;
      const subtotal = req.query.subtotal ? parseFloat(req.query.subtotal as string) : 0;

      const result = await ShippingService.checkPincode(pincode, subtotal);

      return res.status(200).json({
        success: true,
        message: "Pincode serviceability checked successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all pincodes (admin function)
   */
  static async listPincodes(req: Request, res: Response, next: NextFunction) {
    try {
      const pincodes = await ShippingService.listPincodes();

      return res.status(200).json({
        success: true,
        message: "Pincodes fetched successfully.",
        data: { pincodes },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
