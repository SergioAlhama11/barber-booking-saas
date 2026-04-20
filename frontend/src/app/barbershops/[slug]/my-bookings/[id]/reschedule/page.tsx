"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DateSelector from "@/components/DateSelector";
import SlotSelector from "@/components/SlotSelector";
import {
  getAvailability,
  rescheduleAppointment,
  getAppointment,
  type Appointment,
} from "@/services/api";
import {
  buildUTCDateTime,
  formatDate,
  formatTime,
  getTodayLocal,
} from "@/services/dateService";
import AppContainer from "@/components/AppContainer";

export default function ReschedulePage() {
  const router = useRouter();
  const { id, slug } = useParams() as { id: string; slug: string };

  const today = getTodayLocal();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // =========================
  // FETCH APPOINTMENT
  // =========================

  useEffect(() => {
    async function load() {
      const res = await getAppointment(slug, Number(id));

      if (res.error || !res.data) {
        setError(res.message ?? "Error cargando la cita");
        return;
      }

      setAppointment(res.data);
    }

    load();
  }, [id, slug]);

  // =========================
  // AUTO LOAD SLOTS
  // =========================

  useEffect(() => {
    if (!appointment) return;
    loadSlots(date);
  }, [appointment, date]);

  // =========================
  // LOAD SLOTS
  // =========================

  async function loadSlots(targetDate?: string) {
    if (!appointment) return;

    try {
      setLoadingSlots(true);
      setError(null);

      const finalDate = targetDate ?? date;

      const res = await getAvailability(
        slug,
        appointment.barberId,
        appointment.serviceId,
        finalDate,
      );

      if (res.error || !res.data) {
        setError(res.message ?? "Error cargando disponibilidad");
        return;
      }

      const slots = res.data.slots ?? [];

      setSlots(slots);
      setSelectedSlot((prev) => prev ?? slots[0] ?? null);
    } catch {
      setError("Error cargando disponibilidad");
    } finally {
      setLoadingSlots(false);
    }
  }

  // =========================
  // SUBMIT
  // =========================

  async function handleSubmit() {
    if (!selectedSlot) {
      setError("Selecciona un horario");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const startTime = buildUTCDateTime(date, selectedSlot);

      const res = await rescheduleAppointment(slug, Number(id), startTime);

      if (res.error) {
        setError(res.message ?? "Error actualizando cita");
        return;
      }

      router.push(
        `/barbershops/${slug}/booking/confirmation/${id}?rescheduled=true`,
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // LOADING
  // =========================

  if (!appointment) {
    return (
      <AppContainer>
        <p className="text-center text-gray-400 text-sm">Cargando...</p>
      </AppContainer>
    );
  }

  // =========================
  // CANCELLED
  // =========================

  if (appointment.cancelledAt) {
    return (
      <AppContainer>
        <div className="text-center space-y-4">
          <p className="text-red-500 text-lg font-semibold">
            Esta cita está cancelada
          </p>

          <button
            onClick={() => router.push(`/barbershops/${slug}`)}
            className="bg-blue-600 px-6 py-3 rounded-xl"
          >
            Reservar nueva cita
          </button>
        </div>
      </AppContainer>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <AppContainer>
      <h1 className="text-xl font-bold text-center">🔄 Modificar cita</h1>

      <div className="text-center text-gray-400 text-sm">
        <p>
          {appointment.serviceName} — {appointment.barberName}
        </p>

        <p>
          {formatDate(appointment.startTime)} ·{" "}
          {formatTime(appointment.startTime)}
        </p>
      </div>

      <DateSelector
        date={date}
        minDate={today}
        onChange={setDate}
        onCheck={loadSlots}
      />

      {loadingSlots && (
        <p className="text-center text-gray-400 text-sm">
          Cargando horarios...
        </p>
      )}

      {!loadingSlots && slots.length > 0 && (
        <SlotSelector
          slots={slots}
          selectedSlot={selectedSlot}
          onSelect={setSelectedSlot}
        />
      )}

      {!loadingSlots && slots.length === 0 && (
        <p className="text-center text-red-400 text-sm">
          ❌ No hay disponibilidad para este día
        </p>
      )}

      {error && <p className="text-red-500 text-center text-sm">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading || !selectedSlot}
        className={`w-full py-3 rounded-xl font-medium transition ${
          loading || !selectedSlot
            ? "bg-gray-700 text-gray-400"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {loading ? "Actualizando..." : "Actualizar cita"}
      </button>
    </AppContainer>
  );
}
