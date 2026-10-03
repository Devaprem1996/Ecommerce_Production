import { apiClient, ApiResponse } from "./api-client";

export interface DashboardKpiItem {
  value: number | string;
  change: string;
  isPositive: boolean;
}

export interface SalesTrendPoint {
  month: string;
  revenue: number;
  orders: number;
}

export interface RecentOrderSummary {
  id: string;
  orderNumber: string;
  customer: string;
  amount: number;
  status: string;
  date: string;
}

export interface TopProductSummary {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  stock: number;
  thumbnailUrl?: string | null;
}

export interface AdminDashboardData {
  kpis: {
    totalRevenue: DashboardKpiItem;
    totalOrders: DashboardKpiItem;
    activeCustomers: DashboardKpiItem;
    activeProducts: DashboardKpiItem;
  };
  salesTrend: SalesTrendPoint[];
  recentOrders: RecentOrderSummary[];
  topProducts: TopProductSummary[];
}

export interface AdminOrderItem {
  id: string;
  name: string;
  unit: string;
  price: number;
  qty: number;
}

export interface AdminOrderPayment {
  id: string;
  provider: string;
  providerOrderId: string;
  providerPaymentId?: string | null;
  status: string;
  failureReason?: string | null;
  paidAt?: string | null;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  phone: string;
  amount: number;
  status: 'pending' | 'processing' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'online';
  paymentStatus: string;
  courierPartner?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  dispatchedAt?: string | null;
  payment?: AdminOrderPayment | null;
  date: string;
  address: string;
  items: AdminOrderItem[];
}

export interface AdminCustomer {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: string;
  isGuest: boolean;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  addressesCount: number;
}

export interface AdminCustomerDetail {
  user: {
    id: string;
    email?: string | null;
    phone?: string | null;
    role: string;
    isGuest: boolean;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    lastLoginAt?: string | null;
    profile?: {
      firstName?: string;
      lastName?: string;
      phone?: string | null;
      avatarUrl?: string | null;
    } | null;
    addresses: Array<{
      id: string;
      fullName: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string | null;
      city: string;
      state: string;
      postalCode: string;
      isDefault: boolean;
    }>;
    totalSpent: number;
    totalOrders: number;
    orders: Array<{
      id: string;
      orderNumber: string;
      grandTotal: number;
      status: string;
      createdAt: string;
      itemsCount: number;
      paymentStatus: string;
    }>;
  };
}

export interface AdminPaymentItem {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  provider: string;
  providerOrderId: string;
  providerPaymentId?: string | null;
  amount: number;
  currency: string;
  status: string;
  failureReason?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

export interface AdminPaymentsResponse {
  payments: AdminPaymentItem[];
  total: number;
  page: number;
  totalPages: number;
  summary: {
    totalVolume: number;
    razorpayVolume: number;
    codPendingVolume: number;
    failedCount: number;
  };
}

export interface PendingAlertItem {
  id: string;
  type: 'order' | 'stock' | 'payment' | 'system';
  severity: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  link: string;
  time: string;
  unread: boolean;
}

export interface PendingActionsData {
  checklist: {
    ordersToPack: number;
    ordersToShip: number;
    lowStockCount: number;
    recentFailedPaymentsCount: number;
    pendingCodCount: number;
  };
  notifications: PendingAlertItem[];
  totalUnread: number;
}

export interface AdminCoupon {
  id: string;
  code: string;
  description?: string;
  discountType: "percentage" | "fixed" | "free_delivery";
  discountValue: number;
  maxDiscountCap?: number;
  minOrderValue?: number;
  validFrom: string;
  validUntil: string;
  usageCount: number;
  usageLimitTotal?: number;
  firstOrderOnly: boolean;
  active: boolean;
  revenueGenerated: number;
}

export interface AdminPincode {
  pincode: string;
  city: string;
  state: string;
  available: boolean;
  estimatedDays: number;
  freeDeliveryThreshold: number;
  shippingCharge: number;
}

class AdminService {
  /**
   * Fetch live dashboard analytics
   */
  async getDashboardOverview(): Promise<AdminDashboardData> {
    const response = await apiClient.get<AdminDashboardData>("/admin/dashboard");
    if (!response.data) {
      throw new Error(response.message || "Failed to retrieve dashboard metrics.");
    }
    return response.data;
  }

  /**
   * Products Management
   */
  async listProducts(params: { category?: string; search?: string; limit?: number; page?: number; includeInactive?: boolean } = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    query.set('limit', String(params.limit || 100));
    if (params.page) query.set('page', String(params.page));
    if (params.includeInactive !== false) {
      query.set('includeInactive', 'true');
    }

    const response = await apiClient.get(`/cms/products?${query.toString()}`);
    return response.data;
  }

  async getProduct(idOrSlug: string) {
    const response = await apiClient.get(`/cms/products/${idOrSlug}`);
    return response.data?.product;
  }

