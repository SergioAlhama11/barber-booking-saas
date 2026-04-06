"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = "http://192.168.18.212:8080";

export default function ConfirmationPage() {
  const { id, slug } = useParams();

  const [appointment, setAppointment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [id]);

  // =========================
  // STATES
  // =========================

  if (loading) {
    return <div className="p-6">Cargando reserva...</div>;
  }

  if (error || !appointment) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <p className="text-red-500">❌ No se pudo cargar la reserva</p>
      </div>
    );
  }

  // =========================
  // SUCCESS
  // =========================

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-green-600">
        ✅ Reserva confirmada
      </h1>

      <div className="border p-4 rounded space-y-2">
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

      <p className="mt-4 text-gray-600">
        Tu cita ha sido registrada correctamente.
      </p>
    </div>
  );
}
