import { adminFetch } from "@/services/core/adminFetch";

import type {
  AdminBarber,
  CreateAdminBarberRequest,
  UpdateAdminBarberRequest,
} from "./types";

export function getAdminBarbers(barbershopId?: number) {
  const params = new URLSearchParams();

  if (barbershopId) {
    params.set("barbershopId", String(barbershopId));
  }

  return adminFetch<AdminBarber[]>(
    `/admin/barbers${params.toString() ? `?${params}` : ""}`,
  );
}

export function getAdminBarber(id: number) {
  return adminFetch<AdminBarber>(`/admin/barbers/${id}`);
}

export function createAdminBarber(request: CreateAdminBarberRequest) {
  return adminFetch<AdminBarber>("/admin/barbers", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function updateAdminBarber(
  id: number,

  request: UpdateAdminBarberRequest,
) {
  return adminFetch<AdminBarber>(`/admin/barbers/${id}`, {
    method: "PUT",

    body: JSON.stringify(request),
  });
}

export function deleteAdminBarber(id: number) {
  return adminFetch<void>(`/admin/barbers/${id}`, {
    method: "DELETE",
  });
}
