const API_URL = "http://localhost:8080";

// 🔥 CORE: wrapper común para todas las llamadas
async function apiFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw {
      status: res.status,
      message: data?.message || "Unexpected error",
      code: data?.code,
    };
  }

  return data;
}

// Barbershop

export function getServices(slug: string) {
  return apiFetch(`${API_URL}/barbershops/${slug}/services`);
}

export function getBarbers(slug: string) {
  return apiFetch(`${API_URL}/barbershops/${slug}/barbers`);
}

// Availability

export function getAvailability(
  slug: string,
  barberId: number,
  serviceId: number,
  date: string,
) {
  return apiFetch(
    `${API_URL}/barbershops/${slug}/availability?barberId=${barberId}&serviceId=${serviceId}&date=${date}`,
  );
}

// Appointments

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
  return apiFetch(`${API_URL}/barbershops/${slug}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export function cancelAppointment(token: string, slug: string) {
  return apiFetch(
    `${API_URL}/barbershops/${slug}/appointments/cancel?token=${token}`,
    {
      method: "DELETE",
    },
  );
}

export function getAppointmentsByEmail(
  slug: string,
  email: string,
  filter: string = "ALL",
) {
  return apiFetch(
    `${API_URL}/barbershops/${slug}/appointments/by-email?email=${email}&filter=${filter}`,
  );
}
