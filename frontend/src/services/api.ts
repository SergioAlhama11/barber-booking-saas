import { formatLocalDate } from "./dateService";
import type { Barber, Barbershop, Service } from "@/types";

// =========================
// CONFIG
// =========================

const API_URL =
  typeof window === "undefined"
    ? process.env.API_URL_SERVER!
    : process.env.NEXT_PUBLIC_API_URL!;

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
  email: string;
  appointmentId?: number | null;
};
export type SessionResponse = { email: string };

type VerifyOtpResponse = { email: string };

type OtpResponse = {
  resendInSeconds: number;
};

type ErrorPayload = {
  message?: string;
};

function getErrorMessage(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  if (!("message" in data)) return undefined;

  const message = (data as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
}

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
      credentials: "include",
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
        message: isAuthError ? "SESSION_EXPIRED" : getErrorMessage(data),
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
  return {};
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

export function getAppointment(slug: string, id: number) {
  return apiFetch<Appointment>(buildUrl(slug, `/appointments/${id}`), {
    headers: getAuthHeader(),
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
  }>(buildUrl(slug, "/appointments"), {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function cancelAppointment(slug: string, id: number) {
  return apiFetch<void>(buildUrl(slug, `/appointments/${id}`), {
    method: "DELETE",
    headers: getAuthHeader(),
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

export async function requestOtp(
  email: string,
  slug: string,
): Promise<OtpResponse | null> {
  const res = await fetch(`${API_URL}/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, slug }),
  });

  let data: OtpResponse | ErrorPayload | null = null;

  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    throw new Error(getErrorMessage(data) || "Error enviando código");
  }

  return data && "resendInSeconds" in data ? data : null;
}

export async function verifyOtp(
  email: string,
  code: string,
): Promise<VerifyOtpResponse> {
  const res = await fetch(`${API_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, code }),
  });

  const data: VerifyOtpResponse | ErrorPayload = await res.json();

  if (!res.ok) {
    throw new Error("message" in data ? data.message : "Codigo incorrecto");
  }

  return data as VerifyOtpResponse;
}

export async function exchangeMagicToken(
  token: string,
): Promise<MagicSessionExchange> {
  const res = await fetch(`${API_URL}/auth/exchange-magic`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token }),
  });

  let data: MagicSessionExchange | null = null;
  let errorData: ErrorPayload | null = null;

  try {
    const parsed = await res.json();

    if (res.ok) {
      data = parsed as MagicSessionExchange;
    } else {
      errorData = parsed as ErrorPayload;
    }
  } catch {}

  if (!res.ok || !data) {
    throw new Error(
      getErrorMessage(errorData) || "Enlace no valido o expirado",
    );
  }

  return data;
}

export async function logoutSession() {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    //credentials: "same-origin",
    credentials: "include",
  });
}

export async function getCurrentSession(): Promise<SessionResponse | null> {
  const res = await fetch(`${API_URL}/auth/session`, {
    method: "GET",
    //credentials: "same-origin",
    credentials: "include",
  });

  if (res.status === 401 || res.status === 403) {
    return null;
  }

  if (!res.ok) {
    throw new Error("No se pudo comprobar la sesion");
  }

  return res.json();
}
