import { useState } from "react";
import { getAppointmentsByEmail, cancelAppointment } from "@/services/api";

export function useAppointments(slug: string) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchAppointments(email: string) {
    setLoading(true);
    setError(null);

    try {
      const data = await getAppointmentsByEmail(slug, email);

      data.sort(
        (a: any, b: any) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );

      setAppointments(data);
    } catch (err) {
      setError("Error al cargar citas");
    } finally {
      setLoading(false);
    }
  }

  const now = new Date();

  const future = appointments.filter(
    (a) => new Date(a.startTime) > now && !a.cancelledAt,
  );

  const past = appointments.filter(
    (a) => new Date(a.startTime) <= now && !a.cancelledAt,
  );

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
