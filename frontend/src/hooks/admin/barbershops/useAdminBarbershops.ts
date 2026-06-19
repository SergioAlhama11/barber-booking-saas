"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminBarbershops } from "@/services/admin/barbershops/api";

export function useAdminBarbershops() {
  return useQuery({
    queryKey: ["admin-barbershops"],
    queryFn: getAdminBarbershops,
  });
}
