import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service.js";
import { ApiError } from "../exceptions/api-error.js";

export class PaymentController {
  /**
   * Create Razorpay payment order
   */
  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.body;
      const userId = req.user?.userId;

      if (!orderId) {
        throw ApiError.badRequest("Order ID is required.");
      }
      if (!userId) {
        throw ApiError.unauthorized("Authentication required.");
      }

      const result = await PaymentService.createPaymentOrder(orderId, userId);

      return res.status(200).json({
        success: true,
        message: "Razorpay payment order created successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify checkout payment signature
   */
  static async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        throw ApiError.badRequest("Missing required payment verification parameters.");
      }

      const result = await PaymentService.verifyPayment({
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Razorpay webhook notifications
   */
  static async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers["x-razorpay-signature"] as string;
      if (!signature) {
        throw ApiError.badRequest("Missing Razorpay signature header.");
      }

      const rawBody = (req as any).rawBody || JSON.stringify(req.body);
      const result = await PaymentService.handleWebhook(rawBody, signature);

      return res.status(200).json({
        success: true,
        message: "Webhook processed.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
