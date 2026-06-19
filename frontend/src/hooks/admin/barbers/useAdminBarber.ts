"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminBarber } from "@/services/admin/barbers/api";

export function useAdminBarber(id: number) {
  return useQuery({
    queryKey: ["admin-barber", id],
    queryFn: () => getAdminBarber(id),
    enabled: !!id,
  });
}
