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

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  phone: string;
  amount: number;
  status: 'pending' | 'processing' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed';
  date: string;
  address: string;
  items: AdminOrderItem[];
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
  async listProducts(params: { category?: string; search?: string; limit?: number; page?: number } = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    query.set('limit', String(params.limit || 100));
    if (params.page) query.set('page', String(params.page));

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

  async updateOrderStatus(id: string, status: string) {
    return apiClient.patch(`/admin/orders/${id}/status`, { status });
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
}

export const adminService = new AdminService();
