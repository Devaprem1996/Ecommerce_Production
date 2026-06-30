export interface ProductType {
  id: string;
  name: string;
  nameTamil?: string;
  description: string;
  descriptionTamil?: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  isOrganic: boolean;
  isLabTested: boolean;
  unit: string; // e.g., "500g", "1kg", "1L"
}

export interface CategoryType {
  id: string;
  name: string;
  nameTamil?: string;
  slug: string;
  image: string;
  itemCount: number;
}

export interface CartItemType {
  product: ProductType;
  quantity: number;
}

export interface UserType {
  id: string;
  name?: string;
  email?: string;
  mobile: string;
  isLoggedIn: boolean;
}

export interface AddressType {
  name: string;
  mobile: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderType {
  id: string;
  userId: string;
  items: CartItemType[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: AddressType;
  pincode: string;
  paymentMethod: 'cod' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
}

export interface PincodeValidationType {
  pincode: string;
  available: boolean;
  estimatedDays?: number;
  city?: string;
  freeDeliveryThreshold?: number;
}
