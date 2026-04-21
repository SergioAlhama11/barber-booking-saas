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
      <div className="space-y-3 text-center">
        <h1 className="flex items-center justify-center gap-3 text-[2.6rem] leading-none font-bold tracking-tight">
          <span className="text-[2.2rem] leading-none">📅</span>
          <span>Mis citas</span>
        </h1>
        <p className="text-sm text-gray-500">
          Gestiona tus reservas desde tu email.
        </p>
      </div>

      <div className="rounded-3xl border border-gray-800 bg-gray-950/40 px-4 py-3 space-y-2.5">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
            Buscar reservas
          </p>
          <p className="text-sm text-gray-400">
            Usa el email con el que hiciste la reserva.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-stretch">
          <input
            type="email"
            placeholder="Introduce tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 min-w-0 px-4 py-2.5 rounded-2xl bg-gray-900 border border-gray-700 focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
          />

          <button
            onClick={handleSearch}
            disabled={!email}
            className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-2xl transition disabled:opacity-50 disabled:hover:bg-blue-600 sm:min-w-[120px]"
          >
            Buscar
          </button>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-gray-800 bg-gray-950/40 px-4 py-4 text-center">
          <p className="text-gray-400 text-sm">Cargando citas...</p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-900/50 bg-red-500/10 px-4 py-4 text-center">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {!loading &&
        !error &&
        future.length === 0 &&
        past.length === 0 &&
        cancelled.length === 0 && (
          <div className="rounded-2xl border border-gray-800 bg-gray-950/50 px-4 py-6 text-center space-y-2">
            <p className="text-white font-medium">
              No hay citas para este email
            </p>
            <p className="text-sm text-gray-500">
              Prueba con el email que usaste al hacer la reserva.
            </p>
          </div>
        )}

      <div className="space-y-9">
        <AppointmentSection
          title="Próximas citas"
          appointments={future}
          showCancel
          onResend={handleResend}
          onClick={goToDetail}
          statusVariant="upcoming"
        />

        <AppointmentSection
          title="Histórico"
          appointments={past}
          onClick={goToDetail}
          statusVariant="past"
        />

        <AppointmentSection
          title="Canceladas"
          appointments={cancelled}
          onClick={goToDetail}
          statusVariant="cancelled"
        />
      </div>
    </AppContainer>
  );
}
