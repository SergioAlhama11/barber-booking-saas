"use client";

import type { AdminAppointment } from "@/services/admin/appointments/types";
import {
  formatAppointmentRange,
  formatDayLabel,
  formatShortDate,
  formatTime,
  getAppointmentState,
  isAppointmentLocked,
} from "./utils";

import { AppointmentSourceBadge } from "./AppointmentSourceBadge";

type Props = {
  appointment: AdminAppointment;
  onEdit: (appointment: AdminAppointment) => void;
  onCancel: (appointment: AdminAppointment) => void;
};

export function AppointmentCard({ appointment, onEdit, onCancel }: Props) {
  const state = getAppointmentState(appointment);
  const locked = isAppointmentLocked(appointment);

  const modifyButtonClass = locked
    ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-slate-500"
    : "border-cyan-400/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20";

  const cancelButtonClass = locked
    ? "cursor-not-allowed text-slate-500"
    : "text-red-300 hover:text-red-200";

  return (
    <article className="px-4 py-3 sm:px-6 transition-colors hover:bg-white/[0.02]">
      {/* Mobile */}

      <div className="space-y-3 lg:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-300/80">
              {formatDayLabel(appointment.startTime)}
            </p>

            <p className="mt-2 text-[2.5rem] leading-none font-semibold tracking-tight text-white">
              {formatTime(appointment.startTime)}
            </p>

            <p className="mt-1 text-sm text-slate-400">
              hasta {formatTime(appointment.endTime)}
            </p>
          </div>

          <div className="flex flex-col items-start gap-2">
            <span
              className={`inline-flex justify-center rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] whitespace-nowrap ${state.tone}`}
            >
              {state.label}
            </span>

            <AppointmentSourceBadge source={appointment.source} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xl font-semibold text-white">
                {appointment.customerName}
              </p>

              <p className="mt-1 hidden break-all text-sm text-slate-400 sm:block">
                {appointment.customerEmail}
              </p>
            </div>

            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-300">
              {formatShortDate(appointment.startTime)}
            </div>
          </div>

          <p className="text-sm text-slate-300">
            {appointment.serviceName}
            <span className="mx-2 text-slate-600">·</span>
            {appointment.barberName}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              disabled={locked}
              onClick={() => onEdit(appointment)}
              className={`h-10 rounded-xl border px-4 text-xs font-semibold transition ${modifyButtonClass}`}
            >
              Modificar
            </button>

            <button
              disabled={locked}
              onClick={() => onCancel(appointment)}
              className={`h-10 rounded-xl border px-4 text-xs font-semibold transition ${cancelButtonClass}`}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      {/* Desktop */}

      <div className="hidden lg:grid lg:grid-cols-[minmax(260px,2.3fr)_minmax(180px,1fr)_minmax(220px,1fr)_130px_220px] lg:items-center lg:gap-6">
        <div>
          <p className="text-base font-semibold text-white">
            {appointment.customerName}
          </p>

          <p className="mt-0.5 text-sm text-slate-400">
            {appointment.customerEmail}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-100">
            {appointment.serviceName}
          </p>

          <p className="mt-1 text-xs text-cyan-300/70">
            {appointment.barberName}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-white">
            {formatAppointmentRange(appointment.startTime, appointment.endTime)}
          </p>
        </div>

        <div className="flex flex-col items-start gap-2">
          <span
            className={`inline-flex justify-center rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] whitespace-nowrap ${state.tone}`}
          >
            {state.label}
          </span>

          <AppointmentSourceBadge source={appointment.source} />
        </div>

        <div className="flex items-center gap-4">
          <button
            disabled={locked}
            onClick={() => onEdit(appointment)}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${modifyButtonClass}`}
          >
            Modificar
          </button>

          <button
            disabled={locked}
            onClick={() => onCancel(appointment)}
            className={`text-xs font-semibold transition ${cancelButtonClass}`}
          >
            Cancelar
          </button>
        </div>
      </div>
    </article>
  );
}
