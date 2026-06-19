// services/availability/api.ts

import { apiFetch } from "@/services/api";

export type AvailabilityResponse = {
  slots: string[];
};

export function getAvailability(
  slug: string,
  serviceId: number,
  date: string,
  barberId?: number,
) {
  const params = new URLSearchParams();

  params.set("serviceId", String(serviceId));
  params.set("date", date);

  if (barberId) {
    params.set("barberId", String(barberId));
  }

  return apiFetch<AvailabilityResponse>(
    `/barbershops/${slug}/availability?${params}`,
  );
}
