"use client";

import { formatDate, formatTime } from "@/services/dateService";
import { useRouter, useParams } from "next/navigation";

import type { Appointment } from "@/services/api";

type CardProps = {
  appointment: Appointment;
  statusVariant?: "upcoming" | "past" | "cancelled";
  onCancel?: (appointment: Appointment) => void;
};

export default function AppointmentCard({
  appointment,
  statusVariant = "upcoming",
  onCancel,
}: CardProps) {
  const isCancelled = !!appointment.cancelledAt;

  const resolvedVariant = isCancelled ? "cancelled" : statusVariant;

  const statusStyles =
    resolvedVariant === "cancelled"
      ? "border-red-500/20 bg-red-500/10 text-red-200"
      : resolvedVariant === "past"
        ? "border-white/10 bg-white/[0.05] text-slate-200"
        : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200";

  const statusLabel =
    resolvedVariant === "cancelled"
      ? "Cancelada"
      : resolvedVariant === "past"
        ? "Finalizada"
        : "Activa";

  const router = useRouter();

  const { slug } = useParams() as {
    slug: string;
  };

  return (
    <article
      className={`
        overflow-hidden rounded-[1.75rem]
        border border-white/8
        bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(11,16,28,0.94))]
        transition-all duration-300
        ${resolvedVariant === "cancelled" ? "border-red-500/15 opacity-[0.92]" : ""}
  `}
    >
      {/* MOBILE */}

      <div className="p-4 xl:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              {formatDate(appointment.startTime)}
            </p>

            <p className="mt-1 text-2xl font-bold text-white">
              {formatTime(appointment.startTime)}
            </p>
          </div>

          <span
            className={`rounded-full border px-3 py-1 text-[11px] font-medium ${statusStyles}`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="mt-4">
          <p className="font-semibold text-white">{appointment.serviceName}</p>

          <p className="mt-1 text-sm text-slate-400">
            {appointment.barberName}
          </p>
        </div>

        {resolvedVariant === "upcoming" && (
          <div className="flex flex-col items-end gap-4">
            <span
              className={`rounded-full border px-4 py-2 text-sm font-medium ${statusStyles}`}
            >
              {statusLabel}
            </span>

            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  router.push(
                    `/barbershops/${slug}/my-bookings/${appointment.id}/reschedule`,
                  )
                }
                className="inline-flex h-10 items-center justify-center rounded-xl bg-cyan-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                Modificar
              </button>

              <button
                onClick={() => onCancel?.(appointment)}
                className="text-sm font-medium text-red-300 transition hover:text-red-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP */}

      <div className="hidden xl:grid xl:grid-cols-[180px_minmax(0,1fr)_240px] xl:items-center xl:gap-6 xl:px-5 xl:py-4">
        {/* LEFT */}

        <div className="flex flex-col justify-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
            {formatDate(appointment.startTime)}
          </p>

          <p className="mt-4 text-[2.8rem] font-bold leading-none tracking-tight text-white">
            {formatTime(appointment.startTime)}
          </p>
        </div>

        {/* CENTER */}

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Servicio
            </p>

            <p className="mt-3 text-[1.3rem] font-semibold tracking-tight text-white">
              {appointment.serviceName}
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-white/8 bg-black/20 p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Barbero
            </p>

            <p className="mt-3 text-[1.3rem] font-semibold tracking-tight text-white">
              {appointment.barberName}
            </p>
          </div>
        </div>

        {/* RIGHT */}

        <div className="flex flex-col items-end justify-center gap-4">
          <span
            className={`rounded-full border px-4 py-2 text-sm font-medium ${statusStyles}`}
          >
            {statusLabel}
          </span>

          {resolvedVariant === "upcoming" && (
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  router.push(
                    `/barbershops/${slug}/my-bookings/${appointment.id}/reschedule`,
                  )
                }
                className="inline-flex h-10 items-center justify-center rounded-xl bg-cyan-300 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                Modificar
              </button>

              <button
                onClick={() => onCancel?.(appointment)}
                className="text-sm font-medium text-red-300 transition hover:text-red-200"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
