"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { formatDate, formatTime } from "@/services/dateService";
import AppContainer from "@/components/AppContainer";
import {
  getAppointment,
  cancelAppointment,
  type Appointment,
} from "@/services/api";
import { useMagicAccess } from "@/hooks/useMagicAccess";

export default function BookingDetailPage() {
  const router = useRouter();
  const { id, slug } = useParams() as { id: string; slug: string };

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const { consumeMagicToken, magicMessage, magicToken } = useMagicAccess(
    searchParams.get("token"),
  );

  useEffect(() => {
    async function load() {
      try {
        if (magicToken) {
          await consumeMagicToken();
          window.history.replaceState(
            {},
            "",
            `/barbershops/${slug}/my-bookings/${id}`,
          );
        }
      } catch {
        setError("El enlace no es valido o ha expirado");
        return;
      }

      const res = await getAppointment(slug, Number(id));

      if (res.error || !res.data) {
        setError(res.message ?? "No se puede acceder a esta reserva");
        return;
      }

      setAppointment(res.data);
    }

    load();
  }, [consumeMagicToken, id, magicToken, slug]);

  async function handleCancel() {
    if (!confirm("¿Seguro que quieres cancelar la cita?")) return;

    const res = await cancelAppointment(slug, Number(id));

    if (res.error) {
      setError(res.message ?? "Error cancelando la cita");
      return;
    }

    router.replace(`/barbershops/${slug}/my-bookings`);
  }

  if (error) {
    return (
      <AppContainer>
        <div className="rounded-[30px] border border-red-500/20 bg-red-500/10 px-5 py-6 text-center space-y-4">
          <p className="text-lg font-semibold text-red-200">{error}</p>
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

  const isCancelled = !!appointment.cancelledAt;

  return (
    <AppContainer>
      <section className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,24,38,0.98),rgba(11,16,26,0.98))] px-5 py-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-300">
            Detalle de la cita
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-[2.35rem] font-semibold leading-none tracking-tight text-white">
                {appointment.serviceName}
              </h1>
              <p className="text-sm text-gray-400">
                {appointment.barberName} · {formatDate(appointment.startTime)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
                Hora
              </p>
              <p className="text-[2.15rem] font-semibold leading-none text-white">
                {formatTime(appointment.startTime)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {magicMessage && (
        <p className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-center text-sm text-green-200">
          {magicMessage}
        </p>
      )}

      <section
        className={`rounded-[30px] border px-5 py-5 shadow-[0_10px_40px_rgba(0,0,0,0.22)] ${
          isCancelled
            ? "border-red-500/20 bg-[#16131a]"
            : "border-white/8 bg-[#121826]"
        }`}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/6 bg-black/20 px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
              Servicio
            </p>
            <p className="mt-1 text-base font-medium text-white">
              {appointment.serviceName}
            </p>
          </div>

          <div className="rounded-2xl border border-white/6 bg-black/20 px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
              Barbero
            </p>
            <p className="mt-1 text-base font-medium text-white">
              {appointment.barberName}
            </p>
          </div>

          <div className="rounded-2xl border border-white/6 bg-black/20 px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
              Fecha
            </p>
            <p className="mt-1 text-base font-medium text-white">
              {formatDate(appointment.startTime)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/6 bg-black/20 px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
              Hora
            </p>
            <p className="mt-1 text-base font-medium text-white">
              {formatTime(appointment.startTime)}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <span
            className={`inline-flex rounded-full border px-3 py-1.5 text-sm font-medium ${
              isCancelled
                ? "border-red-500/20 bg-red-500/10 text-red-200"
                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            {isCancelled ? "Cancelada" : "Activa"}
          </span>
        </div>
      </section>

      <div className="space-y-3">
        {!isCancelled ? (
          <>
            <button
              onClick={() =>
                router.push(
                  `/barbershops/${slug}/my-bookings/${id}/reschedule`,
                )
              }
              className="w-full rounded-2xl bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-500"
            >
              Modificar cita
            </button>

            <button
              onClick={() => handleCancel()}
              className="w-full rounded-2xl bg-red-600 py-3.5 font-semibold text-white transition hover:bg-red-500"
            >
              Cancelar cita
            </button>
            <a
              href={`/api/barbershops/${slug}/appointments/${id}/calendar`}
              className="block w-full rounded-2xl border border-white/8 bg-white/[0.04] py-3.5 text-center font-medium text-white transition hover:bg-white/[0.07]"
            >
              Añadir al calendario
            </a>
          </>
        ) : (
          <button
            onClick={() => router.push(`/barbershops/${slug}`)}
            className="w-full rounded-2xl bg-white py-3.5 font-semibold text-black transition hover:bg-slate-200"
          >
            Reservar nueva cita
          </button>
        )}

        <button
          onClick={() => router.back()}
          className="w-full rounded-2xl border border-white/8 bg-white/[0.04] py-3.5 font-medium text-white transition hover:bg-white/[0.07]"
        >
          Volver
        </button>
      </div>
    </AppContainer>
  );
}
