"use client";

import { formatDate, formatTime } from "@/services/dateService";

type CardProps = {
  appointment: any;
  showCancel?: boolean;
  onResend?: (id: number) => void;
  onClick?: () => void;
};

export default function AppointmentCard({
  appointment,
  showCancel,
  onResend,
  onClick,
}: CardProps) {
  const isCancelled = !!appointment.cancelledAt;

  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-2xl border transition space-y-2
        ${
          isCancelled
            ? "bg-gray-900 border-red-800 opacity-60 cursor-not-allowed"
            : "bg-gray-900 border-gray-700 hover:scale-[1.02] cursor-pointer"
        }
      `}
    >
      {/* 🔥 HEADER */}
      <div className="flex justify-between items-center">
        <p className="font-semibold text-white">
          {formatTime(appointment.startTime)}
        </p>

        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            isCancelled
              ? "bg-red-900 text-red-400"
              : "bg-green-900 text-green-400"
          }`}
        >
          {isCancelled ? "Cancelada" : "Activa"}
        </span>
      </div>

      {/* 📅 FECHA */}
      <p className="text-sm text-gray-400">
        {formatDate(appointment.startTime)}
      </p>

      {/* 💈 INFO */}
      <div className="text-sm space-y-1">
        <p>
          <span className="text-gray-400">Servicio:</span>{" "}
          {appointment.serviceName}
        </p>

        <p>
          <span className="text-gray-400">Barbero:</span>{" "}
          {appointment.barberName}
        </p>
      </div>

      {/* 🔥 ACTION */}
      {showCancel && !isCancelled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onResend?.(appointment.id);
          }}
          className="mt-2 text-sm text-blue-400 hover:text-blue-300 underline"
        >
          Reenviar enlace de cancelación
        </button>
      )}
    </div>
  );
}
