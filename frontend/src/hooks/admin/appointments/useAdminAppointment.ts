import { useCallback, useState } from "react";
import { getAdminAppointment } from "@/services/admin/appointments/api";
import type { AdminAppointment } from "@/services/admin/appointments/types";

export function useAdminAppointment() {
  const [appointment, setAppointment] = useState<AdminAppointment | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAppointment = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      const appointment = await getAdminAppointment(id);

      setAppointment(appointment);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error loading appointment",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    appointment,
    loading,
    error,
    loadAppointment,
  };
}
