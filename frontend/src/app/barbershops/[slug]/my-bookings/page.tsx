"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppointments } from "@/hooks/booking/useAppointments";
import AppointmentSection from "@/components/AppointmentSection";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import AppContainer from "@/components/AppContainer";
import AuthModal from "@/components/AuthModal";
import type { Appointment } from "@/services/api";
import { clearAuthSession } from "@/services/authSession";
import { useSession } from "@/hooks/booking/useSessions";
import { useMagicAccess } from "@/hooks/booking/useMagicAccess";
import { formatDate, formatTime } from "@/services/dateService";
import { cancelAppointment } from "@/services/api";
import ConfirmModal from "@/components/ConfirmModal";

type Tab = "upcoming" | "past" | "cancelled";

export default function MyBookingsPage() {
  const router = useRouter();

  const { slug } = useParams() as {
    slug: string;
  };

  const searchParams = useSearchParams();

  const { consumeMagicToken, magicMessage, magicToken, setMagicMessage } =
    useMagicAccess(searchParams.get("token"));

  const { future, past, cancelled, loading, error, fetchAppointments } =
    useAppointments(slug);

  const { isLogged, isReady } = useSession();

  const [showAuth, setShowAuth] = useState(false);

  const [initializing, setInitializing] = useState(true);

  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [showCancelModal, setShowCancelModal] = useState(false);

  const [cancelling, setCancelling] = useState(false);

  // =========================================================
  // INIT
  // =========================================================

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
        setTimeout(() => {
          setInitializing(false);
        }, 180);
      }
    }

    initialize();
  }, [
    consumeMagicToken,
    fetchAppointments,
    isLogged,
    isReady,
    magicToken,
    router,
    slug,
  ]);

  // =========================================================
  // SESSION EXPIRED
  // =========================================================

  useEffect(() => {
    if (error === "SESSION_EXPIRED") {
      setShowAuth(true);
    }
  }, [error]);

  // =========================================================
  // HANDLERS
  // =========================================================

  function handleAuthSuccess() {
    setShowAuth(false);

    setMagicMessage(null);

    fetchAppointments();
  }

  function handleAuthClose() {
    setShowAuth(false);

    router.replace(`/barbershops/${slug}`);
  }

  async function handleCancel() {
    if (!selectedAppointment || cancelling) return;

    try {
      setCancelling(true);

      const res = await cancelAppointment(slug, selectedAppointment.id);

      if (res.error) {
        return;
      }

      await fetchAppointments();
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
      setSelectedAppointment(null);
    }
  }

  // =========================================================
  // DERIVED
  // =========================================================

  const isEmpty =
    future.length === 0 && past.length === 0 && cancelled.length === 0;

  const sortedFuture = [...future].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  const sortedPast = [...past].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
  );

  const sortedCancelled = [...cancelled].sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
  );

  const nextAppointment = sortedFuture[0] ?? null;

  const totalAppointments = future.length + past.length + cancelled.length;

  // =========================================================
  // LOADING
  // =========================================================

  if (initializing) {
    return (
      <AppContainer>
        <div className="rounded-[2rem] border border-white/8 bg-[#121826] px-6 py-10 text-center text-sm text-slate-400 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          Accediendo a tus reservas...
        </div>
      </AppContainer>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <>
      <AppContainer>
        <div className="w-full space-y-5 xl:space-y-7">
          {/* MAGIC ACCESS */}

          {magicMessage && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 backdrop-blur-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/10 text-lg text-emerald-100">
                ✓
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-emerald-100">
                  Acceso verificado
                </p>

                <p className="text-xs text-emerald-200/70">
                  Has accedido correctamente desde el enlace seguro del email.
                </p>
              </div>
            </div>
          )}

          {/* HERO */}

          {/* HERO */}

          <section className="overflow-hidden rounded-[2.5rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(60,130,246,0.18),transparent_28%),linear-gradient(180deg,rgba(17,24,39,0.96),rgba(11,16,28,0.94))] shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
            <div className="grid gap-5 px-5 py-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start xl:gap-6 xl:px-7 xl:py-6">
              {/* LEFT */}

              <div className="flex flex-col justify-between">
                <div className="max-w-3xl">
                  <div className="inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-cyan-200">
                    Tus reservas
                  </div>

                  <h1 className="mt-4 text-[3rem] font-bold leading-[0.9] tracking-tight text-white sm:text-[3.8rem] xl:text-[4.4rem]">
                    Mis citas
                  </h1>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-[15px]">
                    Consulta tus próximas reservas, revisa tu historial y accede
                    rápidamente al detalle para modificar o cancelar cualquier
                    cita.
                  </p>
                </div>

                {/* STATS */}

                <div className="mt-5 grid grid-cols-3 gap-2 xl:max-w-[620px]">
                  <div className="rounded-[1.8rem] border border-emerald-500/15 bg-emerald-500/10 p-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-200/70">
                      Próximas
                    </p>

                    <p className="mt-3 text-2xl font-bold tracking-tight text-white">
                      {future.length}
                    </p>
                  </div>

                  <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.04] p-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      Historial
                    </p>

                    <p className="mt-3 text-2xl font-bold tracking-tight text-white">
                      {past.length}
                    </p>
                  </div>

                  <div className="rounded-[1.8rem] border border-red-500/15 bg-red-500/10 p-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-red-200/70">
                      Canceladas
                    </p>

                    <p className="mt-3 text-2xl font-bold tracking-tight text-white">
                      {cancelled.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT */}

              <aside className="flex flex-col gap-4">
                {/* NEXT */}

                <div className="rounded-[2rem] border border-white/8 bg-[#0b1120]/80 p-5 backdrop-blur-xl">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    Próxima cita
                  </p>

                  {nextAppointment ? (
                    <>
                      <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                        {formatDate(nextAppointment.startTime)}
                      </p>

                      <p className="mt-2 text-5xl font-bold leading-none tracking-tight text-white">
                        {formatTime(nextAppointment.startTime)}
                      </p>

                      <p className="mt-5 text-3xl font-bold tracking-tight text-white">
                        {nextAppointment.serviceName}
                      </p>

                      <p className="mt-2 text-sm text-slate-400">
                        {nextAppointment.barberName}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-4 text-lg font-semibold text-white">
                        Sin próximas reservas
                      </p>

                      <p className="mt-2 text-sm text-slate-400">
                        Reserva una nueva cita cuando quieras.
                      </p>

                      <button
                        onClick={() => router.push(`/barbershops/${slug}`)}
                        className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-black transition hover:bg-slate-200 active:scale-[0.99]"
                      >
                        Reservar cita
                      </button>
                    </>
                  )}
                </div>
              </aside>
            </div>
          </section>

          {/* LOADING */}

          {loading && (
            <section className="rounded-[2rem] border border-white/8 bg-[#121826] px-6 py-10 text-center text-sm text-slate-400">
              Cargando citas...
            </section>
          )}

          {/* AUTH */}

          {showAuth && (
            <section className="rounded-[2rem] border border-amber-500/20 bg-amber-500/10 px-6 py-6 text-center">
              <p className="text-lg font-semibold text-amber-100">
                Tu acceso ha caducado
              </p>

              <p className="mt-2 text-sm text-amber-50/80">
                Introduce tu email para recibir un nuevo código.
              </p>
            </section>
          )}

          {/* EMPTY */}

          {!loading && !showAuth && isEmpty && (
            <section className="rounded-[2.2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(17,24,39,0.94),rgba(15,21,35,0.86))] px-6 py-14 text-center">
              <div className="mx-auto max-w-xl">
                <h2 className="text-4xl font-bold tracking-tight text-white">
                  No tienes reservas
                </h2>

                <p className="mt-4 text-sm leading-7 text-slate-400">
                  Cuando hagas una nueva reserva aparecerá aquí automáticamente.
                </p>

                <button
                  onClick={() => router.push(`/barbershops/${slug}`)}
                  className="mt-7 inline-flex h-12 items-center justify-center rounded-2xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-slate-200 active:scale-[0.99]"
                >
                  Reservar cita
                </button>
              </div>
            </section>
          )}

          {/* TABS */}

          {!loading && !showAuth && !isEmpty && (
            <>
              <div className="flex gap-3 overflow-x-auto pb-1 xl:overflow-visible">
                <button
                  onClick={() => setActiveTab("upcoming")}
                  className={`shrink-0 rounded-full px-5 py-3 text-sm font-medium backdrop-blur-xl transition ${
                    activeTab === "upcoming"
                      ? "bg-cyan-300 text-slate-950"
                      : "border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                  }`}
                >
                  Próximas ({future.length})
                </button>

                <button
                  onClick={() => setActiveTab("past")}
                  className={`shrink-0 rounded-full px-5 py-3 text-sm font-medium backdrop-blur-xl transition ${
                    activeTab === "past"
                      ? "bg-white text-black"
                      : "border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                  }`}
                >
                  Historial ({past.length})
                </button>

                <button
                  onClick={() => setActiveTab("cancelled")}
                  className={`shrink-0 rounded-full px-5 py-3 text-sm font-medium backdrop-blur-xl transition ${
                    activeTab === "cancelled"
                      ? "bg-red-500 text-white"
                      : "border border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                  }`}
                >
                  Canceladas ({cancelled.length})
                </button>
              </div>

              <div>
                {activeTab === "upcoming" && (
                  <AppointmentSection
                    title="Próximas citas"
                    appointments={sortedFuture}
                    statusVariant="upcoming"
                    onCancel={(appointment) => {
                      setSelectedAppointment(appointment);
                      setShowCancelModal(true);
                    }}
                  />
                )}

                {activeTab === "past" && (
                  <AppointmentSection
                    title="Historial"
                    appointments={sortedPast}
                    statusVariant="past"
                  />
                )}

                {activeTab === "cancelled" && (
                  <AppointmentSection
                    title="Canceladas"
                    appointments={sortedCancelled}
                    statusVariant="cancelled"
                  />
                )}
              </div>
            </>
          )}
        </div>
      </AppContainer>

      <AuthModal
        open={showAuth}
        onSuccess={handleAuthSuccess}
        onClose={handleAuthClose}
      />
      <ConfirmModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        loading={cancelling}
        danger
        title="Cancelar cita"
        description={
          selectedAppointment
            ? `Vas a cancelar tu cita de ${selectedAppointment.serviceName} con ${selectedAppointment.barberName}. Esta acción no se puede deshacer.`
            : ""
        }
        confirmText="Sí, cancelar"
        cancelText="Volver"
      />
    </>
  );
}
