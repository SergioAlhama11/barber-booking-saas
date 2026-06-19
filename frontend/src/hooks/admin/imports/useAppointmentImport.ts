import { useState } from "react";

import { confirmAppointmentImport } from "@/services/admin/imports/api";

import type {
  AppointmentImportConfirmRequest,
  AppointmentImportResult,
} from "@/services/admin/imports/types";

export function useAppointmentImport() {
  const [loading, setLoading] = useState(false);

  const importAppointments = async (
    request: AppointmentImportConfirmRequest,
  ): Promise<AppointmentImportResult> => {
    try {
      setLoading(true);

      const response = await confirmAppointmentImport(request);

      if (response.error || !response.data) {
        throw new Error(response.message ?? "Error importing appointments");
      }

      return response.data;
    } finally {
      setLoading(false);
    }
  };

  return {
    importAppointments,
    loading,
  };
}
