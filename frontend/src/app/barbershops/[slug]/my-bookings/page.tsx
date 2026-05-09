"use client";

import { useEffect, useState } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import AppointmentSection from "@/components/AppointmentSection";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import AppContainer from "@/components/AppContainer";
import AuthModal from "@/components/AuthModal";
import type { Appointment } from "@/services/api";
import { clearAuthSession } from "@/services/authSession";
import { useSession } from "@/hooks/useSessions";
import { useMagicAccess } from "@/hooks/useMagicAccess";

export default function MyBookingsPage() {
  const router = useRouter();
  const { slug } = useParams() as { slug: string };
  const searchParams = useSearchParams();
  const { consumeMagicToken, magicMessage, magicToken, setMagicMessage } =
    useMagicAccess(searchParams.get("token"));

  const { future, past, cancelled, loading, error, fetchAppointments } =
    useAppointments(slug);
  const { email, isLogged, isReady } = useSession();

  const [showAuth, setShowAuth] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    async function initialize() {
      if (!isReady) return;

      try {
        if (magicToken) {
          const session = await consumeMagicToken();

          if (session?.appointmentId) {
            router.replace(
              `/barbershops/${slug}/my-bookings/${session.appointmentId}`,
            );
            return;
          }

          router.replace(`/barbershops/${slug}/my-bookings`);
        }

        if (!isLogged) {
          setShowAuth(true);
          return;
        }

        await fetchAppointments();
      } catch {
        clearAuthSession();
        setShowAuth(true);
      } finally {
        setTimeout(() => setInitializing(false), 200);
      }
    }

    initialize();
  }, [consumeMagicToken, fetchAppointments, isLogged, isReady, magicToken, router, slug]);

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
    setMagicMessage(null);
    fetchAppointments();
  }

  function handleAuthClose() {
    setShowAuth(false);
    router.replace(`/barbershops/${slug}`);
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

          {magicMessage && (
            <p className="rounded-2xl border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs text-green-300">
              {magicMessage}
            </p>
          )}

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

        {showAuth && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-center text-sm text-amber-200">
            Tu acceso ha caducado o el enlace ya no es valido. Introduce tu
            email y te enviaremos un codigo.
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
              <p className="text-center text-xs text-gray-500 mt-6">
                Si quieres usar otro email, cierra el acceso desde la parte
                superior.
              </p>
            )}
          </>
        )}
      </AppContainer>

      {/* 🔥 MODAL OTP */}
      <AuthModal
        open={showAuth}
        onSuccess={handleAuthSuccess}
        onClose={handleAuthClose}
      />
    </>
  );
}
