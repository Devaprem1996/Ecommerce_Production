import prisma from "../config/db.js";
import { ApiError } from "../exceptions/api-error.js";
import { DiscountType } from "@prisma/client";

export interface CouponValidationResult {
  valid: boolean;
  coupon: {
    id: string;
    code: string;
    discountType: DiscountType;
    discountValue: number;
    minOrderValue: number;
    maxDiscount: number | null;
  };
  discountAmount: number;
  newTotal: number;
  message: string;
}

export class CouponService {
  /**
   * Validate coupon code against database and calculate verified discount
   */
  static async validateCoupon(
    rawCode: string,
    subtotal: number
  ): Promise<CouponValidationResult> {
    if (!rawCode || typeof rawCode !== "string") {
      throw ApiError.badRequest("Coupon code is required.");
    }

    const code = rawCode.toUpperCase().trim();
    if (!code) {
      throw ApiError.badRequest("Coupon code is required.");
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      throw ApiError.badRequest(`Coupon code "${code}" is invalid.`);
    }

    if (!coupon.isActive) {
      throw ApiError.badRequest(`Coupon "${code}" is currently inactive.`);
    }

    const now = new Date();
    if (now < coupon.startDate) {
      throw ApiError.badRequest(`Coupon "${code}" is not yet active.`);
    }

    if (now > coupon.endDate) {
      throw ApiError.badRequest(`Coupon "${code}" has expired.`);
    }

    const minOrder = Number(coupon.minOrderValue || 0);
    if (subtotal < minOrder) {
      throw ApiError.badRequest(
        `Minimum order value of ₹${minOrder} is required to apply "${code}". (Current cart: ₹${subtotal})`
      );
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw ApiError.badRequest(
        `Coupon "${code}" has reached its maximum usage limit.`
      );
    }

    // Calculate verified discount
    let discount = 0;
    const discountVal = Number(coupon.discountValue);
    const maxDiscount = coupon.maxDiscount ? Number(coupon.maxDiscount) : null;

    if (coupon.discountType === DiscountType.PERCENTAGE) {
      discount = Math.round((subtotal * discountVal) / 100);
      if (maxDiscount !== null && maxDiscount > 0) {
        discount = Math.min(discount, maxDiscount);
      }
    } else {
      // FIXED_AMOUNT
      discount = Math.min(discountVal, subtotal);
    }

    const newTotal = Math.max(0, subtotal - discount);

    return {
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: discountVal,
        minOrderValue: minOrder,
        maxDiscount,
      },
      discountAmount: discount,
      newTotal,
      message: `Coupon "${coupon.code}" applied! You save ₹${discount}.`,
    };
  }

  /**
   * List active promotional coupons visible to customers
   */
  static async listActiveCoupons() {
    const now = new Date();
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      select: {
        id: true,
        code: true,
        discountType: true,
        discountValue: true,
        minOrderValue: true,
        maxDiscount: true,
        endDate: true,
      },
      orderBy: { discountValue: "desc" },
    });

    return coupons.map((c) => ({
      id: c.id,
      code: c.code,
      discountType: c.discountType,
      discountValue: Number(c.discountValue),
      minOrderValue: Number(c.minOrderValue),
      maxDiscount: c.maxDiscount ? Number(c.maxDiscount) : null,
      validUntil: c.endDate,
    }));
  }
}
