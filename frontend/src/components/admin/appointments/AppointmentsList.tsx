"use client";

import type { AdminAppointment } from "@/services/admin/appointments/types";
import { AppointmentCard } from "./AppointmentCard";

type Props = {
  appointments: AdminAppointment[];
  loading: boolean;

  onEdit: (appointment: AdminAppointment) => void;
  onCancel: (appointment: AdminAppointment) => void;
};

export function AppointmentsList({
  appointments,
  loading,
  onEdit,
  onCancel,
}: Props) {
  if (loading) {
    return (
      <div className="divide-y divide-white/8">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="grid gap-4 px-6 py-4">
            <div className="h-5 rounded-full bg-white/8" />
            <div className="h-5 rounded-full bg-white/8" />
            <div className="h-5 rounded-full bg-white/8" />
          </div>
        ))}
      </div>
    );
  }

  if (!appointments.length) {
    return (
      <div className="px-6 py-10 text-center text-sm text-slate-400">
        No hay citas que coincidan con los filtros actuales.
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/8">
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onEdit={onEdit}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
}
