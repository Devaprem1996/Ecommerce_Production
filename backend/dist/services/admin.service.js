"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const db_js_1 = __importDefault(require("../config/db.js"));
const client_1 = require("@prisma/client");
const sms_service_js_1 = require("./sms.service.js");
const index_js_1 = __importDefault(require("../logger/index.js"));
class AdminService {
    /**
     * Calculate full real-time overview analytics for admin dashboard
     */
    static async getDashboardOverview() {
        const now = new Date();
        // Month boundary timestamps
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const priorMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const priorMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        // Six months ago start
        const sixMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        // Valid completed/active statuses for revenue
        const validRevenueStatuses = [
            client_1.OrderStatus.CONFIRMED,
            client_1.OrderStatus.PACKED,
            client_1.OrderStatus.SHIPPED,
            client_1.OrderStatus.OUT_FOR_DELIVERY,
            client_1.OrderStatus.DELIVERED,
            client_1.OrderStatus.PAYMENT_VERIFIED,
        ];
        // 1. All-time valid orders count & total revenue
        const allValidOrders = await db_js_1.default.order.findMany({
            where: {
                status: {
                    notIn: [client_1.OrderStatus.DRAFT, client_1.OrderStatus.CANCELLED],
                },
            },
            select: {
                id: true,
                grandTotal: true,
                createdAt: true,
                status: true,
            },
        });
        const totalRevenueSum = allValidOrders.reduce((sum, ord) => sum + Number(ord.grandTotal), 0);
        const totalOrdersCount = allValidOrders.length;
        // Current month revenue & orders
        const currentMonthOrders = allValidOrders.filter((o) => o.createdAt >= currentMonthStart);
        const currentMonthRev = currentMonthOrders.reduce((sum, ord) => sum + Number(ord.grandTotal), 0);
        // Prior month revenue & orders
        const priorMonthOrders = allValidOrders.filter((o) => o.createdAt >= priorMonthStart && o.createdAt <= priorMonthEnd);
        const priorMonthRev = priorMonthOrders.reduce((sum, ord) => sum + Number(ord.grandTotal), 0);
        // MoM Revenue Change
        let revChangePercent = 0;
        if (priorMonthRev > 0) {
            revChangePercent = Math.round(((currentMonthRev - priorMonthRev) / priorMonthRev) * 1000) / 10;
        }
        else if (currentMonthRev > 0) {
            revChangePercent = 100;
        }
        // MoM Orders Change
        let ordersChangePercent = 0;
        if (priorMonthOrders.length > 0) {
            ordersChangePercent =
                Math.round(((currentMonthOrders.length - priorMonthOrders.length) / priorMonthOrders.length) * 1000) / 10;
        }
        else if (currentMonthOrders.length > 0) {
            ordersChangePercent = 100;
        }
        // 2. Active Customers (Distinct users who placed orders or active verified users)
        const activeCustomersCount = await db_js_1.default.user.count({
            where: {
                isActive: true,
                role: "CUSTOMER",
            },
        });
        // 3. Active Products count in Neon DB
        const activeProductsCount = await db_js_1.default.product.count({
            where: {
                isActive: true,
                deletedAt: null,
            },
        });
        // 4. Sales Trend (trailing 6 months)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const trailing6Months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            trailing6Months.push({
                monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
                monthLabel: monthNames[d.getMonth()],
                year: d.getFullYear(),
                monthIndex: d.getMonth(),
            });
        }
        const salesTrendMap = {};
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
        const recentOrdersRaw = await db_js_1.default.order.findMany({
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
        const orderItemsGrouped = await db_js_1.default.orderItem.groupBy({
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
        let topProducts = [];
        if (orderItemsGrouped.length > 0) {
            for (const item of orderItemsGrouped) {
                const variant = await db_js_1.default.productVariant.findUnique({
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
        }
        else {
            // Fallback if zero orders: display top available products from Neon catalog
            const catalogProducts = await db_js_1.default.product.findMany({
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
    static async listOrders(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 50;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status && query.status.toLowerCase() !== "all") {
            where.status = query.status.toUpperCase();
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
            db_js_1.default.order.count({ where }),
            db_js_1.default.order.findMany({
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
        const orders = rawOrders.map((ord) => {
            const fullName = `${ord.user?.profile?.firstName || ""} ${ord.user?.profile?.lastName || ""}`.trim() ||
                ord.address?.fullName ||
                "Guest Customer";
            return {
                id: ord.id,
                orderNumber: ord.orderNumber,
                customer: fullName,
                email: ord.user?.email || "N/A",
                phone: ord.user?.profile?.phone || ord.address?.phone || "N/A",
                amount: Number(ord.grandTotal),
                status: ord.status.toLowerCase(),
                paymentMethod: ord.payments[0]?.provider === "cod" ? "cod" : "online",
                paymentStatus: (ord.payments[0]?.status || "PENDING").toLowerCase(),
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
                items: ord.orderItems.map((item) => ({
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
     * Update status of an existing order
     */
    static async updateOrderStatus(id, status) {
        const upperStatus = status.toUpperCase();
        const order = await db_js_1.default.order.update({
            where: { id },
            data: { status: upperStatus },
            include: {
                orderItems: true,
                user: { include: { profile: true } },
                address: true,
            },
        });
        // Automatically send status update SMS to customer
        const customerPhone = order.address?.phone || order.user?.phone;
        if (customerPhone) {
            if (upperStatus === client_1.OrderStatus.DELIVERED) {
                sms_service_js_1.SmsService.sendOrderDelivered({
                    phone: customerPhone,
                    orderNumber: order.orderNumber,
                }).catch((err) => index_js_1.default.error("Failed to send delivery SMS:", err));
            }
            else if (upperStatus === client_1.OrderStatus.PAYMENT_VERIFIED ||
                upperStatus === client_1.OrderStatus.CONFIRMED) {
                sms_service_js_1.SmsService.sendPaymentConfirmed({
                    phone: customerPhone,
                    orderNumber: order.orderNumber,
                    amount: Number(order.grandTotal),
                }).catch((err) => index_js_1.default.error("Failed to send payment confirmation SMS:", err));
            }
        }
        return order;
    }
    /**
     * List all promotional coupons
     */
    static async listCoupons() {
        const coupons = await db_js_1.default.coupon.findMany({
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
    static async createCoupon(data) {
        return db_js_1.default.coupon.create({
            data: {
                code: data.code.toUpperCase().trim(),
                discountType: data.discountType === "percentage" ? client_1.DiscountType.PERCENTAGE : client_1.DiscountType.FIXED_AMOUNT,
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
    static async toggleCoupon(id) {
        const existing = await db_js_1.default.coupon.findUnique({ where: { id } });
        if (!existing)
            throw new Error("Coupon not found");
        return db_js_1.default.coupon.update({
            where: { id },
            data: { isActive: !existing.isActive },
        });
    }
    /**
     * Delete coupon
     */
    static async deleteCoupon(id) {
        return db_js_1.default.coupon.delete({ where: { id } });
    }
    /**
     * Create or update delivery pincode
     */
    static async createPincode(data) {
        return db_js_1.default.pincode.create({
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
    static async updatePincode(pincode, data) {
        return db_js_1.default.pincode.update({
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
    static async deletePincode(pincode) {
        return db_js_1.default.pincode.delete({ where: { pincode } });
    }
}
exports.AdminService = AdminService;
