"use client";

import { useState, useEffect } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import AppointmentSection from "@/components/AppointmentSection";
import { useRouter, useParams } from "next/navigation";
import AppContainer from "@/components/AppContainer";

export default function MyBookingsPage() {
  const router = useRouter();
  const { slug } = useParams() as { slug: string };

  const [email, setEmail] = useState("");

  const { future, past, cancelled, loading, error, fetchAppointments, resend } =
    useAppointments(slug);

  // 🔥 UX PRO: autoload email
  useEffect(() => {
    const saved = localStorage.getItem("booking_email");
    if (saved) {
      setEmail(saved);
      fetchAppointments(saved);
    }
  }, []);

  function handleSearch() {
    if (!email) return;
    localStorage.setItem("booking_email", email);
    fetchAppointments(email);
  }

  function handleResend(id: number) {
    resend(id, email);
  }

  function goToDetail(appointment: any) {
    if (appointment.cancelledAt) return;
    router.push(`/barbershops/${slug}/my-bookings/${appointment.id}`);
  }

  return (
    <AppContainer>
      {/* HEADER */}
      <h1 className="text-xl font-bold text-center">📅 Mis citas</h1>

      {/* EMAIL INPUT */}
      <div className="flex gap-2">
        <input
          type="email"
          placeholder="Introduce tu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 p-3 rounded-xl bg-gray-900 border border-gray-700 focus:outline-none focus:border-blue-500"
        />

        <button
          onClick={handleSearch}
          disabled={!email}
          className="bg-blue-600 hover:bg-blue-700 px-4 rounded-xl transition disabled:opacity-50"
        >
          Buscar
        </button>
      </div>

      {/* STATES */}
      {loading && (
        <p className="text-gray-400 text-center text-sm">Cargando citas...</p>
      )}

      {error && <p className="text-red-500 text-center text-sm">{error}</p>}

      {/* EMPTY STATE */}
      {!loading &&
        !error &&
        future.length === 0 &&
        past.length === 0 &&
        cancelled.length === 0 && (
          <p className="text-gray-500 text-center text-sm">
            No hay citas para este email
          </p>
        )}

      {/* SECTIONS */}
      <AppointmentSection
        title="Próximas citas"
        appointments={future}
        showCancel
        onResend={handleResend}
        onClick={goToDetail}
      />

      <AppointmentSection
        title="Histórico"
        appointments={past}
        onClick={goToDetail}
      />

      <AppointmentSection
        title="Canceladas"
        appointments={cancelled}
        onClick={goToDetail}
      />
    </AppContainer>
  );
}
