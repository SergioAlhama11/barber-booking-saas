import { adminFetch } from "@/services/core/adminFetch";

import type {
  AdminBarbershop,
  CreateAdminBarbershopRequest,
  UpdateAdminBarbershopRequest,
} from "./types";

export function getAdminBarbershops() {
  return adminFetch<AdminBarbershop[]>("/admin/barbershops");
}

export function getAdminBarbershop(id: number) {
  return adminFetch<AdminBarbershop>(`/admin/barbershops/${id}`);
}

export function createAdminBarbershop(request: CreateAdminBarbershopRequest) {
  return adminFetch<AdminBarbershop>("/admin/barbershops", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export function updateAdminBarbershop(
  id: number,

  request: UpdateAdminBarbershopRequest,
) {
  return adminFetch<AdminBarbershop>(
    `/admin/barbershops/${id}`,

    {
      method: "PUT",

      body: JSON.stringify(request),
    },
  );
}

export function deleteAdminBarbershop(id: number) {
  return adminFetch<void>(
    `/admin/barbershops/${id}`,

    {
      method: "DELETE",
    },
  );
}
