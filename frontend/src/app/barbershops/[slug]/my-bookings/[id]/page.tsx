"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatDate, formatTime } from "@/services/dateService";
import AppContainer from "@/components/AppContainer";

const API_URL = "http://192.168.18.212:8080";

export default function BookingDetailPage() {
  const router = useRouter();
  const { id, slug } = useParams() as { id: string; slug: string };

  const [appointment, setAppointment] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/barbershops/${slug}/appointments/${id}`)
      .then((r) => r.json())
      .then(setAppointment);
  }, [id, slug]);

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

  const isCancelled = !!appointment.cancelledAt;

  return (
    <AppContainer>
      {/* HEADER */}
      <h1 className="text-xl font-bold text-center">Detalle de la cita</h1>

      {/* CARD */}
      <div
        className={`
          p-5 rounded-2xl border space-y-3

          ${
            isCancelled
              ? "bg-gray-900 border-red-800 opacity-80"
              : "bg-gray-900 border-gray-800"
          }
        `}
      >
        <p>
          <span className="text-gray-400">Servicio:</span>{" "}
          {appointment.serviceName}
        </p>

        <p>
          <span className="text-gray-400">Barbero:</span>{" "}
          {appointment.barberName}
        </p>

        <p>
          <span className="text-gray-400">Fecha:</span>{" "}
          {formatDate(appointment.startTime)}
        </p>

        <p>
          <span className="text-gray-400">Hora:</span>{" "}
          {formatTime(appointment.startTime)}
        </p>

        <p
          className={`font-semibold ${
            isCancelled ? "text-red-400" : "text-green-400"
          }`}
        >
          {isCancelled ? "❌ Cancelada" : "✅ Activa"}
        </p>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col gap-3">
        {!isCancelled ? (
          <>
            <button
              onClick={() =>
                router.push(`/barbershops/${slug}/my-bookings/${id}/reschedule`)
              }
              className="bg-blue-600 hover:bg-blue-700 py-3 rounded-xl transition"
            >
              🔄 Modificar cita
            </button>

            <a
              href={`${API_URL}/barbershops/${slug}/appointments/${id}/calendar`}
              className="text-center bg-gray-800 hover:bg-gray-700 py-3 rounded-xl transition"
            >
              📅 Añadir al calendario
            </a>
          </>
        ) : (
          <button
            onClick={() => router.push(`/barbershops/${slug}`)}
            className="bg-green-600 hover:bg-green-700 py-3 rounded-xl transition"
          >
            Reservar nueva cita
          </button>
        )}

        <button
          onClick={() => router.back()}
          className="bg-gray-200 text-black py-3 rounded-xl"
        >
          ← Volver
        </button>
      </div>
    </AppContainer>
  );
}
