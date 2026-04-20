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

  useEffect(() => {
    async function load() {
      const res = await getAppointment(slug, Number(id));

      if (res.error || !res.data) return;

      setAppointment(res.data);
    }

    load();
  }, [id, slug]);

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
        className={`p-5 rounded-2xl border space-y-3 ${
          isCancelled
            ? "bg-gray-900 border-red-800 opacity-80"
            : "bg-gray-900 border-gray-800"
        }`}
      >
        <p>Servicio: {appointment.serviceName}</p>
        <p>Barbero: {appointment.barberName}</p>
        <p>Fecha: {formatDate(appointment.startTime)}</p>
        <p>Hora: {formatTime(appointment.startTime)}</p>

        <p className={isCancelled ? "text-red-400" : "text-green-400"}>
          {isCancelled ? "❌ Cancelada" : "✅ Activa"}
        </p>
      </div>

      {!isCancelled && (
        <button
          onClick={() =>
            router.push(`/barbershops/${slug}/my-bookings/${id}/reschedule`)
          }
          className="bg-blue-600 py-3 rounded-xl"
        >
          🔄 Modificar cita
        </button>
      )}
    </AppContainer>
  );
}
