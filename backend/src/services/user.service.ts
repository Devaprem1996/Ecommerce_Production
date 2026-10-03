import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import { ApiError } from "../exceptions/api-error.js";
import { OrderStatus, PaymentStatus, DiscountType } from "@prisma/client";
import { SmsService, verifyOrderTrackingToken } from "./sms.service.js";
import { EmailService } from "./email.service.js";
import { PaymentService } from "./payment.service.js";
import { AuthService } from "./auth.service.js";
import logger from "../logger/index.js";

export class UserService {
  /**
   * Get user profile and active addresses
   */
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        addresses: {
          where: { deletedAt: null },
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
      },
    });

    if (!user || !user.isActive) {
      throw ApiError.unauthorized("User account not found or deactivated.");
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update profile fields (first name, last name, phone, dob, gender, avatar)
   */
  static async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      dateOfBirth?: string | null;
      gender?: string | null;
      avatarUrl?: string | null;
    }
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw ApiError.unauthorized("User session invalid.");
    }

    let cleanPhone: string | null | undefined = undefined;
    if (data.phone !== undefined) {
      if (data.phone) {
        cleanPhone = data.phone.replace(/\D/g, "").slice(-10);
        if (cleanPhone.length !== 10) {
          throw ApiError.badRequest("Please provide a valid 10-digit mobile number.");
        }
        // Verify phone is not in use by another user
        const conflict = await prisma.user.findFirst({
          where: {
            phone: cleanPhone,
            id: { not: userId },
            deletedAt: null,
          },
        });
        if (conflict) {
          throw ApiError.badRequest(
            "This phone number is already registered to another account."
          );
        }
      } else {
        cleanPhone = null;
      }
    }

    return await prisma.$transaction(async (tx) => {
      if (cleanPhone !== undefined) {
        await tx.user.update({
          where: { id: userId },
          data: { phone: cleanPhone },
        });
      }

      const profile = await tx.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          firstName: data.firstName || "Customer",
          lastName: data.lastName || "",
          phone: cleanPhone !== undefined ? cleanPhone : null,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          gender: data.gender || null,
          avatarUrl: data.avatarUrl || null,
        },
        update: {
          ...(data.firstName !== undefined && { firstName: data.firstName }),
          ...(data.lastName !== undefined && { lastName: data.lastName }),
          ...(cleanPhone !== undefined && { phone: cleanPhone }),
          ...(data.dateOfBirth !== undefined && {
            dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          }),
          ...(data.gender !== undefined && { gender: data.gender }),
          ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        },
      });

      return profile;
    });
  }

  /**
   * Get all orders placed by the customer
   */
  static async getOrders(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, phone: true },
    });

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId },
          ...(user?.phone ? [{ address: { phone: user.phone } }] : []),
        ],
        deletedAt: null,
      },
      include: {
        orderItems: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    nameEn: true,
                    nameTa: true,
                    slug: true,
                    thumbnailUrl: true,
                    brand: true,
                  },
                },
              },
            },
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return orders;
  }

  /**
   * Get detailed order by ID for the customer
   */
  static async getOrderById(userId: string, orderId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, phone: true },
    });

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        OR: [
          { userId },
          ...(user?.phone ? [{ address: { phone: user.phone } }] : []),
        ],
        deletedAt: null,
      },
      include: {
        orderItems: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
        address: true,
        coupon: true,
      },
    });

    if (!order) {
      throw ApiError.notFound("Order not found or access denied.");
    }

    return order;
  }

  /**
   * Cancel an order (customer or admin initiated)
   * Restores product inventory and triggers automatic Razorpay refund if paid online
   */
  static async cancelOrder(
    userId: string | null | undefined,
    orderId: string,
    reason: string = "Customer Cancellation"
  ) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        ...(userId ? { userId } : {}),
        deletedAt: null,
      },
      include: {
        orderItems: true,
        payments: true,
        user: { include: { profile: true } },
        address: true,
      },
    });

    if (!order) {
      throw ApiError.notFound("Order not found or access denied.");
    }

    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.REFUNDED
    ) {
      throw ApiError.badRequest("Order has already been cancelled.");
    }

    const nonCancellableStatuses: OrderStatus[] = [
      OrderStatus.SHIPPED,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.DELIVERED,
      OrderStatus.RETURNED,
    ];

    if (nonCancellableStatuses.includes(order.status)) {
      throw ApiError.badRequest(
        `Order is currently in '${order.status}' status and cannot be cancelled directly. Please initiate a return request if the package has shipped or been delivered.`
      );
    }

    // Identify if there is a successful online payment to refund
    const successfulOnlinePayment = order.payments.find(
      (p) =>
        (p.provider === "razorpay" || p.provider === "online") &&
        (p.status === PaymentStatus.SUCCESSFUL ||
          p.status === PaymentStatus.CAPTURED) &&
        Boolean(p.providerPaymentId)
    );

    let refundDetails: any = null;
    let refundAmount: number = 0;

    // Trigger Razorpay refund via official API if online payment was captured
    if (successfulOnlinePayment && successfulOnlinePayment.providerPaymentId) {
      try {
        const amountInPaise = Math.round(
          Number(successfulOnlinePayment.amount) * 100
        );
        refundAmount = Number(successfulOnlinePayment.amount);
        refundDetails = await PaymentService.refundPayment({
          paymentId: successfulOnlinePayment.providerPaymentId,
          amountInPaise,
          notes: {
            order_id: order.id,
            order_number: order.orderNumber,
            reason: reason.slice(0, 255),
          },
          reason: reason.slice(0, 255),
        });
      } catch (err: any) {
        logger.error(
          `Failed to process Razorpay refund for Order ${order.id}:`,
          err
        );
        throw ApiError.internal(
          `Failed to process payment gateway refund: ${err.message}`
        );
      }
    }

    // Database transaction: Restore inventory and update order/payment statuses
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // 1. Restore product inventory
      for (const item of order.orderItems) {
        if (item.variantId) {
          await tx.inventory.updateMany({
            where: { variantId: item.variantId },
            data: {
              availableQuantity: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      // 2. Update payment records
      if (successfulOnlinePayment) {
        await tx.payment.update({
          where: { id: successfulOnlinePayment.id },
          data: {
            status: PaymentStatus.REFUNDED,
            failureReason: refundDetails?.refundId
              ? `Refund ID: ${refundDetails.refundId}`
              : "Refund processed on order cancellation",
          },
        });
      } else {
        await tx.payment.updateMany({
          where: { orderId },
          data: {
            status: PaymentStatus.CANCELLED,
            failureReason: reason.slice(0, 255),
          },
        });
      }

      // 2b. Restore coupon used count if order had a coupon
      if (order.couponId) {
        await tx.coupon.update({
          where: { id: order.couponId },
          data: {
            usedCount: { decrement: 1 },
          },
        });
      }

      // 3. Update order status
      return await tx.order.update({
        where: { id: orderId },
        data: {
          status: successfulOnlinePayment
            ? OrderStatus.REFUNDED
            : OrderStatus.CANCELLED,
        },
        include: {
          orderItems: true,
          payments: true,
          address: true,
        },
      });
    }, { maxWait: 15000, timeout: 20000 });

    // 4. Asynchronously notify customer
    const customerPhone = order.address?.phone || order.user?.phone;
    if (customerPhone) {
      SmsService.sendOrderCancelled({
        phone: customerPhone,
        orderNumber: order.orderNumber,
        refundAmount: refundAmount > 0 ? refundAmount : null,
      }).catch((err) => logger.error("Failed to send cancellation SMS:", err));
    }

    const customerEmail = order.user?.email;
    if (customerEmail && !customerEmail.endsWith(".local")) {
      const customerName =
        `${order.user?.profile?.firstName || ""} ${
          order.user?.profile?.lastName || ""
        }`.trim() ||
        order.address?.fullName ||
        "Customer";
      EmailService.sendOrderCancelled(
        customerEmail,
        order.orderNumber,
        refundAmount > 0 ? refundAmount : null,
        customerName
      ).catch((err) =>
        logger.error("Failed to send cancellation Email:", err)
      );
    }

    return updatedOrder;
  }

  /**
   * Get all active addresses for the customer
   */
  static async getAddresses(userId: string) {
    return await prisma.address.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  }

  /**
   * Create a new address for the customer
   */
  static async createAddress(
    userId: string,
    data: {
      fullName: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string | null;
      city: string;
      state: string;
      postalCode: string;
      country?: string;
      landmark?: string | null;
      isDefault?: boolean;
    }
  ) {
    return await prisma.$transaction(async (tx) => {
      const activeCount = await tx.address.count({
        where: { userId, deletedAt: null },
      });

      if (activeCount >= 10) {
        throw ApiError.badRequest("Maximum limit of 10 addresses reached.");
      }

      const shouldBeDefault = data.isDefault || activeCount === 0;

      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      return await tx.address.create({
        data: {
          userId,
          fullName: data.fullName,
          phone: data.phone,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2 || null,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country || "India",
          landmark: data.landmark || null,
          isDefault: shouldBeDefault,
        },
      });
    });
  }

  /**
   * Update an existing address for the customer
   */
  static async updateAddress(
    userId: string,
    addressId: string,
    data: {
      fullName?: string;
      phone?: string;
      addressLine1?: string;
      addressLine2?: string | null;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      landmark?: string | null;
      isDefault?: boolean;
    }
  ) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId, deletedAt: null },
    });

    if (!existing) {
      throw ApiError.notFound("Address not found.");
    }

    return await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId, id: { not: addressId } },
          data: { isDefault: false },
        });
      }

      return await tx.address.update({
        where: { id: addressId },
        data: {
          ...(data.fullName !== undefined && { fullName: data.fullName }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.addressLine1 !== undefined && { addressLine1: data.addressLine1 }),
          ...(data.addressLine2 !== undefined && { addressLine2: data.addressLine2 }),
          ...(data.city !== undefined && { city: data.city }),
          ...(data.state !== undefined && { state: data.state }),
          ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
          ...(data.country !== undefined && { country: data.country }),
          ...(data.landmark !== undefined && { landmark: data.landmark }),
          ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
        },
      });
    });
  }

  /**
   * Soft-delete an address
   */
  static async deleteAddress(userId: string, addressId: string) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId, deletedAt: null },
    });

    if (!existing) {
      throw ApiError.notFound("Address not found.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.update({
        where: { id: addressId },
        data: { deletedAt: new Date(), isDefault: false },
      });

      if (existing.isDefault) {
        const nextAddress = await tx.address.findFirst({
          where: { userId, deletedAt: null, id: { not: addressId } },
          orderBy: { createdAt: "desc" },
        });

        if (nextAddress) {
          await tx.address.update({
            where: { id: nextAddress.id },
            data: { isDefault: true },
          });
        }
      }
    });

    return { message: "Address deleted successfully." };
  }

  /**
   * Mark address as default
   */
  static async setDefaultAddress(userId: string, addressId: string) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId, deletedAt: null },
    });

    if (!existing) {
      throw ApiError.notFound("Address not found.");
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });

      await tx.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      });
    });

    return { message: "Default address updated successfully." };
  }

  /**
   * Create a new order for authenticated customer
   */
  static async createOrder(
    userId: string,
    data: {
      addressId?: string;
      shippingAddress?: {
        name: string;
        mobile: string;
        addressLine1: string;
        addressLine2?: string | null;
        city: string;
        state: string;
        pincode: string;
      };
      items: Array<{
        productId?: string;
        variantId?: string;
        productName?: string;
        price?: number;
        quantity?: number;
      }>;
      paymentMethod?: string;
      couponCode?: string;
    }
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw ApiError.unauthorized("User session invalid.");
    }

    if (!data.items || data.items.length === 0) {
      throw ApiError.badRequest("Cannot place order with an empty cart.");
    }

    // 1. Resolve Address
    let addressId = data.addressId;
    if (!addressId && data.shippingAddress) {
      const createdAddr = await prisma.address.create({
        data: {
          userId,
          fullName: data.shippingAddress.name,
          phone: data.shippingAddress.mobile,
          addressLine1: data.shippingAddress.addressLine1,
          addressLine2: data.shippingAddress.addressLine2 || null,
          city: data.shippingAddress.city,
          state: data.shippingAddress.state,
          postalCode: data.shippingAddress.pincode,
          country: "India",
          isDefault: false,
        },
      });
      addressId = createdAddr.id;
    }

    if (!addressId) {
      const defaultAddr = await prisma.address.findFirst({
        where: { userId, deletedAt: null },
        orderBy: { isDefault: "desc" },
      });
      if (defaultAddr) {
        addressId = defaultAddr.id;
      } else {
        throw ApiError.badRequest("Delivery address is required to place an order.");
      }
    }

    // 2. Resolve Variants and Line Items
    let subtotalSum = 0;
    const resolvedItems: Array<{
      variantId: string;
      productName: string;
      sku: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      tax: number;
      subtotal: number;
    }> = [];

    for (const item of data.items) {
      let variant = null;
      if (item.variantId) {
        variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });
      }

      if (!variant && item.productId) {
        variant = await prisma.productVariant.findFirst({
          where: { productId: item.productId, deletedAt: null },
          include: { product: true },
        });
      }

      if (!variant) {
        variant = await prisma.productVariant.findFirst({
          where: { deletedAt: null },
          include: { product: true },
        });
      }

      if (!variant) {
        throw ApiError.badRequest("Unable to resolve catalog product variant.");
      }

      // Strictly compute unitPrice from verified database catalog pricing (never trust client-supplied price)
      const verifiedUnitPrice = variant.discountPrice
        ? Number(variant.discountPrice)
        : Number(variant.price);
      const originalPrice = Number(variant.price);
      const unitDiscount = variant.discountPrice
        ? Math.max(0, originalPrice - Number(variant.discountPrice))
        : 0;

      const quantity = Math.max(1, item.quantity || 1);
      const lineSubtotal = verifiedUnitPrice * quantity;
      subtotalSum += lineSubtotal;

      resolvedItems.push({
        variantId: variant.id,
        productName: variant.product?.nameEn || variant.nameEn || item.productName || "Product",
        sku: variant.sku || `SKU-${variant.id.slice(0, 6).toUpperCase()}`,
        quantity,
        unitPrice: verifiedUnitPrice,
        discount: unitDiscount * quantity,
        tax: 0,
        subtotal: lineSubtotal,
      });
    }

    // 2b. Database-Verified Coupon Application
    let appliedCouponRecord: any = null;
    let couponDiscount = 0;

    if (data.couponCode && typeof data.couponCode === "string" && data.couponCode.trim()) {
      const cleanCoupon = data.couponCode.toUpperCase().trim();
      const foundCoupon = await prisma.coupon.findUnique({
        where: { code: cleanCoupon },
      });

      if (!foundCoupon) {
        throw ApiError.badRequest(`Coupon "${cleanCoupon}" does not exist.`);
      }
      if (!foundCoupon.isActive) {
        throw ApiError.badRequest(`Coupon "${cleanCoupon}" is currently inactive.`);
      }

      const now = new Date();
      if (now < foundCoupon.startDate) {
        throw ApiError.badRequest(`Coupon "${cleanCoupon}" is not yet active.`);
      }
      if (now > foundCoupon.endDate) {
        throw ApiError.badRequest(`Coupon "${cleanCoupon}" has expired.`);
      }

      const minOrder = Number(foundCoupon.minOrderValue || 0);
      if (subtotalSum < minOrder) {
        throw ApiError.badRequest(
          `Minimum order value of ₹${minOrder} is required to apply "${cleanCoupon}". Current subtotal is ₹${subtotalSum}.`
        );
      }

      if (foundCoupon.usageLimit !== null && foundCoupon.usedCount >= foundCoupon.usageLimit) {
        throw ApiError.badRequest(
          `Coupon "${cleanCoupon}" has reached its maximum usage limit.`
        );
      }

      // Enforce 1-Time Usage Per Customer: check by authenticated User ID
      const priorOrderWithCoupon = await prisma.order.findFirst({
        where: {
          userId,
          couponId: foundCoupon.id,
          status: {
            notIn: [OrderStatus.CANCELLED, OrderStatus.DRAFT],
          },
        },
      });

      if (priorOrderWithCoupon) {
        throw ApiError.badRequest(
          `You have already used coupon "${cleanCoupon}". Each coupon can only be used once per customer.`
        );
      }

      // Check customer phone number as secondary identity to prevent duplicate accounts
      const customer = await prisma.user.findUnique({
        where: { id: userId },
        select: { phone: true },
      });
      const customerPhone = customer?.phone || data.shippingAddress?.mobile;
      if (customerPhone) {
        const cleanPhone = customerPhone.replace(/\D/g, "").slice(-10);
        if (cleanPhone.length === 10) {
          const priorOrderByPhone = await prisma.order.findFirst({
            where: {
              couponId: foundCoupon.id,
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
              `Coupon "${cleanCoupon}" has already been used for this mobile number (+91 ${cleanPhone}). Each coupon can only be used once per customer.`
            );
          }
        }
      }

      // Compute server-side verified discount
      const discountVal = Number(foundCoupon.discountValue);
      if (foundCoupon.discountType === DiscountType.PERCENTAGE) {
        couponDiscount = Math.round((subtotalSum * discountVal) / 100);
        if (foundCoupon.maxDiscount !== null && Number(foundCoupon.maxDiscount) > 0) {
          couponDiscount = Math.min(couponDiscount, Number(foundCoupon.maxDiscount));
        }
      } else {
        // FIXED_AMOUNT
        couponDiscount = Math.min(discountVal, subtotalSum);
      }

      appliedCouponRecord = foundCoupon;
    }

    const shippingCharge = subtotalSum >= 499 ? 0 : 50;
    const grandTotal = Math.max(0, subtotalSum - couponDiscount) + shippingCharge;
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const isCod = data.paymentMethod === "cod";
    const orderStatus = isCod ? OrderStatus.CONFIRMED : OrderStatus.PENDING_PAYMENT;

    // 3. Execute atomic transaction (inventory decrement + coupon usedCount + order record creation)
    const createdOrder = await prisma.$transaction(
      async (tx) => {
        for (const item of resolvedItems) {
          const invUpdate = await tx.inventory.updateMany({
            where: {
              variantId: item.variantId,
              availableQuantity: { gte: item.quantity },
            },
            data: {
              availableQuantity: {
                decrement: item.quantity,
              },
              lastStockUpdate: new Date(),
            },
          });

          if (invUpdate.count === 0) {
            const invRecord = await tx.inventory.findUnique({
              where: { variantId: item.variantId },
            });
            const currentStock = invRecord ? invRecord.availableQuantity : 0;
            throw ApiError.badRequest(
              `Insufficient stock for "${item.productName}". Only ${currentStock} item(s) left in stock.`
            );
          }
        }

        // If coupon applied, increment usedCount atomically
        if (appliedCouponRecord) {
          await tx.coupon.update({
            where: { id: appliedCouponRecord.id },
            data: {
              usedCount: { increment: 1 },
            },
          });
        }

        const order = await tx.order.create({
          data: {
            userId,
            addressId,
            orderNumber,
            subtotal: subtotalSum,
            discount: couponDiscount,
            tax: 0,
            shippingCharge,
            grandTotal,
            status: orderStatus,
            orderedAt: new Date(),
            couponId: appliedCouponRecord?.id || null,
            orderItems: {
              create: resolvedItems,
            },
            payments: {
              create: [
                {
                  provider: isCod ? "cod" : "razorpay",
                  providerOrderId: `INIT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
                  amount: grandTotal,
                  currency: "INR",
                  status: isCod ? PaymentStatus.PENDING : PaymentStatus.CREATED,
                  paidAt: null,
                },
              ],
            },
          },
          include: {
            orderItems: {
              include: {
                variant: {
                  include: { product: true },
                },
              },
            },
            payments: true,
            address: true,
          },
        });

        return order;
      },
      { maxWait: 15000, timeout: 20000 }
    );

    // Decoupled background dispatch of notifications (SMS and Email)
    // Only dispatch immediately for Cash on Delivery. Online orders dispatch upon payment verification.
    if (data.paymentMethod === "cod") {
      setImmediate(async () => {
        try {
          const phoneToNotify = (createdOrder as any).address?.phone || user?.phone;
          if (phoneToNotify) {
            SmsService.sendOrderConfirmation({
              phone: phoneToNotify,
              orderNumber: createdOrder.orderNumber,
              grandTotal: Number(createdOrder.grandTotal),
              orderId: createdOrder.id,
            }).catch((err) => logger.error("Failed to send order SMS:", err));
          }

          if (user?.email && !user.email.endsWith(".local")) {
            EmailService.sendOrderConfirmation(
              user.email,
              createdOrder.orderNumber,
              Number(createdOrder.grandTotal),
              (createdOrder as any).address?.fullName || "Customer"
            ).catch((err) => logger.error("Failed to send order email:", err));
          }
        } catch (err) {
          logger.error("Decoupled COD notification dispatch error:", err);
        }
      });
    }

    return createdOrder;
  }

  /**
   * Get all wishlist products for the user
   */
  static async getWishlist(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw ApiError.unauthorized("User session invalid.");
    }

    const items = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
            variants: {
              where: { isActive: true },
              include: { inventory: true },
              orderBy: { price: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return items.map((item: any) => {
      const p = item.product;
      const primaryVariant = p.variants?.[0];
      const price = primaryVariant ? Number(primaryVariant.price) : 0;
      const discountPrice = primaryVariant?.discountPrice ? Number(primaryVariant.discountPrice) : undefined;
      const availableStock = primaryVariant?.inventory?.availableQuantity ?? 10;

      return {
        id: p.id,
        productId: p.id,
        name: p.nameEn,
        nameEn: p.nameEn,
        nameTa: p.nameTa,
        slug: p.slug,
        price,
        basePrice: price,
        discountPrice,
        category: p.category?.nameEn || "General",
        image: p.thumbnailUrl || "",
        thumbnailUrl: p.thumbnailUrl || "",
        inStock: availableStock > 0,
        stockQuantity: availableStock,
        unit: "pack",
        addedAt: item.createdAt,
      };
    });
  }

  /**
   * Add a product to customer's wishlist
   */
  static async addToWishlist(userId: string, productId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw ApiError.unauthorized("User session invalid.");
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      throw ApiError.notFound("Product not found or unavailable.");
    }

    return await prisma.wishlist.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      create: { userId, productId },
      update: {},
    });
  }

  /**
   * Remove a product from customer's wishlist
   */
  static async removeFromWishlist(userId: string, productId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw ApiError.unauthorized("User session invalid.");
    }

    return await prisma.wishlist.deleteMany({
      where: { userId, productId },
    });
  }

  /**
   * Toggle a product in customer's wishlist
   */
  static async toggleWishlist(userId: string, productId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw ApiError.unauthorized("User session invalid.");
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.isActive) {
      throw ApiError.notFound("Product not found or unavailable.");
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return { inWishlist: false, message: "Removed from wishlist" };
    } else {
      await prisma.wishlist.create({
        data: { userId, productId },
      });
      return { inWishlist: true, message: "Added to wishlist" };
    }
  }

  /**
   * Track orders for guest or unauthenticated user using Phone + OTP verification.
   * Also ensures customer data is saved in database and orders are linked.
   */
  static async trackOrdersByOtp(phone: string, otp: string) {
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);

    // 1. Verify OTP in database (support both ORDER_TRACKING and LOGIN purposes)
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        phone: cleanPhone,
        purpose: { in: ["ORDER_TRACKING", "LOGIN"] },
        isVerified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      throw ApiError.badRequest("Verification code expired or not found. Please request a new OTP.");
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isValid) {
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      throw ApiError.badRequest("Incorrect OTP code. Please check and try again.");
    }

    // Mark as verified
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { isVerified: true },
    });

    // 2. Ensure customer user record is saved into database
    let customerUser = await prisma.user.findFirst({
      where: { phone: cleanPhone },
      include: { profile: true },
    });

    if (!customerUser) {
      customerUser = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            phone: cleanPhone,
            email: `customer_${cleanPhone}@customer.yathu.local`,
            role: "CUSTOMER",
            isGuest: false,
            isVerified: true,
            lastLoginAt: new Date(),
          },
        });

        await tx.userProfile.create({
          data: {
            userId: newUser.id,
            firstName: "Customer",
            lastName: "",
            phone: cleanPhone,
          },
        });

        return (await tx.user.findUnique({
          where: { id: newUser.id },
          include: { profile: true },
        })) as any;
      });
    } else {
      await prisma.user.update({
        where: { id: customerUser.id },
        data: {
          isVerified: true,
          isGuest: false,
          lastLoginAt: new Date(),
        },
      });

      if (!customerUser.profile) {
        await prisma.userProfile.create({
          data: {
            userId: customerUser.id,
            firstName: "Customer",
            lastName: "",
            phone: cleanPhone,
          },
        });
      }
    }

    // 3. Link past orders placed with this phone number to this verified user in DB
    const matchingAddresses = await prisma.address.findMany({
      where: { phone: cleanPhone },
      select: { id: true },
    });
    const addressIds = matchingAddresses.map((a) => a.id);

    if (addressIds.length > 0 && customerUser) {
      await prisma.order.updateMany({
        where: {
          addressId: { in: addressIds },
          userId: { not: customerUser.id },
        },
        data: {
          userId: customerUser.id,
        },
      });
    }

    // 4. Find all orders associated with this phone (via User ID OR Address phone)
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          ...(customerUser ? [{ userId: customerUser.id }] : []),
          { address: { phone: cleanPhone } },
        ],
        deletedAt: null,
      },
      include: {
        orderItems: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
        address: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // 5. Generate authentication session tokens so customer is authenticated
    const { accessToken, refreshToken } = AuthService.generateTokens({
      userId: customerUser!.id,
      email: customerUser!.email || `phone_${cleanPhone}`,
      role: customerUser!.role,
    });

    const userProfile = (customerUser as any).profile;
    const displayName = userProfile?.firstName || `Customer ${cleanPhone.slice(-4)}`;
    const { passwordHash: _, ...userWithoutPassword } = customerUser as any;

    // 6. Return sanitized order tracking data and customer credentials
    return {
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        orderedAt: o.orderedAt || o.createdAt,
        subtotal: Number(o.subtotal),
        shippingCharge: Number(o.shippingCharge),
        grandTotal: Number(o.grandTotal),
        deliveryAddress: o.address
          ? `${o.address.fullName}, ${o.address.addressLine1}, ${o.address.city} - ${o.address.postalCode}`
          : null,
        shippingCity: o.address?.city,
        carrierName: (o as any).courierPartner || "Standard Delivery",
        trackingNumber: (o as any).trackingNumber || null,
        trackingUrl: (o as any).trackingUrl || null,
        dispatchedAt: (o as any).dispatchedAt || null,
        items: o.orderItems.map((item) => ({
          id: item.id,
          name: item.productName,
          sku: item.sku,
          quantity: item.quantity,
          price: Number(item.unitPrice),
          image: item.variant?.product?.thumbnailUrl || null,
        })),
        paymentMethod: o.payments?.[0]?.provider || "upi",
        paymentStatus: o.payments?.[0]?.status || "PENDING",
      })),
      user: {
        ...userWithoutPassword,
        name: displayName,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Change password for authenticated customer or admin
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw ApiError.unauthorized("User session invalid.");
    }

    if (!user.passwordHash) {
      throw ApiError.badRequest(
        "Account was created via social or mobile OTP login without a password. Please contact support or use OTP verification."
      );
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw ApiError.badRequest("Current password is incorrect.");
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHashedPassword },
    });

    return { success: true, message: "Password updated successfully." };
  }

  /**
   * Direct Order Tracking via Secure HMAC Token
   * Bypasses SMS OTP verification and opens the order screen directly
   * Also authenticates customer and returns session tokens
   */
  static async trackOrderByToken(orderId: string, token: string) {
    const cleanOrderId = (orderId || "").trim();
    const cleanToken = (token || "").trim();

    if (!cleanOrderId || !cleanToken) {
      throw ApiError.badRequest("Order reference and secure tracking token are required.");
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: cleanOrderId },
          { id: cleanOrderId },
        ],
        deletedAt: null,
      },
      include: {
        orderItems: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
        address: true,
        payments: true,
        user: {
          include: { profile: true },
        },
      },
    });

    if (!order) {
      throw ApiError.notFound("Order not found. Please verify the order number.");
    }

    const isValidToken = verifyOrderTrackingToken(order.orderNumber, order.id, cleanToken);
    if (!isValidToken) {
      throw ApiError.unauthorized("Invalid or expired tracking link. Please verify with phone OTP.");
    }

    // Generate authenticated session for this customer
    let tokens: { accessToken?: string; refreshToken?: string } = {};
    let userResponse: any = null;

    if (order.user) {
      const generated = AuthService.generateTokens({
        userId: order.user.id,
        email: order.user.email || `customer_${order.address?.phone || ""}`,
        role: order.user.role,
      });
      tokens = generated;

      const userProfile = order.user.profile;
      const displayName =
        userProfile?.firstName || `Customer ${(order.address?.phone || "").slice(-4)}`;
      const { passwordHash: _, ...userWithoutPassword } = order.user as any;
      userResponse = {
        ...userWithoutPassword,
        name: displayName,
      };
    }

    const formattedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      orderedAt: order.orderedAt || order.createdAt,
      subtotal: Number(order.subtotal),
      shippingCharge: Number(order.shippingCharge),
      grandTotal: Number(order.grandTotal),
      deliveryAddress: order.address
        ? `${order.address.fullName}, ${order.address.addressLine1}, ${order.address.city} - ${order.address.postalCode}`
        : null,
      shippingCity: order.address?.city,
      carrierName: (order as any).courierPartner || "Standard Delivery",
      trackingNumber: (order as any).trackingNumber || null,
      trackingUrl: (order as any).trackingUrl || null,
      dispatchedAt: (order as any).dispatchedAt || null,
      items: order.orderItems.map((item) => ({
        id: item.id,
        name: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        price: Number(item.unitPrice),
        image: item.variant?.product?.thumbnailUrl || null,
      })),
      paymentMethod: order.payments?.[0]?.provider || "upi",
      paymentStatus: order.payments?.[0]?.status || "PENDING",
    };

    return {
      order: formattedOrder,
      user: userResponse,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}


