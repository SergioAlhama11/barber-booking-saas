"use client";

import { AdminModal } from "@/components/admin/common/AdminModal";

import type { AdminAppointment } from "@/services/admin/appointments/types";

type Props = {
  appointment: AdminAppointment | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

export function CancelAppointmentDialog({
  appointment,
  open,
  onClose,
  onConfirm,
  loading = false,
}: Props) {
  if (!appointment) {
    return null;
  }

  return (
    <AdminModal
      open={open}
      title="Cancelar cita"
      onClose={onClose}
      maxWidth="md"
      danger
    >
      <p className="text-sm text-slate-300">
        ¿Seguro que quieres cancelar la cita de{" "}
        <strong>{appointment.customerName}</strong>?
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-xl border border-white/10 px-4 py-2 text-white"
        >
          Volver
        </button>

        <button
          onClick={onConfirm}
          disabled={loading}
          className="rounded-xl bg-red-600 px-4 py-2 text-white"
        >
          Confirmar
        </button>
      </div>
    </AdminModal>
  );
}
