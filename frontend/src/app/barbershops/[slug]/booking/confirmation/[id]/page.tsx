"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL = "http://192.168.18.212:8080";

export default function ConfirmationPage() {
  const { id, slug } = useParams();
  const router = useRouter();

  const [appointment, setAppointment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =========================
  // FETCH
  // =========================

  useEffect(() => {
    async function fetchAppointment() {
      try {
        const res = await fetch(
          `${API_URL}/barbershops/${slug}/appointments/${id}`,
        );

        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Error loading appointment");
          return;
        }

        setAppointment(data);
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchAppointment();
  }, [id, slug]);

  // =========================
  // AUTO REDIRECT (UX PRO)
  // =========================

  useEffect(() => {
    if (!appointment) return;

    const timer = setTimeout(() => {
      router.push(`/barbershops/${slug}`);
    }, 10000); // 10s

    return () => clearTimeout(timer);
  }, [appointment, slug, router]);

  // =========================
  // STATES
  // =========================

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Cargando reserva...</div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center">
        <p className="text-red-500 text-lg font-semibold">
          ❌ No se pudo cargar la reserva
        </p>
        <button
          onClick={() => router.push(`/barbershops/${slug}`)}
          className="mt-4 px-4 py-2 bg-gray-200 rounded"
        >
          Volver
        </button>
      </div>
    );
  }

  // =========================
  // SUCCESS
  // =========================

  return (
    <div className="p-6 max-w-xl mx-auto text-center space-y-6">
      {/* HEADER */}
      <h1 className="text-3xl font-bold text-green-600">
        ✅ Reserva confirmada
      </h1>

      {/* CARD */}
      <div className="border p-5 rounded-xl shadow-sm text-left space-y-3">
        <p>
          <strong>Servicio:</strong> {appointment.serviceName}
        </p>

        <p>
          <strong>Barbero:</strong> {appointment.barberName}
        </p>

        <p>
          <strong>Fecha:</strong>{" "}
          {new Date(appointment.startTime).toLocaleDateString()}
        </p>

        <p>
          <strong>Hora:</strong>{" "}
          {new Date(appointment.startTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        <p>
          <strong>Email:</strong> {appointment.customerEmail}
        </p>
      </div>

      {/* INFO UX */}
      <div className="text-sm text-gray-600 space-y-2">
        <p>📩 Hemos enviado un email con el enlace para cancelar tu cita.</p>
        <p>Serás redirigido automáticamente en unos segundos...</p>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => router.push(`/barbershops/${slug}`)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          ← Volver a la barbería
        </button>

        <button
          onClick={() => router.push("/my-bookings")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Ver mis citas
        </button>
      </div>
    </div>
  );
}
