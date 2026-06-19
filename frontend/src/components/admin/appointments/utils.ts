import type {
  AdminAppointment,
  AdminAppointmentStatus,
} from "@/services/admin/appointments/types";

export const PAGE_SIZE = 20;

export const STATUS_LABELS: Record<AdminAppointmentStatus, string> = {
  ACTIVE: "Activas",
  COMPLETED: "Completadas",
  CANCELLED: "Canceladas",
  ALL: "Todas",
};

export function toInstantRangeStart(value: string) {
  return value ? new Date(`${value}T00:00:00`).toISOString() : undefined;
}

export function toInstantRangeEnd(value: string) {
  return value ? new Date(`${value}T23:59:59.999`).toISOString() : undefined;
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDayLabel(value: string) {
  const date = new Date(value);

  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const targetDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const diffDays = Math.round(
    (targetDate.getTime() - startOfToday.getTime()) / 86400000,
  );

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Mañana";
  if (diffDays === -1) return "Ayer";

  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

export function formatAppointmentRange(start: string, end: string) {
  return `${new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(new Date(start))} · ${formatTime(start)} → ${formatTime(end)}`;
}

export function getAppointmentState(appointment: AdminAppointment) {
  if (appointment.cancelledAt) {
    return {
      label: "Cancelada",
      tone: "border border-red-500/40 bg-red-500/20 text-red-100",
    };
  }

  if (new Date(appointment.endTime).getTime() < Date.now()) {
    return {
      label: "Completada",
      tone: "border border-slate-500/20 bg-slate-500/10 text-slate-300",
    };
  }

  return {
    label: "Activa",
    tone: "border border-emerald-500/40 bg-emerald-500/15 text-emerald-100",
  };
}

export function isAppointmentLocked(appointment: AdminAppointment) {
  return (
    !!appointment.cancelledAt ||
    new Date(appointment.endTime).getTime() < Date.now()
  );
}
