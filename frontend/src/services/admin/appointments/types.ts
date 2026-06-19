export type AdminAppointmentStatus =
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED"
  | "ALL";

export type AppointmentSource = "ONLINE" | "MANUAL" | "IMPORTED";

export type AdminAppointment = {
  id: number;
  barbershopId: number;
  barberId: number;
  serviceId: number;

  source: AppointmentSource;

  barbershopName: string;
  barberName: string;
  serviceName: string;
  customerName: string;
  customerEmail: string;
  startTime: string;
  endTime: string;
  cancelledAt: string | null;
};
export type AdminAppointmentFilters = {
  from?: string;
  to?: string;
  barbershopId?: number;
  barberId?: number;
  status?: AdminAppointmentStatus;
  search?: string;
  page?: number;
  size?: number;
};

export type AdminCreateAppointmentRequest = {
  barberId: number;
  serviceId: number;
  customerName: string;
  customerEmail: string;
  startTime: string;
};

export type AdminUpdateAppointmentRequest = {
  barberId: number;
  serviceId: number;
  customerName: string;
  customerEmail: string;
  startTime: string;
};
