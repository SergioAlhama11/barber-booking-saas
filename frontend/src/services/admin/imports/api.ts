import { apiFetch } from "@/services/api";

import type {
  AppointmentImportPreviewResponse,
  AppointmentImportConfirmRequest,
  AppointmentImportResult,
} from "./types";

export async function previewAppointmentImport(
  barbershopId: number,
  file: File,
) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/imports/appointments/preview?barbershopId=${barbershopId}`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    },
  );

  return response.json() as Promise<AppointmentImportPreviewResponse>;
}

export function confirmAppointmentImport(
  request: AppointmentImportConfirmRequest,
) {
  return apiFetch<AppointmentImportResult>(
    "/admin/imports/appointments/confirm",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
  );
}
