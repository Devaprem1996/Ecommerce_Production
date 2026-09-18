"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService, AdminOrder, AdminCoupon, AdminPincode } from "@/services/admin.service";

export function useAdminProducts(params: { category?: string; search?: string; limit?: number; page?: number } = {}) {
  return useQuery({
    queryKey: ["admin", "products", params],
    queryFn: () => adminService.listProducts(params),
    staleTime: 10000,
  });
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => adminService.listCategories(),
    staleTime: 30000,
  });
}

export function useAdminOrders(params: { status?: string; search?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ["admin", "orders", params],
    queryFn: () => adminService.listOrders(params),
    staleTime: 10000,
  });
}

export function useAdminCoupons() {
  return useQuery<AdminCoupon[]>({
    queryKey: ["admin", "coupons"],
    queryFn: () => adminService.listCoupons(),
    staleTime: 15000,
  });
}

export function useAdminPincodes() {
  return useQuery<AdminPincode[]>({
    queryKey: ["admin", "pincodes"],
    queryFn: () => adminService.listPincodes(),
    staleTime: 30000,
  });
}
