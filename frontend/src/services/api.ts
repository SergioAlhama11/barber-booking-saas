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
  status?: number;
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

export type MagicSessionExchange = {
  token: string;
  email: string;
  appointmentId?: number | null;
};

type ErrorPayload = {
  message?: string;
};

// =========================
// CORE FETCH
// =========================

const defaultHeaders = {
  "Content-Type": "application/json",
};

export async function apiFetch<T>(
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

    let data: T | ErrorPayload | null = null;

    try {
      data = await res.json();
    } catch {}

    if (!res.ok) {
      if (process.env.NODE_ENV === "development") {
        console.error("API ERROR:", `${API_URL}${url}`, res.status, data);
      }

      const isAuthError = res.status === 401 || res.status === 403;

      return {
        error: true,
        message: isAuthError ? "SESSION_EXPIRED" : data?.message,
        status: res.status,
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

export function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// =========================
// BARBERSHOP
// =========================

export function getBarbershop(slug: string) {
  return apiFetch<Barbershop>(buildUrl(slug, ""));
}

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

export function getAppointment(slug: string, id: number, token?: string) {
  const url = token
    ? buildUrl(slug, `/appointments/${id}?token=${token}`)
    : buildUrl(slug, `/appointments/${id}`);

  return apiFetch<Appointment>(url, {
    headers: token ? {} : getAuthHeader(),
  });
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
  return apiFetch<{
    appointment: Appointment;
    token: string;
  }>(buildUrl(slug, "/appointments"), {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function cancelAppointment(slug: string, id: number, token?: string) {
  const url = token
    ? buildUrl(slug, `/appointments/${id}?token=${token}`)
    : buildUrl(slug, `/appointments/${id}`);

  return apiFetch<void>(url, {
    method: "DELETE",
    headers: token ? {} : getAuthHeader(),
  });
}

export function cancelAppointmentByToken(slug: string, token: string) {
  const params = new URLSearchParams({ token });

  return apiFetch<void>(
    `${buildUrl(slug, "/appointments/cancel")}?${params.toString()}`,
    { method: "DELETE" },
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
    headers: getAuthHeader(),
  });
}

// =========================
// AUTH
// =========================

export async function requestOtp(email: string, slug: string) {
  const res = await fetch(`/api/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, slug }),
  });

  let data: ErrorPayload | null = null;

  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    throw new Error(data?.message || "Error enviando código");
  }

  return data;
}

export async function verifyOtp(email: string, code: string) {
  const res = await fetch(`/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.message);

  localStorage.setItem("auth_token", data.token);

  return data;
}

export async function exchangeMagicToken(token: string) {
  const res = await fetch(`/api/auth/exchange-magic`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  let data: MagicSessionExchange | null = null;

  try {
    data = await res.json();
  } catch {}

  if (!res.ok || !data) {
    throw new Error(data?.message || "Enlace no valido o expirado");
  }

  localStorage.setItem("auth_token", data.token);
  localStorage.setItem("auth_email", data.email);

  return data;
}
