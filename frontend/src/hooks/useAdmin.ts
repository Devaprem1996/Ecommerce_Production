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

export function useAdminUsers(params: { search?: string; role?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => adminService.listUsers(params),
    staleTime: 10000,
  });
}

export function useAdminPayments(params: { search?: string; status?: string; provider?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: ["admin", "payments", params],
    queryFn: () => adminService.listPayments(params),
    staleTime: 10000,
  });
}

export function useAdminPendingActions() {
  return useQuery({
    queryKey: ["admin", "pending-actions"],
    queryFn: () => adminService.getPendingActions(),
    staleTime: 15000,
    refetchInterval: 30000, // poll operational alerts every 30s
  });
}
