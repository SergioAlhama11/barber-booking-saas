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
    return (
      <AppContainer>
        <div className="rounded-[30px] border border-white/8 bg-[#121826] px-5 py-8 text-center text-gray-400">
          Accediendo a tus citas...
        </div>
      </AppContainer>
    );
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
        <section className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,24,38,0.98),rgba(11,16,26,0.98))] px-5 py-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-blue-200">
              Tus reservas
            </div>

            <div className="space-y-2">
              <h1 className="text-[2.6rem] font-semibold leading-[0.95] tracking-tight text-white">
                Mis citas
              </h1>
              <p className="max-w-sm text-sm leading-6 text-gray-400">
                Consulta tus próximas reservas, revisa el historial y entra al
                detalle para modificar o cancelar cuando lo necesites.
              </p>
            </div>
          </div>

          {magicMessage && (
            <p className="rounded-2xl border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-200">
              {magicMessage}
            </p>
          )}

          {email && (
            <div className="rounded-2xl border border-white/6 bg-black/20 px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
                Email activo
              </p>
              <p className="mt-1 truncate text-sm font-medium text-white">
                {email}
              </p>
            </div>
          )}
        </section>

        {loading && (
          <div className="rounded-[28px] border border-white/8 bg-[#121826] px-5 py-7 text-center text-sm text-gray-400">
            Cargando citas...
          </div>
        )}

        {showAuth && (
          <div className="rounded-[28px] border border-amber-500/20 bg-amber-500/10 px-5 py-5 text-center text-sm leading-6 text-amber-100">
            Tu acceso ha caducado o el enlace ya no es valido. Introduce tu
            email y te enviaremos un codigo.
          </div>
        )}

        {!loading && !showAuth && isEmpty && (
          <section className="rounded-[30px] border border-white/8 bg-[#121826] px-5 py-8 text-center shadow-[0_10px_40px_rgba(0,0,0,0.22)]">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
              Sin reservas
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              No tienes citas ahora mismo
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Cuando hagas una nueva reserva, podrás verla y gestionarla desde
              aquí.
            </p>
            <button
              onClick={() => router.push(`/barbershops/${slug}`)}
              className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-slate-200"
            >
              Reservar una cita
            </button>
          </section>
        )}

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

            {email && !showAuth && (
              <p className="text-center text-sm text-gray-500 mt-2">
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
