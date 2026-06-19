"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminService } from "@/services/admin/services/api";

export function useAdminService(id: number) {
  return useQuery({
    queryKey: ["admin-service", id],
    queryFn: () => getAdminService(id),
    enabled: !!id,
  });
}
