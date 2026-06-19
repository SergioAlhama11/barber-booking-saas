"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminBarbershop } from "@/services/admin/barbershops/api";

export function useAdminBarbershop(id: number) {
  return useQuery({
    queryKey: ["admin-barbershop", id],
    queryFn: () => getAdminBarbershop(id),
    enabled: !!id,
  });
}
