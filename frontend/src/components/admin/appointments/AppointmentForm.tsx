"use client";

import { useEffect, useState } from "react";

import type {
  AdminCreateAppointmentRequest,
  AdminUpdateAppointmentRequest,
} from "@/services/admin/appointments/types";
import type { AdminBarber } from "@/services/admin/barbers/types";
import type { AdminService } from "@/services/admin/services/types";

import { useAdminAvailability } from "@/hooks/admin/appointments/useAdminAvailability";

type Props = {
  slug: string;

  initialValues?: {
    barberId: number;
    serviceId: number;
    customerName: string;
    customerEmail: string;
    startTime: string;
  };

  barbers: AdminBarber[];

  services: AdminService[];

  loading: boolean;

  onSubmit: (
    request: AdminCreateAppointmentRequest | AdminUpdateAppointmentRequest,
  ) => Promise<void>;
};

export function AppointmentForm({
  slug,
  initialValues,
  barbers,
  services,
  loading,
  onSubmit,
}: Props) {
  const [barberId, setBarberId] = useState(initialValues?.barberId ?? 0);

  const [serviceId, setServiceId] = useState(initialValues?.serviceId ?? 0);

  const [customerName, setCustomerName] = useState(
    initialValues?.customerName ?? "",
  );

  const [customerEmail, setCustomerEmail] = useState(
    initialValues?.customerEmail ?? "",
  );

  const [date, setDate] = useState(
    initialValues?.startTime
      ? initialValues.startTime.slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  );

  const [selectedSlot, setSelectedSlot] = useState(
    initialValues?.startTime ?? "",
  );

  useEffect(() => {
    if (!initialValues) {
      return;
    }

    setBarberId(initialValues.barberId);
    setServiceId(initialValues.serviceId);
    setCustomerName(initialValues.customerName);
    setCustomerEmail(initialValues.customerEmail);

    setDate(initialValues.startTime.slice(0, 10));
    setSelectedSlot(initialValues.startTime);
  }, [initialValues]);

  const { slots, loading: loadingSlots } = useAdminAvailability(
    slug,
    serviceId || undefined,
    barberId || undefined,
    date,
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (
      !barberId ||
      !serviceId ||
      !customerName.trim() ||
      !customerEmail.trim() ||
      !selectedSlot
    ) {
      return;
    }

    await onSubmit({
      barberId,
      serviceId,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      startTime: selectedSlot,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-slate-300">Barbero</label>

          <select
            value={barberId}
            onChange={(event) => {
              setBarberId(Number(event.target.value));
              setSelectedSlot("");
            }}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white"
            required
          >
            <option value={0}>Selecciona un barbero</option>

            {barbers.map((barber) => (
              <option key={barber.id} value={barber.id}>
                {barber.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">Servicio</label>

          <select
            value={serviceId}
            onChange={(event) => {
              setServiceId(Number(event.target.value));
              setSelectedSlot("");
            }}
            className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white"
            required
          >
            <option value={0}>Selecciona un servicio</option>

            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">
          Nombre del cliente
        </label>

        <input
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">
          Email del cliente
        </label>

        <input
          type="email"
          value={customerEmail}
          onChange={(event) => setCustomerEmail(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white"
          required
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Fecha</label>

        <input
          type="date"
          value={date}
          min={new Date().toISOString().split("T")[0]}
          onChange={(event) => {
            setDate(event.target.value);
            setSelectedSlot("");
          }}
          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-slate-300">Horario</label>

        {loadingSlots ? (
          <p className="text-sm text-slate-400">Cargando horarios...</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-slate-400">No hay horarios disponibles.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot) => {
              const slotInstant = new Date(`${date}T${slot}`).toISOString();

              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slotInstant)}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    selectedSlot === slotInstant
                      ? "border-cyan-300 bg-cyan-300 text-slate-950"
                      : "border-white/10 bg-white/[0.04] text-white"
                  }`}
                >
                  {slot.slice(0, 5)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !selectedSlot}
        className="w-full rounded-xl bg-cyan-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
