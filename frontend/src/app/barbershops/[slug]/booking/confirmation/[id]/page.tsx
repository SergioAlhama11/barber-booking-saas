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
        <div className="p-6 text-center text-gray-400">Cargando reserva...</div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-black text-white">
        <AppHeader />

        <div className="p-6 max-w-md mx-auto text-center space-y-4">
          <p className="text-red-500 text-lg font-semibold">
            ❌ No se pudo cargar la reserva
          </p>

          <button
            onClick={() => router.push(`/barbershops/${slug}`)}
            className="w-full bg-gray-800 py-3 rounded-xl"
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

      <div className="w-full max-w-md mx-auto px-4 py-5 space-y-5">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-green-500 leading-tight">
            ✅ Reserva confirmada
          </h1>

          <p className="text-sm text-gray-400">
            Todo listo, te esperamos en la barbería.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-5 rounded-3xl text-left space-y-3">
          <div className="grid grid-cols-[92px_1fr] gap-y-3 text-sm sm:text-base">
            <span className="text-gray-400">Servicio</span>
            <span className="font-medium">{appointment.serviceName}</span>

            <span className="text-gray-400">Barbero</span>
            <span className="font-medium">{appointment.barberName}</span>

            <span className="text-gray-400">Fecha</span>
            <span className="font-medium">{formatDate(appointment.startTime)}</span>

            <span className="text-gray-400">Hora</span>
            <span className="font-medium">{formatTime(appointment.startTime)}</span>

            <span className="text-gray-400">Email</span>
            <span className="font-medium break-all">
              {appointment.customerEmail}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-400">Añádelo a tu calendario</p>

          <a
            href={`/api/barbershops/${slug}/appointments/${id}/calendar`}
            className="block w-full text-center bg-blue-600 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition"
          >
            Añadir al calendario
          </a>

          <p className="text-xs text-gray-500">
            Google, Apple y Outlook compatibles
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push(`/barbershops/${slug}/my-bookings`)}
            className="w-full bg-blue-600 py-3 rounded-2xl hover:bg-blue-700 transition"
          >
            Ver mis citas
          </button>

          <button
            onClick={() => router.push(`/barbershops/${slug}`)}
            className="w-full bg-gray-800 py-3 rounded-2xl hover:bg-gray-700 transition"
          >
            Reservar otra cita
          </button>
        </div>

        <p className="text-xs text-gray-500">
          Serás redirigido automáticamente en unos segundos...
        </p>
      </div>
    </div>
  );
}
