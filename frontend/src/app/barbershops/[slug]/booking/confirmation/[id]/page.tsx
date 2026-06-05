"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppContainer from "@/components/AppContainer";
import { formatDate, formatTime } from "@/services/dateService";
import { getAppointment, type Appointment } from "@/services/api";
import ErrorState from "@/components/ErrorState";

export default function ConfirmationPage() {
  const { id, slug } = useParams() as {
    id: string;
    slug: string;
  };

  const router = useRouter();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    if (id && slug) {
      fetchAppointment();
    }
  }, [id, slug]);

  if (loading) {
    return (
      <AppContainer>
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/8 bg-[#121826] px-6 py-10 text-center text-slate-400">
          Cargando reserva...
        </div>
      </AppContainer>
    );
  }

  if (error || !appointment) {
    return (
      <AppContainer>
        <ErrorState
          title="Reserva no encontrada"
          description="La reserva que intentas consultar no existe o ya no está disponible."
          actionLabel="Volver"
          onAction={() => router.push(`/barbershops/${slug}`)}
        />
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* HERO */}

        <section className="overflow-hidden rounded-[2.5rem] border border-emerald-500/20 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_35%),linear-gradient(180deg,rgba(17,24,39,0.96),rgba(11,16,28,0.94))] px-8 py-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
          <div className="space-y-4">
            <div className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-emerald-200">
              Reserva confirmada
            </div>

            <div>
              <h1 className="max-w-3xl text-4xl font-bold leading-[0.95] tracking-tight text-white sm:text-4xl">
                Todo listo para tu próxima cita
              </h1>

              <p className="mt-2 text-lg font-medium text-slate-200">
                {formatDate(appointment.startTime)} ·{" "}
                {formatTime(appointment.startTime)}
              </p>

              <p className="mt-4 max-w-2xl text-base text-slate-300">
                Hemos guardado tu reserva correctamente. Puedes añadirla al
                calendario o gestionarla cuando quieras desde tu área de
                reservas.
              </p>
            </div>
          </div>
        </section>

        {/* CONTENT */}

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* DETALLES */}

          <section className="rounded-[2rem] border border-white/8 bg-[#121826] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Resumen de la cita
            </p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Servicio
                </p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {appointment.serviceName}
                </p>
              </div>

              <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Barbero
                </p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {appointment.barberName}
                </p>
              </div>

              <div className="rounded-2xl border border-white/6 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Fecha
                </p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {formatDate(appointment.startTime)}
                </p>
              </div>

              <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-blue-200/70">
                  Hora
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {formatTime(appointment.startTime)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/6 bg-black/20 p-4 md:col-span-2">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Email
                </p>

                <p className="mt-2 text-base text-slate-300 truncate">
                  {appointment.customerEmail}
                </p>
              </div>
            </div>
          </section>

          {/* ACCIONES */}

          <section className="rounded-[2rem] border border-white/8 bg-[#0f1522] p-6 flex flex-col">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Acciones
            </p>

            <h2 className="mt-3 text-2xl font-bold text-white">
              Gestiona tu reserva
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Guarda la cita en tu calendario o accede a tu área de reservas
              para gestionarla.
            </p>

            <div className="mt-auto space-y-3">
              <button
                onClick={() => router.push(`/barbershops/${slug}/my-bookings`)}
                className="w-full rounded-2xl bg-white py-3.5 font-semibold text-black transition hover:bg-slate-200"
              >
                Ver mis citas
              </button>

              <a
                href={`/api/barbershops/${slug}/appointments/${id}/calendar`}
                className="block w-full rounded-2xl bg-blue-600 py-3.5 text-center font-semibold text-white transition hover:bg-blue-500"
              >
                Añadir al calendario
              </a>
            </div>
          </section>
        </div>
      </div>
    </AppContainer>
  );
}
