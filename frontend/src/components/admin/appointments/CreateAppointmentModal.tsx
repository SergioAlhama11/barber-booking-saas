"use client";

import { AdminModal } from "@/components/admin/common/AdminModal";

import type { AdminCreateAppointmentRequest } from "@/services/admin/appointments/types";
import type { AdminBarber } from "@/services/admin/barbers/types";
import type { AdminService } from "@/services/admin/services/types";

import { AppointmentForm } from "./AppointmentForm";

type Props = {
  open: boolean;
  slug: string;
  onClose: () => void;
  onSubmit: (request: AdminCreateAppointmentRequest) => Promise<void>;
  loading: boolean;
  barbers: AdminBarber[];
  services: AdminService[];
};

export function CreateAppointmentModal({
  open,
  slug,
  onClose,
  onSubmit,
  loading,
  barbers,
  services,
}: Props) {
  return (
    <AdminModal open={open} title="Nueva cita" onClose={onClose} maxWidth="xl">
      <AppointmentForm
        slug={slug}
        loading={loading}
        barbers={barbers}
        services={services}
        onSubmit={onSubmit}
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
