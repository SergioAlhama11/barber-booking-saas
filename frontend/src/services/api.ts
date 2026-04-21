import { formatLocalDate } from "./dateService";
import type { Barber, Barbershop, Service } from "@/types";

// =========================
// CONFIG
// =========================

const API_URL =
  typeof window === "undefined"
    ? process.env.API_URL
    : process.env.NEXT_PUBLIC_API_URL || "/api";

// =========================
// TYPES
// =========================

export type ApiResponse<T> = {
  error: boolean;
  message?: string;
  data?: T;
};

export type Appointment = {
  id: number;
  serviceName: string;
  barberName: string;
  barberId: number;
  serviceId: number;
  customerEmail: string;
  startTime: string;
  cancelledAt?: string | null;
};

export type Availability = {
  slots: string[];
};

// =========================
// CORE FETCH
// =========================

const defaultHeaders = {
  "Content-Type": "application/json",
};

async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options?.headers || {}),
      },
      cache: "no-store",
    });

    let data: any = null;

    try {
      data = await res.json();
    } catch {}

    if (!res.ok) {
      if (process.env.NODE_ENV === "development") {
        console.error("API ERROR:", `${API_URL}${url}`, res.status, data);
      }

      return {
        error: true,
        message: data?.message || `HTTP ${res.status}`,
      };
    }

    return {
      error: false,
      data: data as T,
    };
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("NETWORK ERROR:", `${API_URL}${url}`, err);
    }

    return {
      error: true,
      message: "Network error",
    };
  }
}

// =========================
// HELPERS
// =========================

function buildUrl(slug: string, path: string) {
  return `/barbershops/${slug}${path}`;
}

// =========================
// BARBERSHOP
// =========================

export function getBarbershops() {
  return apiFetch<Barbershop[]>("/barbershops");
}

export function getServices(slug: string) {
  return apiFetch<Service[]>(buildUrl(slug, "/services"));
}

export function getBarbers(slug: string) {
  return apiFetch<Barber[]>(buildUrl(slug, "/barbers"));
}

// =========================
// AVAILABILITY
// =========================

export function getAvailability(
  slug: string,
  barberId: number,
  serviceId: number,
  date: string | Date,
) {
  const safeDate = typeof date === "string" ? date : formatLocalDate(date);

  const params = new URLSearchParams({
    barberId: String(barberId),
    serviceId: String(serviceId),
    date: safeDate,
  });

  return apiFetch<Availability>(
    `${buildUrl(slug, "/availability")}?${params.toString()}`,
  );
}

// =========================
// APPOINTMENTS
// =========================

export function getAppointment(slug: string, id: number) {
  return apiFetch<Appointment>(buildUrl(slug, `/appointments/${id}`));
}

export function createAppointment(
  slug: string,
  data: {
    barberId: number;
    serviceId: number;
    customerName: string;
    customerEmail: string;
    startTime: string;
    source?: string;
  },
) {
  return apiFetch<{ id: number }>(buildUrl(slug, "/appointments"), {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function cancelAppointment(token: string, slug: string) {
  const params = new URLSearchParams({ token });

  return apiFetch<void>(
    `${buildUrl(slug, "/appointments/cancel")}?${params.toString()}`,
    { method: "DELETE" },
  );
}

export function getAppointmentsByEmail(
  slug: string,
  email: string,
  filter: string = "ALL",
) {
  const params = new URLSearchParams({
    email,
    filter,
  });

  return apiFetch<Appointment[]>(
    `${buildUrl(slug, "/appointments/by-email")}?${params.toString()}`,
  );
}

export function resendCancelLink(slug: string, id: number, email: string) {
  const params = new URLSearchParams({ email });

  return apiFetch<void>(
    `${buildUrl(slug, `/appointments/${id}/resend-cancel-link`)}?${params.toString()}`,
    { method: "POST" },
  );
}

export function rescheduleAppointment(
  slug: string,
  id: number,
  startTime: string,
) {
  return apiFetch<Appointment>(buildUrl(slug, `/appointments/${id}`), {
    method: "PUT",
    body: JSON.stringify({ startTime }),
  });
}
