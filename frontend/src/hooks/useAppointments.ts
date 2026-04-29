import { useState } from "react";
import { Appointment } from "@/services/api";
import { apiFetch } from "@/services/api";

export function useAppointments(slug: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchAppointments() {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("auth_token");

    if (!token) {
      setError("SESSION_EXPIRED");
      setLoading(false);
      return;
    }

    const response = await apiFetch<Appointment[]>(
      `/barbershops/${slug}/appointments?filter=ALL`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    setLoading(false);

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("auth_token");
      setError("SESSION_EXPIRED");
      return;
    }

    if (response.error || !response.data) {
      setError(response.message || "Error loading appointments");
      return;
    }

    const sorted = [...response.data].sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );

    setAppointments(sorted);
  }

  const now = new Date();

  const future = appointments.filter((a) => {
    const start = new Date(a.startTime);
    return start > now && !a.cancelledAt;
  });

  const past = appointments.filter((a) => {
    const start = new Date(a.startTime);
    return start <= now && !a.cancelledAt;
  });

  const cancelled = appointments.filter((a) => a.cancelledAt);

  return {
    future,
    past,
    cancelled,
    loading,
    error,
    fetchAppointments,
  };
}
