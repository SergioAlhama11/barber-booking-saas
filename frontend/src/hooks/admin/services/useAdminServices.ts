"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminServices } from "@/services/admin/services/api";

export function useAdminServices(barbershopId?: number) {
  const query = useQuery({
    queryKey: ["admin-services", barbershopId],
    queryFn: () => getAdminServices(barbershopId),
  });

  return {
    services: query.data ?? [],
    loading: query.isLoading || query.isFetching,
    error: query.error instanceof Error ? query.error.message : "",
  };
}
