import prisma from "../config/db.js";
import { OrderStatus, DiscountType, PaymentStatus } from "@prisma/client";
import { SmsService } from "./sms.service.js";
import { UserService } from "./user.service.js";
import { ApiError } from "../exceptions/api-error.js";
import logger from "../logger/index.js";

export interface DashboardKpiItem {
  value: number | string;
  change: string;
  isPositive: boolean;
}

export interface DashboardOverviewResponse {
  kpis: {
    totalRevenue: DashboardKpiItem;
    totalOrders: DashboardKpiItem;
    activeCustomers: DashboardKpiItem;
    activeProducts: DashboardKpiItem;
  };
  salesTrend: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customer: string;
    amount: number;
    status: string;
    date: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    stock: number;
    thumbnailUrl?: string | null;
  }>;
}

export class AdminService {
  /**
   * Calculate full real-time overview analytics for admin dashboard
   */
  static async getDashboardOverview(): Promise<DashboardOverviewResponse> {
    const now = new Date();

    // Month boundary timestamps
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const priorMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const priorMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Six months ago start
    const sixMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Valid completed/active statuses for revenue
    const validRevenueStatuses: OrderStatus[] = [
      OrderStatus.CONFIRMED,
      OrderStatus.PACKED,
      OrderStatus.SHIPPED,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.DELIVERED,
      OrderStatus.PAYMENT_VERIFIED,
    ];

    // 1. All-time valid orders count & total revenue
    const allValidOrders = await prisma.order.findMany({
      where: {
        status: {
          notIn: [OrderStatus.DRAFT, OrderStatus.CANCELLED],
        },
      },
      select: {
        id: true,
        grandTotal: true,
        createdAt: true,
        status: true,
      },
    });

    const totalRevenueSum = allValidOrders.reduce(
      (sum, ord) => sum + Number(ord.grandTotal),
      0
    );
    const totalOrdersCount = allValidOrders.length;

    // Current month revenue & orders
    const currentMonthOrders = allValidOrders.filter(
      (o) => o.createdAt >= currentMonthStart
    );
    const currentMonthRev = currentMonthOrders.reduce(
      (sum, ord) => sum + Number(ord.grandTotal),
      0
    );

    // Prior month revenue & orders
    const priorMonthOrders = allValidOrders.filter(
      (o) => o.createdAt >= priorMonthStart && o.createdAt <= priorMonthEnd
    );
    const priorMonthRev = priorMonthOrders.reduce(
      (sum, ord) => sum + Number(ord.grandTotal),
      0
    );

    // MoM Revenue Change
    let revChangePercent = 0;
    if (priorMonthRev > 0) {
      revChangePercent = Math.round(((currentMonthRev - priorMonthRev) / priorMonthRev) * 1000) / 10;
    } else if (currentMonthRev > 0) {
      revChangePercent = 100;
    }

    // MoM Orders Change
    let ordersChangePercent = 0;
    if (priorMonthOrders.length > 0) {
      ordersChangePercent =
        Math.round(
          ((currentMonthOrders.length - priorMonthOrders.length) / priorMonthOrders.length) * 1000
        ) / 10;
    } else if (currentMonthOrders.length > 0) {
      ordersChangePercent = 100;
    }

    // 2. Active Customers (Distinct users who placed orders or active verified users)
    const activeCustomersCount = await prisma.user.count({
      where: {
        isActive: true,
        role: "CUSTOMER",
      },
    });

    // 3. Active Products count in Neon DB
    const activeProductsCount = await prisma.product.count({
      where: {
        isActive: true,
        deletedAt: null,
      },
    });

    // 4. Sales Trend (trailing 6 months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trailing6Months: Array<{ monthKey: string; monthLabel: string; year: number; monthIndex: number }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      trailing6Months.push({
        monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        monthLabel: monthNames[d.getMonth()],
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
      });
    }

    const salesTrendMap: Record<string, { revenue: number; orders: number }> = {};
    trailing6Months.forEach((m) => {
      salesTrendMap[m.monthLabel] = { revenue: 0, orders: 0 };
    });

    allValidOrders.forEach((order) => {
      if (order.createdAt >= sixMonthsAgoStart) {
        const mLabel = monthNames[order.createdAt.getMonth()];
        if (salesTrendMap[mLabel]) {
          salesTrendMap[mLabel].revenue += Number(order.grandTotal);
          salesTrendMap[mLabel].orders += 1;
        }
      }
    });

    const salesTrend = trailing6Months.map((m) => ({
      month: m.monthLabel,
      revenue: Math.round(salesTrendMap[m.monthLabel]?.revenue || 0),
      orders: salesTrendMap[m.monthLabel]?.orders || 0,
    }));

    // 5. Recent 5 Orders
    const recentOrdersRaw = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        address: true,
      },
    });

    const recentOrders = recentOrdersRaw.map((ord) => {
      const firstName = ord.user?.profile?.firstName || "";
      const lastName = ord.user?.profile?.lastName || "";
      const fullName = `${firstName} ${lastName}`.trim() || ord.address?.fullName || "Guest Customer";

      // Formatted relative or readable time
      const dateStr = ord.createdAt.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        id: ord.id,
        orderNumber: ord.orderNumber || `#${ord.id.slice(0, 8).toUpperCase()}`,
        customer: fullName,
        amount: Number(ord.grandTotal),
        status: ord.status.toLowerCase(),
        date: dateStr,
      };
    });

    // 6. Top Selling Products
    // Aggregate order items if orders exist
    const orderItemsGrouped = await prisma.orderItem.groupBy({
      by: ["variantId"],
      _sum: {
        quantity: true,
        subtotal: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    let topProducts: Array<{
      id: string;
      name: string;
      sales: number;
      revenue: number;
      stock: number;
      thumbnailUrl?: string | null;
    }> = [];

    if (orderItemsGrouped.length > 0) {
      for (const item of orderItemsGrouped) {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: {
            product: true,
            inventory: true,
          },
        });

        if (variant && variant.product) {
          topProducts.push({
            id: variant.productId,
            name: `${variant.product.nameEn} (${variant.nameEn})`,
            sales: item._sum.quantity || 0,
            revenue: Number(item._sum.subtotal || 0),
            stock: variant.inventory?.availableQuantity || 0,
            thumbnailUrl: variant.product.thumbnailUrl,
          });
        }
      }
    } else {
      // Fallback if zero orders: display top available products from Neon catalog
      const catalogProducts = await prisma.product.findMany({
        where: { isActive: true, deletedAt: null },
        take: 4,
        include: {
          variants: {
            include: {
              inventory: true,
            },
          },
        },
      });

      topProducts = catalogProducts.map((p) => {
        const firstVariant = p.variants[0];
        const stock = firstVariant?.inventory?.availableQuantity ?? 50;
        return {
          id: p.id,
          name: p.nameEn,
          sales: 0,
          revenue: 0,
          stock,
          thumbnailUrl: p.thumbnailUrl,
        };
      });
    }

    return {
      kpis: {
        totalRevenue: {
          value: totalRevenueSum,
          change: `${revChangePercent >= 0 ? "+" : ""}${revChangePercent}%`,
          isPositive: revChangePercent >= 0,
        },
        totalOrders: {
          value: totalOrdersCount,
          change: `${ordersChangePercent >= 0 ? "+" : ""}${ordersChangePercent}%`,
          isPositive: ordersChangePercent >= 0,
        },
        activeCustomers: {
          value: activeCustomersCount,
          change: "+0%",
          isPositive: true,
        },
        activeProducts: {
          value: activeProductsCount,
          change: "Flat",
          isPositive: true,
        },
      },
      salesTrend,
      recentOrders,
      topProducts,
    };
  }

  /**
   * List all customer orders with filtering & search
   */
  static async listOrders(query: { status?: string; search?: string; page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status && query.status.toLowerCase() !== "all") {
      where.status = query.status.toUpperCase() as OrderStatus;
    }

    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { orderNumber: { contains: s, mode: "insensitive" } },
        { user: { profile: { firstName: { contains: s, mode: "insensitive" } } } },
        { user: { profile: { lastName: { contains: s, mode: "insensitive" } } } },
        { user: { email: { contains: s, mode: "insensitive" } } },
        { address: { phone: { contains: s, mode: "insensitive" } } },
      ];
    }

    const [total, rawOrders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { include: { profile: true } },
          address: true,
          orderItems: true,
          payments: true,
        },
      }),
    ]);

    const orders = rawOrders.map((ord: any) => {
      const fullName =
        `${ord.user?.profile?.firstName || ""} ${ord.user?.profile?.lastName || ""}`.trim() ||
        ord.address?.fullName ||
        "Guest Customer";
      const primaryPayment = ord.payments && ord.payments.length > 0 ? ord.payments[0] : null;

      return {
        id: ord.id,
        orderNumber: ord.orderNumber,
        customer: fullName,
        email: ord.user?.email || "N/A",
        phone: ord.user?.profile?.phone || ord.address?.phone || "N/A",
        amount: Number(ord.grandTotal),
        status: ord.status.toLowerCase(),
        paymentMethod: primaryPayment?.provider === "cod" ? "cod" : "online",
        paymentStatus: (primaryPayment?.status || "PENDING").toLowerCase(),
        courierPartner: ord.courierPartner || null,
        trackingNumber: ord.trackingNumber || null,
        trackingUrl: ord.trackingUrl || null,
        dispatchedAt: ord.dispatchedAt ? ord.dispatchedAt.toISOString() : null,
        payment: primaryPayment
          ? {
              id: primaryPayment.id,
              provider: primaryPayment.provider,
              providerOrderId: primaryPayment.providerOrderId,
              providerPaymentId: primaryPayment.providerPaymentId,
              status: primaryPayment.status,
              failureReason: primaryPayment.failureReason,
              paidAt: primaryPayment.paidAt ? primaryPayment.paidAt.toISOString() : null,
            }
          : null,
        date: ord.createdAt.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        address: ord.address
          ? `${ord.address.addressLine1}, ${ord.address.city}, ${ord.address.state} - ${ord.address.postalCode}`
          : "Standard Shipping Address",
        items: ord.orderItems.map((item: any) => ({
          id: item.id,
          name: item.productName,
          unit: item.sku,
          price: Number(item.unitPrice),
          qty: item.quantity,
        })),
      };
    });

    return { orders, total, page, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Update status of an existing order and optionally attach courier tracking
   */
  static async updateOrderStatus(
    id: string,
    status: string,
    trackingDetails?: {
      courierPartner?: string;
      trackingNumber?: string;
      trackingUrl?: string;
    }
  ) {
    if (!status) {
      throw ApiError.badRequest("Order status is required.");
    }

    const upperStatus = status.toUpperCase() as OrderStatus;
    if (!Object.values(OrderStatus).includes(upperStatus)) {
      throw ApiError.badRequest(
        `Invalid order status '${status}'. Allowed statuses: ${Object.values(OrderStatus).join(", ")}`
      );
    }

    if (upperStatus === OrderStatus.CANCELLED || upperStatus === OrderStatus.REFUNDED) {
      return UserService.cancelOrder(null, id, "Admin Cancellation");
    }

    const updateData: any = { status: upperStatus };

    if (trackingDetails) {
      if (trackingDetails.courierPartner !== undefined) {
        updateData.courierPartner = trackingDetails.courierPartner;
      }
      if (trackingDetails.trackingNumber !== undefined) {
        updateData.trackingNumber = trackingDetails.trackingNumber;
      }
      if (trackingDetails.trackingUrl !== undefined) {
        updateData.trackingUrl = trackingDetails.trackingUrl;
      }
    }

    if (upperStatus === OrderStatus.SHIPPED) {
      updateData.dispatchedAt = new Date();
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        orderItems: true,
        user: { include: { profile: true } },
        address: true,
      },
    });

    // Automatically send status update SMS to customer
    const customerPhone = order.address?.phone || order.user?.phone;
    if (customerPhone) {
      if (upperStatus === OrderStatus.DELIVERED) {
        SmsService.sendOrderDelivered({
          phone: customerPhone,
          orderNumber: order.orderNumber,
          orderId: order.id,
        }).catch((err) => logger.error("Failed to send delivery SMS:", err));
      } else if (upperStatus === OrderStatus.SHIPPED) {
        SmsService.sendOrderShipped({
          phone: customerPhone,
          orderNumber: order.orderNumber,
          courierPartner: order.courierPartner,
          trackingNumber: order.trackingNumber,
          trackingUrl: order.trackingUrl,
          orderId: order.id,
        }).catch((err) => logger.error("Failed to send shipped SMS:", err));
      } else if (
        upperStatus === OrderStatus.PAYMENT_VERIFIED ||
        upperStatus === OrderStatus.CONFIRMED
      ) {
        SmsService.sendPaymentConfirmed({
          phone: customerPhone,
          orderNumber: order.orderNumber,
          amount: Number(order.grandTotal),
          orderId: order.id,
        }).catch((err) => logger.error("Failed to send payment confirmation SMS:", err));
      }
    }

    return order;
  }

  /**
   * List all promotional coupons
   */
  static async listCoupons() {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return coupons.map((c) => ({
      id: c.id,
      code: c.code,
      discountType: c.discountType.toLowerCase(),
      discountValue: Number(c.discountValue),
      maxDiscountCap: c.maxDiscount ? Number(c.maxDiscount) : undefined,
      minOrderValue: Number(c.minOrderValue),
      validFrom: c.startDate.toISOString().split("T")[0],
      validUntil: c.endDate.toISOString().split("T")[0],
      usageCount: c.usedCount,
      usageLimitTotal: c.usageLimit || undefined,
      firstOrderOnly: false,
      active: c.isActive,
      revenueGenerated: 0,
    }));
  }

  /**
   * Create new discount coupon
   */
  static async createCoupon(data: any) {
    return prisma.coupon.create({
      data: {
        code: data.code.toUpperCase().trim(),
        discountType: data.discountType === "percentage" ? DiscountType.PERCENTAGE : DiscountType.FIXED_AMOUNT,
        discountValue: Number(data.discountValue),
        minOrderValue: Number(data.minOrderValue || 0),
        maxDiscount: data.maxDiscountCap ? Number(data.maxDiscountCap) : null,
        startDate: new Date(data.validFrom || Date.now()),
        endDate: new Date(data.validUntil || Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: data.active ?? true,
        usageLimit: data.usageLimitTotal ? Number(data.usageLimitTotal) : null,
      },
    });
  }

  /**
   * Toggle coupon active state
   */
  static async toggleCoupon(id: string) {
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) throw new Error("Coupon not found");
    return prisma.coupon.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });
  }

  /**
   * Delete coupon
   */
  static async deleteCoupon(id: string) {
    return prisma.coupon.delete({ where: { id } });
  }

  /**
   * Create or update delivery pincode
   */
  static async createPincode(data: any) {
    return prisma.pincode.create({
      data: {
        pincode: data.pincode.trim(),
        city: data.city.trim(),
        state: data.state.trim(),
        available: data.available ?? true,
        estimatedDays: Number(data.estimatedDays || 3),
        freeDeliveryThreshold: Number(data.freeDeliveryThreshold || 499),
        shippingCharge: Number(data.shippingCharge || 40),
      },
    });
  }

  /**
   * Update existing pincode
   */
  static async updatePincode(pincode: string, data: any) {
    return prisma.pincode.update({
      where: { pincode },
      data: {
        available: data.available !== undefined ? data.available : undefined,
        estimatedDays: data.estimatedDays !== undefined ? Number(data.estimatedDays) : undefined,
        shippingCharge: data.shippingCharge !== undefined ? Number(data.shippingCharge) : undefined,
        freeDeliveryThreshold: data.freeDeliveryThreshold !== undefined ? Number(data.freeDeliveryThreshold) : undefined,
      },
    });
  }

  /**
   * Delete delivery pincode
   */
  static async deletePincode(pincode: string) {
    return prisma.pincode.delete({ where: { pincode } });
  }

  /**
   * =========================================================================
   * CUSTOMERS & USERS MANAGEMENT
   * =========================================================================
   */

  /**
   * List customers with metrics (LTV, order count, etc.)
   */
  static async listUsers(query: { search?: string; role?: string; page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.role && query.role !== "ALL") {
      where.role = query.role.toUpperCase();
    }
    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { email: { contains: s, mode: "insensitive" } },
        { phone: { contains: s, mode: "insensitive" } },
        { profile: { firstName: { contains: s, mode: "insensitive" } } },
        { profile: { lastName: { contains: s, mode: "insensitive" } } },
      ];
    }

    const [total, rawUsers, totalCustomersCount, activeCustomersCount, guestCount] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          profile: true,
          addresses: { where: { deletedAt: null } },
          orders: {
            where: { status: { notIn: [OrderStatus.CANCELLED, OrderStatus.DRAFT] } },
            select: { id: true, grandTotal: true, createdAt: true, status: true },
          },
        },
      }),
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isGuest: true } }),
    ]);

    const users = rawUsers.map((u) => {
      const totalOrders = u.orders.length;
      const totalSpent = u.orders.reduce((sum, o) => sum + Number(o.grandTotal), 0);
      const name = `${u.profile?.firstName || ""} ${u.profile?.lastName || ""}`.trim() || "Customer";
      return {
        id: u.id,
        email: u.email || "N/A",
        phone: u.phone || u.profile?.phone || "N/A",
        name,
        role: u.role,
        isGuest: u.isGuest,
        isActive: u.isActive,
        isVerified: u.isVerified,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
        totalOrders,
        totalSpent,
        addressesCount: u.addresses.length,
      };
    });

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      summary: {
        totalCustomers: totalCustomersCount,
        activeCustomers: activeCustomersCount,
        guestCount,
      },
    };
  }

  /**
   * Get single user full profile and complete order history
   */
  static async getUserDetail(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        addresses: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
        orders: {
          orderBy: { createdAt: "desc" },
          include: {
            orderItems: true,
            payments: true,
          },
        },
      },
    });

    if (!user) throw ApiError.notFound("User not found");

    const totalSpent = user.orders
      .filter((o) => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.DRAFT)
      .reduce((sum, o) => sum + Number(o.grandTotal), 0);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isGuest: user.isGuest,
        isActive: user.isActive,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        profile: user.profile,
        addresses: user.addresses,
        totalSpent,
        totalOrders: user.orders.length,
        orders: user.orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          grandTotal: Number(o.grandTotal),
          status: o.status,
          createdAt: o.createdAt,
          itemsCount: o.orderItems.length,
          paymentStatus: o.payments[0]?.status || "PENDING",
        })),
      },
    };
  }

  /**
   * Toggle user active/blocked status
   */
  static async toggleUserStatus(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound("User not found");
    if (user.role === "ADMIN") {
      throw ApiError.badRequest("Cannot deactivate admin user.");
    }
    return prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });
  }

  /**
   * =========================================================================
   * PAYMENTS & TRANSACTIONS MANAGEMENT
   * =========================================================================
   */

  /**
   * List all payment transactions (Razorpay & COD) with status and diagnostic info
   */
  static async listPayments(query: { search?: string; status?: string; provider?: string; page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status && query.status.toLowerCase() !== "all") {
      where.status = query.status.toUpperCase() as PaymentStatus;
    }
    if (query.provider && query.provider.toLowerCase() !== "all") {
      where.provider = query.provider.toLowerCase();
    }
    if (query.search) {
      const s = query.search.trim();
      where.OR = [
        { providerPaymentId: { contains: s, mode: "insensitive" } },
        { providerOrderId: { contains: s, mode: "insensitive" } },
        { order: { orderNumber: { contains: s, mode: "insensitive" } } },
        { order: { user: { profile: { firstName: { contains: s, mode: "insensitive" } } } } },
        { order: { user: { profile: { lastName: { contains: s, mode: "insensitive" } } } } },
        { order: { address: { phone: { contains: s, mode: "insensitive" } } } },
      ];
    }

    const [total, rawPayments, totalVolumeAgg, capturedVolumeAgg, codPendingAgg, failedCount] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          order: {
            include: {
              user: { include: { profile: true } },
              address: true,
            },
          },
        },
      }),
      // Total volume
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: { in: [PaymentStatus.SUCCESSFUL, PaymentStatus.CAPTURED] } },
      }),
      // Razorpay captured volume
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { provider: "razorpay", status: { in: [PaymentStatus.SUCCESSFUL, PaymentStatus.CAPTURED] } },
      }),
      // COD pending volume
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { provider: "cod", status: { in: [PaymentStatus.PENDING, PaymentStatus.CREATED] } },
      }),
      // Failed count
      prisma.payment.count({
        where: { status: PaymentStatus.FAILED },
      }),
    ]);

    const payments = rawPayments.map((p) => {
      const customerName =
        `${p.order?.user?.profile?.firstName || ""} ${p.order?.user?.profile?.lastName || ""}`.trim() ||
        p.order?.address?.fullName ||
        "Guest Customer";
      const customerPhone = p.order?.user?.phone || p.order?.address?.phone || "N/A";

      return {
        id: p.id,
        orderId: p.orderId,
        orderNumber: p.order?.orderNumber || "N/A",
        customerName,
        customerPhone,
        provider: p.provider,
        providerOrderId: p.providerOrderId,
        providerPaymentId: p.providerPaymentId,
        amount: Number(p.amount),
        currency: p.currency,
        status: p.status,
        failureReason: p.failureReason,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      };
    });

    return {
      payments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      summary: {
        totalVolume: Number(totalVolumeAgg._sum.amount || 0),
        razorpayVolume: Number(capturedVolumeAgg._sum.amount || 0),
        codPendingVolume: Number(codPendingAgg._sum.amount || 0),
        failedCount,
      },
    };
  }

  /**
   * Verify COD cash collection upon delivery
   */
  static async verifyCodPayment(paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });
    if (!payment) throw ApiError.notFound("Payment record not found");
    if (payment.provider !== "cod") {
      throw ApiError.badRequest("Only COD payments can be manually marked as verified.");
    }

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.CAPTURED,
        paidAt: new Date(),
      },
    });

    if (payment.order && payment.order.status !== OrderStatus.DELIVERED) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.DELIVERED },
      });
    }

    return updated;
  }

  /**
   * =========================================================================
   * OPERATIONAL NOTIFICATIONS & PENDING ACTIONS QUEUE
   * =========================================================================
   */

  /**
   * Get operational pending actions checklist and real-time alerts
   */
  static async getPendingActions() {
    const [
      ordersToPackCount,
      ordersToShipCount,
      lowStockVariants,
      recentFailedPayments,
      pendingCodCount,
    ] = await Promise.all([
      // Orders confirmed, awaiting packing
      prisma.order.count({
        where: { status: OrderStatus.CONFIRMED },
      }),
      // Orders packed, awaiting dispatch
      prisma.order.count({
        where: { status: OrderStatus.PACKED },
      }),
      // Low stock variants (availableQuantity <= 5 and product active)
      prisma.inventory.findMany({
        where: {
          availableQuantity: { lte: 5 },
          variant: { product: { isActive: true, deletedAt: null } },
        },
        take: 10,
        include: {
          variant: {
            include: { product: true },
          },
        },
      }),
      // Failed payments in last 48 hours
      prisma.payment.findMany({
        where: {
          status: PaymentStatus.FAILED,
          createdAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
        },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          order: {
            include: {
              address: true,
              user: { include: { profile: true } },
            },
          },
        },
      }),
      // COD orders pending
      prisma.payment.count({
        where: { provider: "cod", status: { in: [PaymentStatus.PENDING, PaymentStatus.CREATED] } },
      }),
    ]);

    // Build notifications items
    const notifications: Array<{
      id: string;
      type: "order" | "stock" | "payment" | "system";
      severity: "info" | "warning" | "error";
      title: string;
      message: string;
      link: string;
      time: string;
      unread: boolean;
    }> = [];

    if (ordersToPackCount > 0) {
      notifications.push({
        id: "alert-pack",
        type: "order",
        severity: "info",
        title: "Orders Ready for Packing",
        message: `${ordersToPackCount} order(s) confirmed and ready to be packed.`,
        link: "/admin/orders?status=confirmed",
        time: "Action Required",
        unread: true,
      });
    }

    if (ordersToShipCount > 0) {
      notifications.push({
        id: "alert-ship",
        type: "order",
        severity: "warning",
        title: "Orders Awaiting Dispatch",
        message: `${ordersToShipCount} packed order(s) awaiting courier partner assignment.`,
        link: "/admin/orders?status=packed",
        time: "Action Required",
        unread: true,
      });
    }

    for (const inv of lowStockVariants) {
      notifications.push({
        id: `alert-stock-${inv.id}`,
        type: "stock",
        severity: "warning",
        title: "Low Inventory Alert",
        message: `"${inv.variant.product.nameEn} (${inv.variant.nameEn})" has only ${inv.availableQuantity} units left.`,
        link: `/admin/products`,
        time: "Stock Alert",
        unread: true,
      });
    }

    for (const fail of recentFailedPayments) {
      const customer =
        fail.order?.user?.profile?.firstName || fail.order?.address?.fullName || "Customer";
      notifications.push({
        id: `alert-pay-${fail.id}`,
        type: "payment",
        severity: "error",
        title: "Payment Transaction Failed",
        message: `₹${fail.amount} payment failed for order #${fail.order?.orderNumber} (${customer}).`,
        link: "/admin/payments?status=failed",
        time: fail.createdAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        unread: true,
      });
    }

    return {
      checklist: {
        ordersToPack: ordersToPackCount,
        ordersToShip: ordersToShipCount,
        lowStockCount: lowStockVariants.length,
        recentFailedPaymentsCount: recentFailedPayments.length,
        pendingCodCount,
      },
      notifications,
      totalUnread: notifications.length,
    };
  }
}
