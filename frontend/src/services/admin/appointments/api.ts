import { adminFetch } from "@/services/core/adminFetch";
import type {
  AdminAppointment,
  AdminAppointmentFilters,
  AdminCreateAppointmentRequest,
  AdminUpdateAppointmentRequest,
} from "./types";

export function getAdminAppointments(filters: AdminAppointmentFilters) {
  const params = new URLSearchParams();

  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);

  if (typeof filters.barbershopId === "number") {
    params.set("barbershopId", String(filters.barbershopId));
  }

  if (typeof filters.barberId === "number") {
    params.set("barberId", String(filters.barberId));
  }

  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);

  if (typeof filters.page === "number") {
    params.set("page", String(filters.page));
  }

  if (typeof filters.size === "number") {
    params.set("size", String(filters.size));
  }

  const query = params.toString();

  return adminFetch<AdminAppointment[]>(
    `/admin/appointments${query ? `?${query}` : ""}`,
  );
}

export function getAdminAppointment(id: number) {
  return adminFetch<AdminAppointment>(`/admin/appointments/${id}`);
}

export function createAdminAppointment(request: AdminCreateAppointmentRequest) {
  return adminFetch<AdminAppointment>("/admin/appointments", {
    method: "POST",

    body: JSON.stringify(request),
  });
}

export function updateAdminAppointment(
  id: number,

  request: AdminUpdateAppointmentRequest,
) {
  return adminFetch<AdminAppointment>(`/admin/appointments/${id}`, {
    method: "PUT",

    body: JSON.stringify(request),
  });
}

export function cancelAdminAppointment(id: number) {
  return adminFetch<void>(`/admin/appointments/${id}`, {
    method: "DELETE",
  });
}
