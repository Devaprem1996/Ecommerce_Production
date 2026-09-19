import prisma from "../config/db.js";
import { ApiError } from "../exceptions/api-error.js";
import { OrderStatus, PaymentStatus } from "@prisma/client";

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

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        firstName: data.firstName || "Customer",
        lastName: data.lastName || "",
        phone: data.phone || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender || null,
        avatarUrl: data.avatarUrl || null,
      },
      update: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.dateOfBirth !== undefined && {
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        }),
        ...(data.gender !== undefined && { gender: data.gender }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
      },
    });

    return profile;
  }

  /**
   * Get all orders placed by the customer
   */
  static async getOrders(userId: string) {
    const orders = await prisma.order.findMany({
      where: {
        userId,
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
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
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
   * Customer cancels their own pending order
   */
  static async cancelOrder(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        deletedAt: null,
      },
    });

    if (!order) {
      throw ApiError.notFound("Order not found or access denied.");
    }

    const cancellableStatuses: OrderStatus[] = [
      OrderStatus.DRAFT,
      OrderStatus.PENDING_PAYMENT,
      OrderStatus.CONFIRMED,
    ];

    if (!cancellableStatuses.includes(order.status)) {
      throw ApiError.badRequest(
        `Order in status '${order.status}' cannot be cancelled.`
      );
    }

    return await prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
    });
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

    return await prisma.$transaction(async (tx) => {
      // 1. Resolve Address
      let addressId = data.addressId;
      if (!addressId && data.shippingAddress) {
        const createdAddr = await tx.address.create({
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
        const defaultAddr = await tx.address.findFirst({
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
      const orderItemsToCreate: Array<{
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
          variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            include: { product: true },
          });
        }

        if (!variant && item.productId) {
          variant = await tx.productVariant.findFirst({
            where: { productId: item.productId, deletedAt: null },
            include: { product: true },
          });
        }

        if (!variant) {
          variant = await tx.productVariant.findFirst({
            where: { deletedAt: null },
            include: { product: true },
          });
        }

        if (!variant) {
          throw ApiError.badRequest("Unable to resolve catalog product variant.");
        }

        const unitPrice = item.price !== undefined ? Number(item.price) : Number(variant.price);
        const quantity = Math.max(1, item.quantity || 1);
        const lineSubtotal = unitPrice * quantity;
        subtotalSum += lineSubtotal;

        orderItemsToCreate.push({
          variantId: variant.id,
          productName: item.productName || variant.product.nameEn || variant.nameEn,
          sku: variant.sku || `SKU-${variant.id.slice(0, 6).toUpperCase()}`,
          quantity,
          unitPrice,
          discount: 0,
          tax: 0,
          subtotal: lineSubtotal,
        });
      }

      const shippingCharge = subtotalSum >= 499 ? 0 : 50;
      const grandTotal = subtotalSum + shippingCharge;
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

      const orderStatus =
        data.paymentMethod === "cod"
          ? OrderStatus.CONFIRMED
          : OrderStatus.CONFIRMED;

      // 3. Create Order
      const order = await tx.order.create({
        data: {
          userId,
          addressId,
          orderNumber,
          subtotal: subtotalSum,
          discount: 0,
          tax: 0,
          shippingCharge,
          grandTotal,
          status: orderStatus,
          orderedAt: new Date(),
          orderItems: {
            create: orderItemsToCreate,
          },
          payments: {
            create: [
              {
                provider: data.paymentMethod || "upi",
                providerOrderId: `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
                amount: grandTotal,
                currency: "INR",
                status:
                  data.paymentMethod === "cod"
                    ? PaymentStatus.PENDING
                    : PaymentStatus.SUCCESSFUL,
                paidAt: data.paymentMethod === "cod" ? null : new Date(),
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
    });
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
}

