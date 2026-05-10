"use client";

import AppHeader from "@/components/AppHeader";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatDate, formatTime } from "@/services/dateService";
import { getAppointment, type Appointment } from "@/services/api";

export default function ConfirmationPage() {
  const { id, slug } = useParams() as {
    id: string;
    slug: string;
  };

  const router = useRouter();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =========================
  // FETCH
  // =========================

  useEffect(() => {
    async function fetchAppointment() {
      const res = await getAppointment(slug, Number(id));

      if (res.error || !res.data) {
        setError(res.message ?? "Error cargando la reserva");
        setLoading(false);
        return;
      }

      setAppointment(res.data);
      setLoading(false);
    }

    if (id && slug) fetchAppointment();
  }, [id, slug]);

  // =========================
  // AUTO REDIRECT
  // =========================

  useEffect(() => {
    if (!appointment) return;

    const timer = setTimeout(() => {
      router.push(`/barbershops/${slug}`);
    }, 15000);

    return () => clearTimeout(timer);
  }, [appointment, slug, router]);

  // =========================
  // STATES
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <AppHeader />
        <div className="mx-auto max-w-md px-4 py-8 text-center text-gray-400">
          Cargando reserva...
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-black text-white">
        <AppHeader />

        <div className="max-w-md mx-auto px-4 py-8 text-center space-y-5">
          <div className="rounded-[32px] border border-red-500/20 bg-red-500/10 px-5 py-6">
            <p className="text-lg font-semibold text-red-200">
              No se pudo cargar la reserva
            </p>
            <p className="mt-2 text-sm text-red-100/75">
              Revisa el enlace o vuelve al inicio para reservar de nuevo.
            </p>
          </div>

          <button
            onClick={() => router.push(`/barbershops/${slug}`)}
            className="w-full rounded-2xl border border-white/8 bg-white/[0.04] py-3.5 font-medium text-white transition hover:bg-white/[0.07]"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // =========================
  // SUCCESS
  // =========================

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader />

      <div className="w-full max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="rounded-[34px] border border-emerald-500/20 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_60%),linear-gradient(180deg,rgba(17,24,39,0.95),rgba(10,15,25,0.95))] px-5 py-6 shadow-[0_16px_48px_rgba(0,0,0,0.35)]">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-emerald-200">
              Reserva confirmada
            </div>

            <div className="space-y-2">
              <h1 className="text-[2.4rem] font-semibold leading-[1.05] tracking-tight text-white">
                Todo listo para tu próxima cita
              </h1>

              <p className="max-w-sm text-sm leading-6 text-gray-300">
                Hemos guardado tu reserva y ya puedes añadirla al calendario o
                gestionarla desde la app cuando quieras.
              </p>
            </div>
          </div>
        </div>

        <section className="rounded-[32px] border border-white/8 bg-[#121826] px-5 py-5 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
                Resumen
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                {appointment.serviceName} con {appointment.barberName}
              </h2>
            </div>
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-right">
              <p className="text-[11px] uppercase tracking-[0.18em] text-blue-200/80">
                Hora
              </p>
              <p className="text-2xl font-semibold text-white">
                {formatTime(appointment.startTime)}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
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
                Email
              </p>
              <p className="mt-1 truncate text-base font-medium text-white">
                {appointment.customerEmail}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-white/8 bg-[#0f1522] px-5 py-5 space-y-3">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
              Calendario
            </p>
            <h2 className="text-xl font-semibold text-white">
              Guárdalo donde te venga mejor
            </h2>
            <p className="text-sm text-gray-400">
              Compatible con Google Calendar, Apple Calendar y Outlook.
            </p>
          </div>

          <a
            href={`/api/barbershops/${slug}/appointments/${id}/calendar`}
            className="block w-full rounded-2xl bg-blue-600 py-3.5 text-center font-semibold text-white transition hover:bg-blue-500"
          >
            Añadir al calendario
          </a>
        </section>

        <div className="space-y-3">
          <button
            onClick={() => router.push(`/barbershops/${slug}/my-bookings`)}
            className="w-full rounded-2xl bg-white py-3.5 font-semibold text-black transition hover:bg-slate-200"
          >
            Ver mis citas
          </button>

          <button
            onClick={() => router.push(`/barbershops/${slug}`)}
            className="w-full rounded-2xl border border-white/8 bg-white/[0.04] py-3.5 font-medium text-white transition hover:bg-white/[0.07]"
          >
            Reservar otra cita
          </button>
        </div>

        <p className="text-center text-sm text-gray-500">
          Volverás al inicio automáticamente en unos segundos.
        </p>
      </div>
    </div>
  );
}
