"use client";

import { formatDate, formatTime } from "@/services/dateService";
import type { Appointment } from "@/services/api";

type CardProps = {
  appointment: Appointment;
  onClick?: () => void;
  statusVariant?: "upcoming" | "past" | "cancelled";
};

export default function AppointmentCard({
  appointment,
  onClick,
  statusVariant = "upcoming",
}: CardProps) {
  const isCancelled = !!appointment.cancelledAt;
  const resolvedVariant = isCancelled ? "cancelled" : statusVariant;
  const isInteractive = !!onClick;

  const statusStyles =
    resolvedVariant === "cancelled"
      ? "border-red-500/20 bg-red-500/10 text-red-200"
      : resolvedVariant === "past"
        ? "border-white/8 bg-white/[0.05] text-gray-300"
        : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200";

  const statusLabel =
    resolvedVariant === "cancelled"
      ? "Cancelada"
      : resolvedVariant === "past"
        ? "Finalizada"
        : "Activa";

  return (
    <div
      onClick={onClick}
      className={`
        rounded-[28px] border p-5 transition space-y-4
        ${
          resolvedVariant === "cancelled"
            ? "border-red-500/20 bg-[#121621] opacity-80 cursor-not-allowed"
            : isInteractive
              ? "cursor-pointer border-white/10 bg-[#121826] hover:-translate-y-0.5 hover:border-blue-400/30"
              : "border-white/8 bg-[#121826]"
        }
      `}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
            {formatDate(appointment.startTime)}
          </p>
          <p className="font-semibold text-white text-[2.2rem] leading-none">
            {formatTime(appointment.startTime)}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium ${statusStyles}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/6 bg-black/20 px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
            Servicio
          </p>
          <p className="mt-1 text-base font-medium text-white">
            {appointment.serviceName}
          </p>
        </div>

        <div className="rounded-2xl border border-white/6 bg-black/20 px-3 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
            Barbero
          </p>
          <p className="mt-1 text-base font-medium text-white">
            {appointment.barberName}
          </p>
        </div>
      </div>

      {isInteractive && (
        <p className="text-xs text-gray-500">
          Toca para ver el detalle y gestionar esta cita
        </p>
      )}
    </div>
  );
}
