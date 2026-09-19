import prisma from "../config/db.js";
import { ApiError } from "../exceptions/api-error.js";
import { OrderStatus } from "@prisma/client";

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
}
