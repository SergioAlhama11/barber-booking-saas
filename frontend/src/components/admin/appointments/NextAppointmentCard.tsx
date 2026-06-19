"use client";

import type { AdminAppointment } from "@/services/admin/appointments/types";
import { formatDayLabel, formatTime } from "./utils";

type Props = {
  appointment: AdminAppointment | null;
};

export function NextAppointmentCard({ appointment }: Props) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-[#0b1120]/75 p-5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
        PRÓXIMA CITA
      </p>

      {appointment ? (
        <>
          <p className="mt-4 text-5xl font-bold tracking-tight text-white">
            {formatTime(appointment.startTime)}
          </p>

          <p className="mt-1 text-sm text-cyan-300">
            {formatDayLabel(appointment.startTime)}
          </p>

          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="font-medium text-white">{appointment.customerName}</p>

            <p className="mt-1 text-sm text-slate-400">
              {appointment.serviceName}
            </p>
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm text-slate-400">
          No hay reservas pendientes.
        </p>
      )}
    </div>
  );
}
