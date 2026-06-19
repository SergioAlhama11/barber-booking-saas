import { adminFetch } from "@/services/core/adminFetch";

import type {
  AdminService,
  CreateAdminServiceRequest,
  UpdateAdminServiceRequest,
} from "./types";

export function getAdminServices(barbershopId?: number) {
  const params = new URLSearchParams();

  if (barbershopId) {
    params.set("barbershopId", String(barbershopId));
  }

  return adminFetch<AdminService[]>(
    `/admin/services${params.toString() ? `?${params}` : ""}`,
  );
}

export function getAdminService(id: number) {
  return adminFetch<AdminService>(`/admin/services/${id}`);
}

export function createAdminService(request: CreateAdminServiceRequest) {
  return adminFetch<AdminService>("/admin/services", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function updateAdminService(
  id: number,
  request: UpdateAdminServiceRequest,
) {
  return adminFetch<AdminService>(`/admin/services/${id}`, {
    method: "PUT",
    body: JSON.stringify(request),
  });
}

export function deleteAdminService(id: number) {
  return adminFetch<void>(`/admin/services/${id}`, {
    method: "DELETE",
  });
}
