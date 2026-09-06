import prisma from "../config/db.js";
import { ApiError } from "../exceptions/api-error.js";
import logger from "../logger/index.js";

export class ShippingService {
  /**
   * Check pincode serviceability and return estimated shipping cost & delivery timeline
   */
  static async checkPincode(pincode: string, orderSubtotal: number = 0) {
    if (!pincode || pincode.trim().length !== 6) {
      throw ApiError.badRequest("Invalid pincode format. Please provide a 6-digit Indian pincode.");
    }

    const record = await prisma.pincode.findUnique({
      where: { pincode: pincode.trim() },
    });

    if (!record || !record.available) {
      return {
        serviceable: false,
        pincode: pincode.trim(),
        message: "Delivery is currently unavailable for this pincode.",
      };
    }

    const freeThreshold = Number(record.freeDeliveryThreshold);
    const standardCharge = Number(record.shippingCharge);

    // Calculate shipping charge based on order subtotal threshold
    const shippingCharge = orderSubtotal >= freeThreshold ? 0 : standardCharge;

    logger.info(`Pincode check: ${pincode} - Serviceable (${record.city}, ${record.state})`);

    return {
      serviceable: true,
      pincode: record.pincode,
      city: record.city,
      state: record.state,
      estimatedDays: record.estimatedDays,
      shippingCharge,
      freeDeliveryThreshold: freeThreshold,
      isFreeDelivery: shippingCharge === 0,
    };
  }

  /**
   * List all serviceable pincodes (admin function)
   */
  static async listPincodes() {
    return await prisma.pincode.findMany({
      orderBy: { pincode: "asc" },
    });
  }
}
