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

export function getAvailability(
  slug: string,
  barberId: number,
  serviceId: number,
  date: string,
) {
  return apiFetch<{ slots: string[] }>(
    `${API_URL}/barbershops/${slug}/availability?barberId=${barberId}&serviceId=${serviceId}&date=${date}`,
  );
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