  async deleteProduct(id: string) {
    return apiClient.delete(`/cms/products/${id}`);
  }

  async createProduct(data: any) {
    return apiClient.post('/cms/products', data);
  }

  async updateProduct(id: string, data: any) {
    return apiClient.patch(`/cms/products/${id}`, data);
  }

  /**
   * Upload an image to Cloudinary via Express backend (streams to Cloudinary)
   */
  async uploadImage(file: File, folder: string = "products"): Promise<string> {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);

    const response = await apiClient.post<{ url: string }>("/cms/upload", formData);
    if (!response.data?.url) {
      throw new Error(response.message || "Failed to retrieve uploaded image URL.");
    }
    return response.data.url;
  }

  /**
   * Categories Management
   */
  async listCategories() {
    const response = await apiClient.get('/cms/categories');
    return response.data?.categories || [];
  }

  async createCategory(data: any) {
    return apiClient.post('/cms/categories', data);
  }

  async updateCategory(id: string, data: any) {
    return apiClient.patch(`/cms/categories/${id}`, data);
  }

  async deleteCategory(id: string) {
    return apiClient.delete(`/cms/categories/${id}`);
  }

  /**
   * Orders Management
   */
  async listOrders(params: { status?: string; search?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.limit) query.set('limit', String(params.limit));
    if (params.page) query.set('page', String(params.page));

    const response = await apiClient.get<{ orders: AdminOrder[]; total: number }>(`/admin/orders?${query.toString()}`);
    return response.data?.orders || [];
  }

  async updateOrderStatus(
    id: string,
    status: string,
    trackingDetails?: {
      courierPartner?: string;
      trackingNumber?: string;
      trackingUrl?: string;
    }
  ) {
    return apiClient.patch(`/admin/orders/${id}/status`, {
      status,
      ...trackingDetails,
    });
  }

  /**
   * Coupons Management
   */
  async listCoupons(): Promise<AdminCoupon[]> {
    const response = await apiClient.get<{ coupons: AdminCoupon[] }>('/admin/coupons');
    return response.data?.coupons || [];
  }

  async createCoupon(data: any) {
    return apiClient.post('/admin/coupons', data);
  }

  async toggleCoupon(id: string) {
    return apiClient.patch(`/admin/coupons/${id}/toggle`);
  }

  async deleteCoupon(id: string) {
    return apiClient.delete(`/admin/coupons/${id}`);
  }

  /**
   * Pincodes Management
   */
  async listPincodes(): Promise<AdminPincode[]> {
    const response = await apiClient.get<{ pincodes: AdminPincode[] }>('/shipping/pincodes');
    return response.data?.pincodes || [];
  }

  async createPincode(data: any) {
    return apiClient.post('/admin/pincodes', data);
  }

  async updatePincode(pincode: string, data: Partial<AdminPincode>) {
    return apiClient.patch(`/admin/pincodes/${pincode}`, data);
  }

  async deletePincode(pincode: string) {
    return apiClient.delete(`/admin/pincodes/${pincode}`);
  }

  /**
   * Customers / Users Management
   */
  async listUsers(params: { search?: string; role?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.role) query.set('role', params.role);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const response = await apiClient.get<{
      users: AdminCustomer[];
      total: number;
      page: number;
      totalPages: number;
      summary: {
        totalCustomers: number;
        activeCustomers: number;
        guestCount: number;
      };
    }>(`/admin/users?${query.toString()}`);
    return response.data;
  }

  async getUserDetail(id: string): Promise<AdminCustomerDetail['user']> {
    const response = await apiClient.get<AdminCustomerDetail>(`/admin/users/${id}`);
    if (!response.data?.user) throw new Error("Failed to load user details.");
    return response.data.user;
  }

  async toggleUserStatus(id: string) {
    return apiClient.patch(`/admin/users/${id}/toggle`);
  }

  /**
   * Payments & Transactions
   */
  async listPayments(params: { search?: string; status?: string; provider?: string; page?: number; limit?: number } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.provider) query.set('provider', params.provider);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const response = await apiClient.get<AdminPaymentsResponse>(`/admin/payments?${query.toString()}`);
    return response.data;
  }

  async verifyCodPayment(paymentId: string) {
    return apiClient.patch(`/admin/payments/${paymentId}/verify-cod`);
  }

  /**
   * Pending Actions & Notifications
   */
  async getPendingActions(): Promise<PendingActionsData> {
    const response = await apiClient.get<PendingActionsData>('/admin/pending-actions');
    return response.data || {
      checklist: {
        ordersToPack: 0,
        ordersToShip: 0,
        lowStockCount: 0,
        recentFailedPaymentsCount: 0,
        pendingCodCount: 0,
      },
      notifications: [],
      totalUnread: 0,
    };
  }
}

export const adminService = new AdminService();
