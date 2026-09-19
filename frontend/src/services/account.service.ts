import { apiClient, ApiResponse } from "./api-client";

export interface UserAddress {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  landmark?: string | null;
  isDefault: boolean;
  createdAt: string;
}

export interface UserProfileData {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
}

export interface CustomerUser {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  profile?: UserProfileData | null;
  addresses?: UserAddress[];
}

export interface CustomerOrderItem {
  id: string;
  orderId: string;
  variantId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  subtotal: number;
  variant?: {
    id: string;
    nameEn: string;
    nameTa: string;
    sku: string;
    price: number;
    weight?: number | null;
    product?: {
      id: string;
      nameEn: string;
      nameTa: string;
      slug: string;
      thumbnailUrl?: string | null;
      brand?: string;
    };
  };
}

export interface CustomerPayment {
  id: string;
  orderId: string;
  provider: string;
  currency: string;
  amount: number;
  status: string;
  paidAt?: string | null;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  subtotal: number;
  discount: number;
  tax: number;
  shippingCharge: number;
  grandTotal: number;
  status: string;
  orderedAt?: string | null;
  createdAt: string;
  orderItems: CustomerOrderItem[];
  payments: CustomerPayment[];
  address?: UserAddress;
}

class AccountService {
  /**
   * Fetch authenticated user profile & addresses
   */
  async getProfile(): Promise<CustomerUser> {
    const res = await apiClient.get<{ user: CustomerUser }>("/user/profile");
    return res.data!.user;
  }

  /**
   * Update profile details
   */
  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    phone?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    avatarUrl?: string | null;
  }): Promise<UserProfileData> {
    const res = await apiClient.put<{ profile: UserProfileData }>("/user/profile", data);
    return res.data!.profile;
  }

  /**
   * Fetch all orders for current customer
   */
  async getOrders(): Promise<CustomerOrder[]> {
    const res = await apiClient.get<{ orders: CustomerOrder[] }>("/user/orders");
    return res.data?.orders || [];
  }

  /**
   * Fetch single order detail
   */
  async getOrderById(orderId: string): Promise<CustomerOrder> {
    const res = await apiClient.get<{ order: CustomerOrder }>(`/user/orders/${orderId}`);
    return res.data!.order;
  }

  /**
   * Cancel a pending order
   */
  async cancelOrder(orderId: string): Promise<CustomerOrder> {
    const res = await apiClient.post<{ order: CustomerOrder }>(`/user/orders/${orderId}/cancel`);
    return res.data!.order;
  }

  /**
   * Fetch customer saved addresses
   */
  async getAddresses(): Promise<UserAddress[]> {
    const res = await apiClient.get<{ addresses: UserAddress[] }>("/user/addresses");
    return res.data?.addresses || [];
  }

  /**
   * Add a new shipping address
   */
  async createAddress(data: {
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
  }): Promise<UserAddress> {
    const res = await apiClient.post<{ address: UserAddress }>("/user/addresses", data);
    return res.data!.address;
  }

  /**
   * Update an existing address
   */
  async updateAddress(
    addressId: string,
    data: Partial<UserAddress>
  ): Promise<UserAddress> {
    const res = await apiClient.put<{ address: UserAddress }>(`/user/addresses/${addressId}`, data);
    return res.data!.address;
  }

  /**
   * Delete an address
   */
  async deleteAddress(addressId: string): Promise<void> {
    await apiClient.delete(`/user/addresses/${addressId}`);
  }

  /**
   * Set an address as default
   */
  async setDefaultAddress(addressId: string): Promise<void> {
    await apiClient.patch(`/user/addresses/${addressId}/default`);
  }

  /**
   * Place a new customer order
   */
  async createOrder(data: {
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
  }): Promise<CustomerOrder> {
    const res = await apiClient.post<{ order: CustomerOrder }>("/user/orders", data);
    return res.data!.order;
  }
}

export const accountService = new AccountService();

