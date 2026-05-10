"use client";

import AppointmentCard from "./AppointmentCard";
import type { Appointment } from "@/services/api";

type SectionProps = {
  title: string;
  appointments: Appointment[];
  onClick?: (appointment: Appointment) => void;
  statusVariant?: "upcoming" | "past" | "cancelled";
};

export default function AppointmentSection({
  title,
  appointments,
  onClick,
  statusVariant = "upcoming",
}: SectionProps) {
  if (!appointments || appointments.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-[1.85rem] leading-none font-semibold tracking-tight text-white">
            {title}
          </h2>
          <p className="text-sm text-gray-500">
            {statusVariant === "upcoming"
              ? "Gestiona tus proximas reservas"
              : statusVariant === "cancelled"
                ? "Reservas que ya no siguen activas"
                : "Citas anteriores de esta barberia"}
          </p>
        </div>
        <span className="min-w-10 rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-center text-xs font-medium text-gray-300">
          {appointments.length}
        </span>
      </div>

      {appointments.map((a) => {
        const isCancelled = !!a.cancelledAt;
        const isClickable =
          statusVariant === "upcoming" && !isCancelled && !!onClick;

        return (
          <AppointmentCard
            key={a.id}
            appointment={a}
            onClick={isClickable ? () => onClick(a) : undefined}
            statusVariant={statusVariant}
          />
        );
      })}
    </section>
  );
}
