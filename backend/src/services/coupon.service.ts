import prisma from "../config/db.js";
import { ApiError } from "../exceptions/api-error.js";
import { DiscountType, OrderStatus } from "@prisma/client";

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
   * Enforces 1-time usage per customer across active orders
   */
  static async validateCoupon(
    rawCode: string,
    subtotal: number,
    userId?: string,
    userPhone?: string
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

    // Enforce 1-Time Usage Per Customer: check by authenticated User ID
    if (userId) {
      const priorOrder = await prisma.order.findFirst({
        where: {
          userId,
          couponId: coupon.id,
          status: {
            notIn: [OrderStatus.CANCELLED, OrderStatus.DRAFT],
          },
        },
      });

      if (priorOrder) {
        throw ApiError.badRequest(
          `You have already used coupon "${coupon.code}". Each coupon can only be used once per customer.`
        );
      }
    }

    // Enforce 1-Time Usage Per Customer: check by customer mobile number
    if (userPhone) {
      const cleanPhone = userPhone.replace(/\D/g, "").slice(-10);
      if (cleanPhone.length === 10) {
        const priorOrderByPhone = await prisma.order.findFirst({
          where: {
            couponId: coupon.id,
            status: {
              notIn: [OrderStatus.CANCELLED, OrderStatus.DRAFT],
            },
            address: {
              phone: { endsWith: cleanPhone },
            },
          },
        });

        if (priorOrderByPhone) {
          throw ApiError.badRequest(
            `Coupon "${coupon.code}" has already been used for this mobile number (+91 ${cleanPhone}). Each coupon can only be used once per customer.`
          );
        }
      }
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
