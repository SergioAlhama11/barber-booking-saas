"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatDate, formatTime } from "@/services/dateService";
import AppContainer from "@/components/AppContainer";
import { getAppointment, type Appointment } from "@/services/api";

export default function BookingDetailPage() {
  const router = useRouter();
  const { id, slug } = useParams() as { id: string; slug: string };

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await getAppointment(slug, Number(id));

      if (res.error || !res.data) {
        setError(res.message ?? "No se puede acceder a esta reserva");
        return;
      }

      setAppointment(res.data);
    }

    load();
  }, [id, slug]);

  if (error) {
    return (
      <AppContainer>
        <div className="space-y-4 text-center">
          <p className="text-red-400 font-medium">{error}</p>
          <button
            onClick={() => router.push(`/barbershops/${slug}/my-bookings`)}
            className="bg-blue-600 hover:bg-blue-700 py-3 rounded-2xl transition font-medium"
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
        <p className="text-center text-gray-400 text-sm">Cargando...</p>
      </AppContainer>
    );
  }

  const isCancelled = !!appointment.cancelledAt;

  return (
    <AppContainer>
      <h1 className="text-xl font-bold text-center">Detalle de la cita</h1>

      <div
        className={`p-5 rounded-3xl border space-y-4 ${
          isCancelled
            ? "bg-gray-900 border-red-800 opacity-80"
            : "bg-gray-900 border-gray-800"
        }`}
      >
        <div className="grid grid-cols-[84px_1fr] gap-y-3 text-sm sm:text-base">
          <span className="text-gray-400">Servicio</span>
          <span className="font-medium">{appointment.serviceName}</span>

          <span className="text-gray-400">Barbero</span>
          <span className="font-medium">{appointment.barberName}</span>

          <span className="text-gray-400">Fecha</span>
          <span className="font-medium">{formatDate(appointment.startTime)}</span>

          <span className="text-gray-400">Hora</span>
          <span className="font-medium">{formatTime(appointment.startTime)}</span>
        </div>

        <p className={`font-medium ${isCancelled ? "text-red-400" : "text-green-400"}`}>
          {isCancelled ? "❌ Cancelada" : "✅ Activa"}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {!isCancelled ? (
          <>
            <button
              onClick={() =>
                router.push(`/barbershops/${slug}/my-bookings/${id}/reschedule`)
              }
              className="bg-blue-600 hover:bg-blue-700 py-3 rounded-2xl transition font-medium"
            >
              🔄 Modificar cita
            </button>

            <a
              href={`/api/barbershops/${slug}/appointments/${id}/calendar`}
              className="text-center bg-gray-800 hover:bg-gray-700 py-3 rounded-2xl transition font-medium"
            >
              📅 Añadir al calendario
            </a>
          </>
        ) : (
          <button
            onClick={() => router.push(`/barbershops/${slug}`)}
            className="bg-green-600 hover:bg-green-700 py-3 rounded-2xl transition font-medium"
          >
            Reservar nueva cita
          </button>
        )}

        <button
          onClick={() => router.back()}
          className="bg-gray-100 text-black py-3 rounded-2xl font-medium"
        >
          ← Volver
        </button>
      </div>
    </AppContainer>
  );
}
