"use client";

import { useState } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import AppointmentSection from "@/components/AppointmentSection";

export default function MyBookingsPage() {
  const [email, setEmail] = useState("");

  const slug = "barberia-sergio";

  const { future, past, cancelled, loading, error, fetchAppointments } =
    useAppointments(slug);

  function handleResend(id: number) {
    console.log("Reenviar email para cita: ", id);
    // 🔥 siguiente paso backend
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h1>Mis citas</h1>

      <input
        type="email"
        placeholder="Introduce tu email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={() => fetchAppointments(email)} disabled={!email}>
        Buscar
      </button>

      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <AppointmentSection
        title="Próximas citas"
        appointments={future}
        showCancel
        onResend={handleResend}
      />

      <AppointmentSection title="Histórico" appointments={past} />

      <AppointmentSection title="Canceladas" appointments={cancelled} />
    </div>
  );
}
