export type ImportedAppointment = {
  customerName: string;
  customerEmail: string;

  startTime: string;

  valid: boolean;
  warning?: string | null;
};

export type AppointmentImportPreviewResponse = {
  appointments: ImportedAppointment[];

  total: number;
  valid: number;
  invalid: number;

  warnings: string[];
};

export type AppointmentImportConfirmRequest = {
  barbershopId: number;
  barberId: number;
  serviceId: number;

  appointments: ImportedAppointment[];
};

export type AppointmentImportResult = {
  imported: number;
  failed: number;
  errors: string[];
};
