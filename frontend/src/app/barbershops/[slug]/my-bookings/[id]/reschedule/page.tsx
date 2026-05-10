"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import { useMagicAccess } from "@/hooks/useMagicAccess";

export default function ReschedulePage() {
  const router = useRouter();
  const { id, slug } = useParams() as { id: string; slug: string };
  const searchParams = useSearchParams();
  const { consumeMagicToken, magicMessage, magicToken } = useMagicAccess(
    searchParams.get("token"),
  );

  const today = getTodayLocal();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  // =========================
  // FETCH APPOINTMENT
  // =========================

  useEffect(() => {
    async function load() {
      try {
        if (magicToken) {
          await consumeMagicToken();
          window.history.replaceState(
            {},
            "",
            `/barbershops/${slug}/my-bookings/${id}/reschedule`,
          );
        }
      } catch {
        setLoadFailed(true);
        setError("El enlace no es valido o ha expirado");
        return;
      }

      const res = await getAppointment(slug, Number(id));

      if (res.error || !res.data) {
        setLoadFailed(true);
        setError(res.message ?? "Error cargando la cita");
        return;
      }

      setAppointment(res.data);
    }

    load();
  }, [consumeMagicToken, id, magicToken, slug]);

  // =========================
  // AUTO LOAD SLOTS
  // =========================

  // =========================
  // LOAD SLOTS
  // =========================

  const loadSlots = useCallback(async (targetDate?: string) => {
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
  }, [appointment, date, slug]);

  useEffect(() => {
    if (!appointment) return;
    loadSlots(date);
  }, [appointment, date, loadSlots]);

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

  if (loadFailed && !appointment) {
    return (
      <AppContainer>
        <div className="rounded-[30px] border border-red-500/20 bg-red-500/10 px-5 py-6 text-center space-y-4">
          <p className="text-lg font-semibold text-red-200">
            No se puede modificar esta reserva
          </p>
          <button
            onClick={() => router.push(`/barbershops/${slug}/my-bookings`)}
            className="w-full rounded-2xl bg-white py-3.5 font-medium text-black transition hover:bg-slate-200"
          >
            Volver a mis citas
          </button>
        </div>
      </AppContainer>
    );
  }

  if (!appointment) {
    return (
      <AppContainer>
        <div className="rounded-[28px] border border-white/8 bg-[#121826] px-5 py-7 text-center text-sm text-gray-400">
          Cargando...
        </div>
      </AppContainer>
    );
  }

  // =========================
  // CANCELLED
  // =========================

  if (appointment.cancelledAt) {
    return (
      <AppContainer>
        <div className="rounded-[30px] border border-red-500/20 bg-red-500/10 px-5 py-6 text-center space-y-4">
          <p className="text-lg font-semibold text-red-200">
            Esta cita está cancelada
          </p>

          <button
            onClick={() => router.push(`/barbershops/${slug}`)}
            className="w-full rounded-2xl bg-white py-3.5 font-medium text-black transition hover:bg-slate-200"
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
      <section className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,24,38,0.98),rgba(11,16,26,0.98))] px-5 py-6 text-center shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-blue-200">
          Reprogramar
        </div>

        <h1 className="mt-4 text-[2.4rem] font-semibold leading-[1] tracking-tight text-white">
          Modificar cita
        </h1>

        <p className="mt-3 text-base text-gray-300">
          {appointment.serviceName} — {appointment.barberName}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {formatDate(appointment.startTime)} ·{" "}
          {formatTime(appointment.startTime)}
        </p>
      </section>

      {magicMessage && (
        <p className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-center text-sm text-green-200">
          {magicMessage}
        </p>
      )}

      <DateSelector
        date={date}
        minDate={today}
        onChange={setDate}
        onCheck={loadSlots}
      />

      {loadingSlots && (
        <p className="rounded-[28px] border border-white/8 bg-[#121826] px-5 py-5 text-center text-sm text-gray-400">
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
        <div className="rounded-[28px] border border-red-500/20 bg-red-500/10 px-5 py-5 text-center space-y-2">
          <p className="text-base font-medium text-white">
            No hay disponibilidad para este día
          </p>
          <p className="text-sm text-gray-400">
            Prueba con otra fecha para encontrar un nuevo hueco.
          </p>
        </div>
      )}

      {error && <p className="text-center text-sm text-red-300">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading || !selectedSlot}
        className={`w-full py-3 rounded-2xl font-medium transition ${
          loading || !selectedSlot
            ? "bg-gray-800 text-gray-500"
            : "bg-blue-600 hover:bg-blue-500 text-white"
        }`}
      >
        {loading ? "Actualizando..." : "Confirmar nuevo horario"}
      </button>
    </AppContainer>
  );
}
