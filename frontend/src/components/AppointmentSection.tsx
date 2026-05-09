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
    <section className="space-y-4.5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[2rem] leading-none font-bold tracking-tight">{title}</h2>
        <span className="rounded-full bg-gray-900 px-2 py-1 text-xs text-gray-400 border border-gray-800 min-w-10 text-center">
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
