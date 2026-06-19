"use client";

import { useQuery } from "@tanstack/react-query";

import { getAvailability } from "@/services/public/availability/api";

export function useAdminAvailability(
  slug?: string,
  serviceId?: number,
  barberId?: number,
  date?: string,
) {
  const query = useQuery({
    queryKey: ["admin-availability", slug, serviceId, barberId, date],

    queryFn: () => getAvailability(slug!, serviceId!, date!, barberId),

    enabled: Boolean(slug && serviceId && barberId && date),
  });

  return {
    slots: query.data?.data?.slots ?? [],
    loading: query.isLoading,
    error: query.error,
  };
}
