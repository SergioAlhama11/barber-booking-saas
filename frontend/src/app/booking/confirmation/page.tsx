"use client";

import { useSearchParams } from "next/navigation";

export default function ConfirmationPage() {
  const params = useSearchParams();

  const date = params.get("date");
  const time = params.get("time");
  const barber = params.get("barber");
  const service = params.get("service");
  const email = params.get("email");

  // 🔴 VALIDACIÓN
  if (!date || !time || !barber || !service || !email) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <p className="text-red-500">Invalid booking data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-green-600">
        ✅ Reserva confirmada
      </h1>

      <div className="border p-4 rounded space-y-2">
        <p>
          <strong>Servicio:</strong> {service}
        </p>
        <p>
          <strong>Barbero:</strong> {barber}
        </p>
        <p>
          <strong>Fecha:</strong> {date}
        </p>
        <p>
          <strong>Hora:</strong> {time}
        </p>
        <p>
          <strong>Email:</strong> {email}
        </p>
      </div>

      <p className="mt-4 text-gray-600">
        Hemos registrado tu cita correctamente.
      </p>
    </div>
  );
}
