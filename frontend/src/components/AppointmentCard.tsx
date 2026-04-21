"use client";

import { formatDate, formatTime } from "@/services/dateService";

type CardProps = {
  appointment: any;
  showCancel?: boolean;
  onResend?: (id: number) => void;
  onClick?: () => void;
  statusVariant?: "upcoming" | "past" | "cancelled";
};

export default function AppointmentCard({
  appointment,
  showCancel,
  onResend,
  onClick,
  statusVariant = "upcoming",
}: CardProps) {
  const isCancelled = !!appointment.cancelledAt;
  const resolvedVariant = isCancelled ? "cancelled" : statusVariant;
  const isInteractive = !!onClick;

  const statusStyles =
    resolvedVariant === "cancelled"
      ? "bg-red-900 text-red-400"
      : resolvedVariant === "past"
        ? "bg-gray-800 text-gray-300"
        : "bg-green-900 text-green-400";

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
        p-4 rounded-3xl border transition space-y-3
        ${
          resolvedVariant === "cancelled"
            ? "bg-gray-900 border-red-800 opacity-60 cursor-not-allowed"
            : isInteractive
              ? "bg-gray-900 border-gray-700 hover:scale-[1.02] cursor-pointer"
              : "bg-gray-900 border-gray-700"
        }
      `}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="space-y-1.5">
          <p className="font-semibold text-white text-[2rem] leading-none">
            {formatTime(appointment.startTime)}
          </p>

          <p className="text-sm text-gray-400">
            {formatDate(appointment.startTime)}
          </p>
        </div>

        <span
          className={`text-[11px] font-medium px-2.5 py-1 rounded-full shrink-0 ${statusStyles}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="text-sm space-y-0.5">
        <p>
          <span className="text-gray-400">Servicio:</span>{" "}
          {appointment.serviceName}
        </p>

        <p>
          <span className="text-gray-400">Barbero:</span>{" "}
          {appointment.barberName}
        </p>
      </div>

      {showCancel && !isCancelled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onResend?.(appointment.id);
          }}
          className="inline-flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200 transition mt-1"
        >
          <span aria-hidden="true">↗</span>
          Reenviar enlace de cancelación
        </button>
      )}
    </div>
  );
}
