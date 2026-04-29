"use client";

import { useEffect, useState } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import AppointmentSection from "@/components/AppointmentSection";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import AppContainer from "@/components/AppContainer";
import AuthModal from "@/components/AuthModal";
import { exchangeMagicToken, type Appointment } from "@/services/api";

export default function MyBookingsPage() {
  const router = useRouter();
  const { slug } = useParams() as { slug: string };

  const { future, past, cancelled, loading, error, fetchAppointments } =
    useAppointments(slug);

  const [showAuth, setShowAuth] = useState(false);

  const searchParams = useSearchParams();

  const [initializing, setInitializing] = useState(true);

  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(localStorage.getItem("auth_email"));
  }, []);

  useEffect(() => {
    const token = searchParams.get("token");

    async function initialize() {
      try {
        if (token) {
          const session = await exchangeMagicToken(token);
          setEmail(session.email);

          if (session.appointmentId) {
            router.replace(
              `/barbershops/${slug}/my-bookings/${session.appointmentId}`,
            );
            return;
          }

          router.replace(`/barbershops/${slug}/my-bookings`);
        }

        await fetchAppointments();
      } catch {
        localStorage.removeItem("auth_token");
        setShowAuth(true);
      } finally {
        setTimeout(() => setInitializing(false), 200);
      }
    }

    initialize();
  }, [slug, searchParams]);

  // 🔥 abrir modal SOLO si expira sesión
  useEffect(() => {
    if (error === "SESSION_EXPIRED") {
      setShowAuth(true);
    }
  }, [error]);

  if (initializing) {
    return <AppContainer>Accediendo a tus citas...</AppContainer>;
  }

  // 🔥 cuando se autentica correctamente
  function handleAuthSuccess() {
    setShowAuth(false);
    setEmail(localStorage.getItem("auth_email"));
    fetchAppointments();
  }

  function goToDetail(appointment: Appointment) {
    if (appointment.cancelledAt) return;

    router.push(`/barbershops/${slug}/my-bookings/${appointment.id}`);
  }

  const isEmpty =
    future.length === 0 && past.length === 0 && cancelled.length === 0;

  return (
    <>
      <AppContainer>
        {/* HEADER */}
        <div className="space-y-3 text-center">
          <h1 className="flex items-center justify-center gap-3 text-[2.4rem] font-bold">
            <span>📅</span>

            <span>Mis citas</span>
          </h1>

          <p className="text-sm text-gray-500">
            Aquí puedes gestionar tus reservas
          </p>

          {/* 🔥 NUEVO */}

          {email && (
            <p className="text-xs text-gray-400">
              Mostrando citas de <span className="text-white">{email}</span>
            </p>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center text-gray-400 text-sm">
            Cargando citas...
          </div>
        )}

        {/* EMPTY */}
        {!loading && !showAuth && isEmpty && (
          <div className="text-center text-gray-500 text-sm">
            No tienes citas
          </div>
        )}

        {/* LIST */}
        {!loading && (
          <>
            <div className="space-y-8">
              <AppointmentSection
                title="Próximas citas"
                appointments={future}
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

            {/* 🔥 CAMBIAR CUENTA */}
            {email && !showAuth && (
              <button
                onClick={() => {
                  localStorage.removeItem("auth_token");
                  localStorage.removeItem("auth_email");
                  setEmail(null);
                  setShowAuth(true);
                }}
                className="w-full text-xs text-gray-500 hover:text-gray-300 text-center mt-6"
              >
                Cambiar cuenta
              </button>
            )}
          </>
        )}
      </AppContainer>

      {/* 🔥 MODAL OTP */}
      <AuthModal
        open={showAuth}
        onSuccess={handleAuthSuccess}
        onClose={() => setShowAuth(false)}
      />
    </>
  );
}
