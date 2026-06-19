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
import { useMagicAccess } from "@/hooks/booking/useMagicAccess";
import ErrorState from "@/components/ErrorState";

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

  const loadSlots = useCallback(
    async (targetDate?: string) => {
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

        setSelectedSlot((prev) => {
          if (slots.length === 0) {
            return null;
          }

          if (prev && slots.includes(prev)) {
            return prev;
          }

          return slots[0];
        });
      } catch {
        setError("Error cargando disponibilidad");
      } finally {
        setLoadingSlots(false);
      }
    },
    [appointment, date, slug],
  );

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
        <ErrorState
          title="No se puede modificar esta reserva"
          description={
            error ??
            "La reserva no existe, ya fue eliminada o el enlace ha expirado."
          }
          actionLabel="Volver a mis citas"
          onAction={() => router.push(`/barbershops/${slug}/my-bookings`)}
        />
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
        <ErrorState
          title="Esta cita está cancelada"
          description="Las citas canceladas no pueden ser reprogramadas."
          actionLabel="Reservar nueva cita"
          onAction={() => router.push(`/barbershops/${slug}`)}
        />
      </AppContainer>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <AppContainer>
      <div className="w-full space-y-6">
        <section className="overflow-hidden rounded-[2.5rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(60,130,246,0.18),transparent_30%),linear-gradient(180deg,rgba(17,24,39,0.96),rgba(11,16,28,0.94))] shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
          {/* MOBILE */}

          <div className="space-y-6 px-5 py-5 lg:hidden">
            <div>
              <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-cyan-200">
                Reprogramar cita
              </div>

              <p className="mt-5 text-sm uppercase tracking-[0.2em] text-slate-500">
                {formatDate(appointment.startTime)}
              </p>

              <h1 className="mt-3 text-5xl font-bold leading-[0.9] tracking-tight text-white">
                {appointment.serviceName}
              </h1>

              <p className="mt-4 text-lg text-slate-300">
                con{" "}
                <span className="font-semibold text-white">
                  {appointment.barberName}
                </span>
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.8rem] border border-white/8 bg-black/20 p-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  Horario actual
                </p>

                <p className="mt-3 text-5xl font-bold leading-none text-white">
                  {formatTime(appointment.startTime)}
                </p>
              </div>

              <div className="rounded-[1.8rem] border border-white/8 bg-black/20 p-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  Nueva fecha
                </p>

                <p className="mt-3 text-2xl font-bold text-white">
                  {formatDate(date)}
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  {slots.length} huecos disponibles
                </p>
              </div>
            </div>

            <div className="rounded-[1.9rem] border border-white/8 bg-[#111827]/88 p-4">
              <DateSelector
                date={date}
                minDate={today}
                onChange={setDate}
                onCheck={loadSlots}
              />
            </div>

            <div className="rounded-[1.9rem] border border-white/8 bg-[#111827]/88 p-4">
              {loadingSlots ? (
                <div className="rounded-2xl border border-white/8 bg-black/20 px-5 py-10 text-center text-sm text-slate-400">
                  Buscando horarios disponibles...
                </div>
              ) : (
                <>
                  <SlotSelector
                    slots={slots}
                    selectedSlot={selectedSlot}
                    onSelect={setSelectedSlot}
                  />

                  {!loadingSlots && slots.length === 0 && (
                    <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-5 text-center">
                      <p className="text-base font-semibold text-white">
                        No hay disponibilidad
                      </p>

                      <p className="mt-2 text-sm text-slate-400">
                        Prueba con otra fecha para encontrar nuevos huecos.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {selectedSlot && (
              <div className="rounded-[1.9rem] border border-cyan-400/20 bg-cyan-400/10 p-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/70">
                  Nuevo horario
                </p>

                <div className="mt-4">
                  <p className="text-4xl font-bold leading-none text-white">
                    {selectedSlot}
                  </p>

                  <p className="mt-2 text-sm text-slate-300">
                    {formatDate(date)}
                  </p>
                </div>

                {error && (
                  <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading || !selectedSlot}
                  className={`mt-5 inline-flex h-12 w-full items-center justify-center rounded-2xl px-5 text-sm font-semibold transition ${
                    loading || !selectedSlot
                      ? "cursor-not-allowed bg-slate-800 text-slate-500"
                      : "bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                  }`}
                >
                  {loading ? "Actualizando..." : "Confirmar nuevo horario"}
                </button>
              </div>
            )}

            {magicMessage && (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-200">
                {magicMessage}
              </div>
            )}
          </div>

          {/* DESKTOP */}

          <div className="hidden lg:grid gap-5 items-start px-6 py-6 xl:px-8 xl:py-8">
            {/* CONTENT */}

            <div className="space-y-5">
              {/* TOP */}

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
                {/* HERO */}

                <div className="rounded-[1.9rem] border border-white/8 bg-[#111827]/88 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
                  <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-cyan-200">
                    Reprogramar cita
                  </div>

                  <p className="mt-6 text-sm uppercase tracking-[0.2em] text-slate-500">
                    {formatDate(appointment.startTime)}
                  </p>

                  <h1 className="mt-3 text-6xl font-bold leading-[0.88] tracking-tight text-white">
                    {appointment.serviceName}
                  </h1>

                  <p className="mt-4 text-xl text-slate-300">
                    con{" "}
                    <span className="font-semibold text-white">
                      {appointment.barberName}
                    </span>
                  </p>
                </div>

                {/* STATUS */}

                <aside className="rounded-[1.9rem] border border-white/8 bg-[#111827] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-blue-200/70">
                    Estado de la reprogramación
                  </p>

                  <div className="mt-6 space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <p className="text-sm text-slate-500">Servicio</p>

                        <p className="mt-1 text-base font-semibold text-white">
                          {appointment.serviceName}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">Barbero</p>

                        <p className="mt-1 text-base font-semibold text-white">
                          {appointment.barberName}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <p className="text-sm text-slate-500">Fecha actual</p>

                        <p className="mt-1 text-base font-semibold text-white">
                          {formatDate(appointment.startTime)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">Hora actual</p>

                        <p className="mt-1 text-base font-semibold text-white">
                          {formatTime(appointment.startTime)}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-white/8 pt-5">
                      <p className="text-sm text-slate-500">Nuevo horario</p>

                      <p className="mt-2 text-lg font-semibold text-cyan-300">
                        {selectedSlot
                          ? `${formatDate(date)} · ${selectedSlot.slice(0, 5)}`
                          : "Pendiente"}
                      </p>
                    </div>
                  </div>
                </aside>
              </div>

              {/* INFO */}

              <div className="grid gap-5 xl:grid-cols-2">
                <section className="rounded-[1.9rem] border border-white/8 bg-[#111827]/88 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-blue-200/70">
                    Horario actual
                  </p>

                  <p className="mt-5 text-6xl font-bold leading-none text-white">
                    {formatTime(appointment.startTime)}
                  </p>
                </section>

                <section className="rounded-[1.9rem] border border-white/8 bg-[#111827]/88 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-blue-200/70">
                    Nueva fecha
                  </p>

                  <p className="mt-5 text-3xl font-bold text-white">
                    {formatDate(date)}
                  </p>

                  <p className="mt-3 text-sm text-slate-400">
                    {slots.length} huecos disponibles
                  </p>
                </section>
              </div>

              {/* CALENDAR + SLOTS */}

              <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
                <section className="rounded-[1.9rem] border border-white/8 bg-[#111827]/88 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
                  <DateSelector
                    compact
                    date={date}
                    minDate={today}
                    onChange={setDate}
                    onCheck={loadSlots}
                  />
                </section>

                <section className="rounded-[1.9rem] border border-white/8 bg-[#111827]/88 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
                  {loadingSlots ? (
                    <div className="rounded-2xl border border-white/8 bg-black/20 px-5 py-10 text-center text-sm text-slate-400">
                      Buscando horarios disponibles...
                    </div>
                  ) : slots.length > 0 ? (
                    <SlotSelector
                      compact
                      slots={slots}
                      selectedSlot={selectedSlot}
                      onSelect={setSelectedSlot}
                    />
                  ) : (
                    <div className="flex min-h-[320px] items-center justify-center rounded-[1.6rem] border border-red-500/20 bg-red-500/10 p-6 text-center">
                      <div className="max-w-xs">
                        <p className="text-lg font-semibold text-white">
                          No hay disponibilidad
                        </p>

                        <p className="mt-3 text-sm leading-6 text-slate-300">
                          Prueba con otra fecha para encontrar nuevos huecos.
                        </p>
                      </div>
                    </div>
                  )}
                </section>
              </div>

              {magicMessage && (
                <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-200">
                  {magicMessage}
                </div>
              )}

              {/* ACTION */}

              {selectedSlot ? (
                <div className="rounded-[1.9rem] border border-cyan-400/20 bg-cyan-400/10 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
                  <div className="flex items-center justify-between gap-5">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/70">
                        Confirmar cambio
                      </p>

                      <p className="mt-4 text-4xl font-bold leading-none text-white">
                        {selectedSlot.slice(0, 5)}
                      </p>

                      <p className="mt-2 text-sm text-slate-300">
                        {formatDate(date)}
                      </p>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={loading || !selectedSlot}
                      className={`inline-flex h-12 items-center justify-center rounded-2xl px-6 text-sm font-semibold transition ${
                        loading || !selectedSlot
                          ? "cursor-not-allowed bg-slate-800 text-slate-500"
                          : "bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                      }`}
                    >
                      {loading ? "Actualizando..." : "Confirmar nuevo horario"}
                    </button>
                  </div>

                  {error && (
                    <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                      {error}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-[1.9rem] border border-white/8 bg-[#111827] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-blue-200/70">
                    Siguiente paso
                  </p>

                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    Selecciona una nueva fecha y un horario disponible para
                    completar la reprogramación.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppContainer>
  );
}
