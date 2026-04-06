import { useState } from "react";
import { getAppointmentsByEmail, resendCancelLink } from "@/services/api";

export function useAppointments(slug: string) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchAppointments(email: string) {
    setLoading(true);
    setError(null);

    const response = await getAppointmentsByEmail(slug, email, "ALL");

    setLoading(false);

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

  async function resend(id: number, email: string) {
    const response = await resendCancelLink(slug, id, email);

    if (response.error) {
      setError(response.message || "Error resending email");
      return;
    }

    alert("Email reenviado 📩");
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
    resend,
  };
}
