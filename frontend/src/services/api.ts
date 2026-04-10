import { formatLocalDate } from "./dateService";

const API_URL = "http://192.168.18.212:8080";

export type ApiResponse<T> = {
  error: boolean;
  message?: string;
  data?: T;
};

async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const isDev = process.env.NODE_ENV === "development";

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(isDev && {
          "X-Forwarded-For": "127.0.0.1",
        }),
        ...(options?.headers || {}),
      },
      // 🔥 IMPORTANTE (Next SSR cache)
      cache: "no-store",
    });

    let data: any = null;

    try {
      data = await res.json();
    } catch {
      console.warn("Response is not JSON");
    }

    if (!res.ok) {
      console.error("API ERROR:", {
        url,
        status: res.status,
        data,
      });

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
    console.error("NETWORK ERROR:", err);

    return {
      error: true,
      message: "Network error",
    };
  }
}

// =========================
// Barbershop
// =========================

export function getServices(slug: string) {
  return apiFetch<any[]>(`${API_URL}/barbershops/${slug}/services`);
}

export function getBarbers(slug: string) {
  return apiFetch<any[]>(`${API_URL}/barbershops/${slug}/barbers`);
}

// =========================
// Availability
// =========================

export async function getAvailability(
  slug: string,
  barberId: number,
  serviceId: number,
  date: string | Date,
) {
  const safeDate = typeof date === "string" ? date : formatLocalDate(date);

  const url = `${API_URL}/barbershops/${slug}/availability?barberId=${barberId}&serviceId=${serviceId}&date=${safeDate}`;

  try {
    const res = await fetch(url);

    const data = await res.json();

    if (!res.ok) {
      return { error: true, message: data.message };
    }

    return { data };
  } catch {
    return { error: true, message: "Network error" };
  }
}

// =========================
// Appointments
// =========================

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
  return apiFetch<{ id: number }>(
    `${API_URL}/barbershops/${slug}/appointments`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function cancelAppointment(token: string, slug: string) {
  return apiFetch<void>(
    `${API_URL}/barbershops/${slug}/appointments/cancel?token=${token}`,
    { method: "DELETE" },
  );
}

export function getAppointmentsByEmail(
  slug: string,
  email: string,
  filter: string = "ALL",
) {
  return apiFetch<any[]>(
    `${API_URL}/barbershops/${slug}/appointments/by-email?email=${email}&filter=${filter}`,
  );
}

export function resendCancelLink(slug: string, id: number, email: string) {
  return apiFetch<void>(
    `${API_URL}/barbershops/${slug}/appointments/${id}/resend-cancel-link?email=${email}`,
    { method: "POST" },
  );
}

export async function rescheduleAppointment(
  slug: string,
  id: number,
  startTime: string,
) {
  try {
    const res = await fetch(
      `${API_URL}/barbershops/${slug}/appointments/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startTime }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      return { error: true, message: data.message };
    }

    return { data };
  } catch {
    return { error: true, message: "Network error" };
  }
}
