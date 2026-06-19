"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminBarbers } from "@/services/admin/barbers/api";

export function useAdminBarbers(barbershopId?: number) {
  return useQuery({
    queryKey: ["admin-barbers", barbershopId],
    queryFn: async () => {
      const result = await getAdminBarbers(barbershopId);

      return result;
    },
  });
}
