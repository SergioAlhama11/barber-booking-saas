import { useState } from "react";

import { previewAppointmentImport } from "@/services/admin/imports/api";

import type { AppointmentImportPreviewResponse } from "@/services/admin/imports/types";

export function useAppointmentImportPreview() {
  const [loading, setLoading] = useState(false);

  const preview = async (
    barbershopId: number,
    file: File,
  ): Promise<AppointmentImportPreviewResponse> => {
    try {
      setLoading(true);

      return await previewAppointmentImport(barbershopId, file);
    } finally {
      setLoading(false);
    }
  };

  return {
    preview,
    loading,
  };
}
