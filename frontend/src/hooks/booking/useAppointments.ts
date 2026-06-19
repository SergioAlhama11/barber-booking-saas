import { useCallback, useState } from "react";
import { Appointment, apiFetch } from "@/services/api";
import { clearAuthSession } from "@/services/authSession";

export function useAppointments(slug: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    const response = await apiFetch<Appointment[]>(
      `/barbershops/${slug}/appointments?filter=ALL`,
    );

    setLoading(false);

    if (response.status === 401 || response.status === 403) {
      clearAuthSession();
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
  }, [slug]);

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
