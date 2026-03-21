const API_URL = "http://localhost:8080";

export async function getServices(slug: string) {
  const res = await fetch(`${API_URL}/barbershops/${slug}/services`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error fetching services: ${text}`);
  }

  return res.json();
}

export async function getBarbers(slug: string) {
  const res = await fetch(`${API_URL}/barbershops/${slug}/barbers`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error fetching barbers: ${text}`);
  }

  return res.json();
}

export async function getAvailability(
  slug: string,
  barberId: number,
  serviceId: number,
  date: string,
) {
  const res = await fetch(
    `${API_URL}/barbershops/${slug}/availability?barberId=${barberId}&serviceId=${serviceId}&date=${date}`,
  );

  if (!res.ok) {
    const text = await res.text(); // 👈 DEBUG PRO
    throw new Error(`Error fetching availability: ${text}`);
  }

  return res.json();
}

export async function createAppointment(
  slug: string,
  data: {
    barberId: number;
    serviceId: number;
    customerName: string;
    customerEmail: string;
    startTime: string;
  },
) {
  const res = await fetch(
    `http://localhost:8080/barbershops/${slug}/appointments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw {
      status: res.status,
      message: body?.message || "Unknown error",
      code: body?.code,
    };
  }

  return body;
}

export async function cancelAppointment(token: string) {
  const res = await fetch(
    `${API_URL}/barbershops/barberia-sergio/appointments/cancel?token=${token}`,
    {
      method: "DELETE",
    },
  );

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw {
      status: res.status,
      message: data?.message || "Unknown error",
    };
  }
}
