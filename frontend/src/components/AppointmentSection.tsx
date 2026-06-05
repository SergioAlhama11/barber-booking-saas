"use client";

import AppointmentCard from "./AppointmentCard";

import type { Appointment } from "@/services/api";

type SectionProps = {
  title: string;
  appointments: Appointment[];
  statusVariant?: "upcoming" | "past" | "cancelled";
  onCancel?: (appointment: Appointment) => void;
};

export default function AppointmentSection({
  title,
  appointments,
  statusVariant = "upcoming",
  onCancel,
}: SectionProps) {
  if (!appointments?.length) {
    return null;
  }

  const description =
    statusVariant === "upcoming"
      ? "Gestiona tus próximas reservas"
      : statusVariant === "cancelled"
        ? "Reservas que ya no siguen activas"
        : "Historial de citas anteriores";

  return (
    <section className="space-y-5">
      {/* HEADER */}

      <div className="flex flex-col gap-4 rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(17,24,39,0.92),rgba(11,16,28,0.88))] p-5 backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between xl:p-6">
        <div>
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
            {appointments.length} reservas
          </div>

          <h2 className="mt-4 text-[2rem] font-bold tracking-tight text-white xl:text-[2.8rem]">
            {title}
          </h2>

          <p className="mt-2 text-sm text-slate-400 xl:text-base">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              statusVariant === "cancelled"
                ? "bg-red-400"
                : statusVariant === "past"
                  ? "bg-white"
                  : "bg-emerald-400"
            }`}
          />

          <span className="text-sm text-slate-300">
            {statusVariant === "upcoming"
              ? "Reservas activas"
              : statusVariant === "cancelled"
                ? "Reservas canceladas"
                : "Citas completadas"}
          </span>
        </div>
      </div>

      {/* CARDS */}

      <div className="grid gap-4">
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            statusVariant={statusVariant}
            onCancel={onCancel}
          />
        ))}
      </div>
    </section>
  );
}
