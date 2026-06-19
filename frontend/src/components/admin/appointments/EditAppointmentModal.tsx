"use client";

import { AdminModal } from "@/components/admin/common/AdminModal";

import type {
  AdminAppointment,
  AdminUpdateAppointmentRequest,
} from "@/services/admin/appointments/types";

import type { AdminBarber } from "@/services/admin/barbers/types";
import type { AdminService } from "@/services/admin/services/types";

import { AppointmentForm } from "./AppointmentForm";

type Props = {
  appointment: AdminAppointment | null;
  slug: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (request: AdminUpdateAppointmentRequest) => Promise<void>;
  loading: boolean;
  barbers: AdminBarber[];
  services: AdminService[];
};

export function EditAppointmentModal({
  appointment,
  slug,
  open,
  onClose,
  onSubmit,
  loading,
  barbers,
  services,
}: Props) {
  if (!appointment) {
    return null;
  }

  return (
    <AdminModal
      open={open}
      title="Modificar cita"
      onClose={onClose}
      maxWidth="xl"
    >
      <AppointmentForm
        loading={loading}
        slug={slug}
        barbers={barbers}
        services={services}
        onSubmit={onSubmit}
        initialValues={{
          barberId: appointment.barberId,
          serviceId: appointment.serviceId,
          customerName: appointment.customerName,
          customerEmail: appointment.customerEmail,
          startTime: appointment.startTime,
        }}
      />

      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          disabled={loading}
          className="rounded-xl border border-white/10 px-4 py-2 text-white"
        >
          Cerrar
        </button>
      </div>
    </AdminModal>
  );
}
