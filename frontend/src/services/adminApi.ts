import { apiFetch } from "@/services/api";
import {
  clearAdminSession,
  getAdminToken,
  type AdminMe,
} from "@/services/adminSession";
import type { Barber, Barbershop } from "@/types";

const API_URL =
  typeof window === "undefined"
    ? process.env.API_URL_SERVER!
    : process.env.NEXT_PUBLIC_API_URL!;

type AdminLoginResponse = {
  token: string;
};

export type AdminAppointmentStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "ALL";

export type AdminAppointment = {
  id: number;
  customerName: string;
  customerEmail: string;
  barberName: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  cancelledAt: string | null;
};

export type AdminAppointmentFilters = {
  from?: string;
  to?: string;
  barberId?: number;
  status?: AdminAppointmentStatus;
  search?: string;
  page?: number;
  size?: number;
};

type AdminFetchOptions = RequestInit & {
  token?: string | null;
};

function getAdminHeaders(
  token: string | null | undefined,
  headers?: HeadersInit,
): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers || {}),
  };
}

async function adminFetch<T>(
  path: string,
  options?: AdminFetchOptions,
): Promise<T> {
  const token = options?.token ?? getAdminToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: getAdminHeaders(token, options?.headers),
    cache: "no-store",
  });

  if (res.status === 401 || res.status === 403) {
    clearAdminSession();
    throw new Error("SESSION_EXPIRED");
  }

  let data: unknown = null;

  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    const message =
      data &&
      typeof data === "object" &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "No se pudo completar la solicitud";

    throw new Error(message);
  }

  return data as T;
}

export function loginAdmin(email: string, password: string) {
  return adminFetch<AdminLoginResponse>("/admin/auth/login", {
    method: "POST",
    token: null,
    body: JSON.stringify({ email, password }),
  });
}

export function getAdminMe(token?: string) {
  return adminFetch<AdminMe>("/admin/me", { token });
}

export function getAdminAppointments(filters: AdminAppointmentFilters) {
  const params = new URLSearchParams();

  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (typeof filters.barberId === "number") {
    params.set("barberId", String(filters.barberId));
  }
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (typeof filters.page === "number")
    params.set("page", String(filters.page));
  if (typeof filters.size === "number")
    params.set("size", String(filters.size));

  const query = params.toString();

  return adminFetch<AdminAppointment[]>(
    `/admin/appointments${query ? `?${query}` : ""}`,
  );
}

export async function getAdminBarbershop(barbershopId: number) {
  const shops = await apiFetch<Barbershop[]>("/barbershops");

  if (shops.error || !shops.data) {
    throw new Error("No se pudieron cargar las barberias");
  }

  return shops.data.find((shop) => shop.id === barbershopId) ?? null;
}

export async function getAdminBarbers(barbershopId: number) {
  const activeShop = await getAdminBarbershop(barbershopId);

  if (!activeShop) {
    return [] satisfies Barber[];
  }

  const barbers = await apiFetch<Barber[]>(
    `/barbershops/${activeShop.slug}/barbers`,
  );

  if (barbers.error || !barbers.data) {
    throw new Error("No se pudieron cargar los barberos");
  }

  return barbers.data;
}
