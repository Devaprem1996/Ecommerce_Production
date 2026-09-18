"use client";

import { useQuery } from "@tanstack/react-query";
import { adminService, AdminDashboardData } from "@/services/admin.service";

export function useAdminDashboard() {
  return useQuery<AdminDashboardData, Error>({
    queryKey: ["admin", "dashboard"],
    queryFn: () => adminService.getDashboardOverview(),
    refetchInterval: 30000, // Background poll every 30 seconds for live data
    staleTime: 15000,
  });
}
