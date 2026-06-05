"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  getAdminAppointments,
  getAdminBarbers,
  getAdminBarbershop,
  type AdminAppointment,
  type AdminAppointmentStatus,
} from "@/services/adminApi";
import { getTodayLocal } from "@/services/dateService";
import { useAdminSession } from "@/hooks/useAdminSession";
import type { Barber, Barbershop } from "@/types";

const PAGE_SIZE = 20;

const STATUS_LABELS: Record<AdminAppointmentStatus, string> = {
  ACTIVE: "Activas",
  COMPLETED: "Completadas",
  CANCELLED: "Canceladas",
  ALL: "Todas",
};

const RESULTS_GRID =
  "lg:grid-cols-[minmax(260px,2.2fr)_minmax(180px,1fr)_minmax(260px,1.3fr)_140px_170px]";

function toInstantRangeStart(value: string) {
  return value ? new Date(`${value}T00:00:00`).toISOString() : undefined;
}

function toInstantRangeEnd(value: string) {
  return value ? new Date(`${value}T23:59:59.999`).toISOString() : undefined;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDayLabel(value: string) {
  const date = new Date(value);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const targetDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const diffDays = Math.round(
    (targetDate.getTime() - startOfToday.getTime()) / 86400000,
  );

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Mañana";
  if (diffDays === -1) return "Ayer";

  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function getAppointmentState(appointment: AdminAppointment) {
  if (appointment.cancelledAt) {
    return {
      label: "Cancelada",
      tone: "border border-red-400/20 bg-red-500/10 text-red-100",
    };
  }

  const now = Date.now();
  const end = new Date(appointment.endTime).getTime();

  if (end < now) {
    return {
      label: "Completada",
      tone: "border border-slate-400/20 bg-white/[0.05] text-slate-300",
    };
  }

  return {
    label: "Activa",
    tone: "border border-emerald-400/20 bg-emerald-500/10 text-emerald-100",
  };
}

function isAppointmentLocked(appointment: AdminAppointment) {
  if (appointment.cancelledAt) {
    return true;
  }

  return new Date(appointment.endTime).getTime() < Date.now();
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

export default function AdminAppointmentsPage() {
  const router = useRouter();
  const { isReady, isLogged, me, logout } = useAdminSession();

  const [status, setStatus] = useState<AdminAppointmentStatus>("ACTIVE");
  const [searchInput, setSearchInput] = useState("");
  const deferredSearch = useDeferredValue(searchInput);
  const [fromDate, setFromDate] = useState(() => getTodayLocal());
  const [toDate, setToDate] = useState(() => getTodayLocal());
  const [barberId, setBarberId] = useState<number | "">("");
  const [page, setPage] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!isReady) return;
    if (!isLogged) {
      router.replace("/admin/login");
    }
  }, [isLogged, isReady, router]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 60000);

    return () => window.clearInterval(interval);
  }, []);

  const barbersQuery = useQuery<Barber[]>({
    queryKey: ["admin-barbers", me?.barbershopId],
    queryFn: () => getAdminBarbers(me!.barbershopId),
    enabled: !!me,
  });

  const barbershopQuery = useQuery<Barbershop | null>({
    queryKey: ["admin-barbershop", me?.barbershopId],
    queryFn: () => getAdminBarbershop(me!.barbershopId),
    enabled: !!me,
  });

  const appointmentsQuery = useQuery<AdminAppointment[]>({
    queryKey: [
      "admin-appointments",
      status,
      deferredSearch,
      fromDate,
      toDate,
      barberId,
      page,
    ],
    queryFn: () =>
      getAdminAppointments({
        status,
        search: deferredSearch.trim() || undefined,
        from: toInstantRangeStart(fromDate),
        to: toInstantRangeEnd(toDate),
        barberId: typeof barberId === "number" ? barberId : undefined,
        page,
        size: PAGE_SIZE,
      }),
    enabled: isLogged,
  });

  useEffect(() => {
    const error = appointmentsQuery.error;

    if (!(error instanceof Error) || error.message !== "SESSION_EXPIRED") {
      return;
    }

    logout();
    router.replace("/admin/login");
  }, [appointmentsQuery.error, logout, router]);

  const appointments = useMemo(
    () =>
      [...(appointmentsQuery.data ?? [])].sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      ),
    [appointmentsQuery.data],
  );
  const barbers = barbersQuery.data ?? [];
  const barbershopName = barbershopQuery.data?.name ?? "Barberia";
  const loading = appointmentsQuery.isLoading || appointmentsQuery.isFetching;
  const loadingBarbers = barbersQuery.isLoading || barbersQuery.isFetching;
  const error =
    appointmentsQuery.error instanceof Error &&
    appointmentsQuery.error.message !== "SESSION_EXPIRED"
      ? appointmentsQuery.error.message
      : "";
  const activeFilterCount = [
    deferredSearch.trim(),
    fromDate,
    toDate,
    barberId !== "" ? String(barberId) : "",
    status !== "ACTIVE" ? status : "",
  ].filter(Boolean).length;
  const activeAppointments = appointments.filter(
    (item) => !item.cancelledAt && new Date(item.endTime).getTime() >= nowMs,
  ).length;

  const completedAppointments = appointments.filter(
    (item) => !item.cancelledAt && new Date(item.endTime).getTime() < nowMs,
  ).length;

  const cancelledAppointments = appointments.filter(
    (item) => item.cancelledAt,
  ).length;
  const nextAppointment =
    appointments.find(
      (item) =>
        !item.cancelledAt && new Date(item.startTime).getTime() >= nowMs,
    ) ??
    appointments.find((item) => !item.cancelledAt) ??
    null;
  const selectedBarberName =
    typeof barberId === "number"
      ? (barbers.find((barber) => barber.id === barberId)?.name ?? "Barbero")
      : "Todos";
  const summaryChips = [
    searchInput.trim() ? `Busqueda: ${searchInput.trim()}` : null,
    status !== "ACTIVE" ? `Estado: ${STATUS_LABELS[status]}` : null,
    fromDate ? `Desde: ${fromDate}` : null,
    toDate ? `Hasta: ${toDate}` : null,
    barberId !== "" ? `Barbero: ${selectedBarberName}` : null,
  ].filter(Boolean) as string[];

  if (!isReady || !isLogged || !me) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-5 text-sm text-slate-300 shadow-2xl shadow-black/20">
          Cargando acceso interno...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-3 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-[calc(env(safe-area-inset-top)+12px)] sm:space-y-6 sm:px-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(140deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="grid gap-5 p-4 sm:p-6 lg:gap-6 lg:p-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
              PANEL DE CITAS
            </p>
            <h1 className="mt-2 max-w-3xl text-[2rem] font-semibold leading-[1.02] tracking-tight text-white sm:mt-3 sm:text-4xl lg:text-5xl">
              Agenda del equipo
            </h1>
            <p className="mt-3 hidden max-w-2xl text-sm leading-6 text-slate-300 sm:block sm:text-base sm:leading-7">
              Consulta las reservas del día, organiza la agenda y gestiona
              cambios rápidamente.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-3">
              <button
                onClick={() => {
                  setStatus("ACTIVE");
                  setPage(0);
                }}
                className={`
                    rounded-[1.6rem]
                    border
                    p-4
                    text-left
                    transition
                    hover:scale-[1.01]
                    hover:border-emerald-300/30
                    ${
                      status === "ACTIVE"
                        ? "border-emerald-300/30 bg-emerald-500/15"
                        : "border-emerald-400/15 bg-emerald-500/10"
                    }
                    `}
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-200/80">
                  Activas
                </p>

                <p className="mt-3 text-[1.75rem] font-semibold text-white">
                  {loading ? "..." : activeAppointments}
                </p>

                <p className="mt-2 text-sm text-emerald-100/75">
                  En esta vista
                </p>
              </button>

              <button
                onClick={() => {
                  setStatus("CANCELLED");
                  setPage(0);
                }}
                className={`
                    rounded-[1.6rem]
                    border
                    p-4
                    text-left
                    transition
                    hover:scale-[1.01]
                    hover:border-red-300/30
                    ${
                      status === "CANCELLED"
                        ? "border-red-300/30 bg-red-500/15"
                        : "border-red-400/15 bg-red-500/10"
                    }
                    `}
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-red-200/80">
                  Canceladas
                </p>

                <p className="mt-3 text-[1.75rem] font-semibold text-white">
                  {loading ? "..." : cancelledAppointments}
                </p>

                <p className="mt-2 text-sm text-red-100/75">En esta vista</p>
              </button>

              <div className="rounded-[1.6rem] border border-white/10 bg-[#0b1120]/75 p-4 sm:col-span-2 xl:col-span-1">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  Proxima cita
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {nextAppointment
                    ? `${formatDayLabel(nextAppointment.startTime)} · ${formatTime(nextAppointment.startTime)}`
                    : "Sin próximas citas"}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {nextAppointment
                    ? `${nextAppointment.customerName} · ${nextAppointment.serviceName}`
                    : "No hay reservas pendientes en la vista actual."}
                </p>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex lg:flex-col lg:gap-4">
            <div className="rounded-[1.8rem] border border-white/10 bg-[#09101e]/85 p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Sesion
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white break-all">
                    {me.email}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">
                    {barbershopName}
                  </p>
                </div>

                <div className="w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-cyan-100">
                  SESIÓN ACTIVA
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                router.replace("/admin/login");
              }}
              className="inline-flex h-12 items-center justify-center self-start rounded-2xl border border-red-400/20 bg-red-500/10 px-6 text-sm font-medium text-red-100 transition hover:bg-red-500/15"
            >
              Cerrar sesion
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-[#0b1120]/90 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">Filtros</p>
                  <p className="text-sm text-slate-400">
                    Arranca en hoy y ajusta la vista segun el turno.
                  </p>
                </div>

                <button
                  onClick={() => setFiltersOpen((current) => !current)}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white transition hover:bg-white/[0.08] lg:hidden"
                >
                  {filtersOpen ? "Ocultar" : "Filtros"}
                </button>
              </div>

              {activeFilterCount > 0 ? (
                <button
                  onClick={() => {
                    setSearchInput("");
                    setStatus("ACTIVE");
                    setFromDate(getTodayLocal());
                    setToDate(getTodayLocal());
                    setBarberId("");
                    setPage(0);
                  }}
                  className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white transition hover:bg-white/[0.08] lg:inline-flex lg:self-start"
                >
                  Limpiar filtros
                </button>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {summaryChips.length > 0 ? (
                summaryChips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-50"
                  >
                    {chip}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-400">
                  Hoy
                </span>
              )}

              {activeFilterCount > 0 ? (
                <button
                  onClick={() => {
                    setSearchInput("");
                    setStatus("ACTIVE");
                    setFromDate(getTodayLocal());
                    setToDate(getTodayLocal());
                    setBarberId("");
                    setPage(0);
                  }}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white transition hover:bg-white/[0.08] lg:hidden"
                >
                  Limpiar filtros
                </button>
              ) : null}
            </div>
          </div>

          <div className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
            <div className="grid gap-x-5 gap-y-6 md:grid-cols-2 xl:grid-cols-[minmax(0,1.3fr)_repeat(4,minmax(0,1fr))]">
              <label className="flex flex-col gap-2">
                <span className="text-sm text-slate-300">Buscar cliente</span>
                <input
                  value={searchInput}
                  onChange={(event) => {
                    setSearchInput(event.target.value);
                    setPage(0);
                  }}
                  placeholder="Nombre o email"
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm text-slate-300">Estado</span>
                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value as AdminAppointmentStatus);
                    setPage(0);
                  }}
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
                >
                  <option value="ACTIVE">Activas</option>
                  <option value="COMPLETED">Completadas</option>
                  <option value="CANCELLED">Canceladas</option>
                  <option value="ALL">Todas</option>
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm text-slate-300">Desde</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) => {
                    setFromDate(event.target.value);
                    setPage(0);
                  }}
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm text-slate-300">Hasta</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(event) => {
                    setToDate(event.target.value);
                    setPage(0);
                  }}
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm text-slate-300">Barbero</span>
                <select
                  value={barberId}
                  onChange={(event) => {
                    setBarberId(
                      event.target.value ? Number(event.target.value) : "",
                    );
                    setPage(0);
                  }}
                  className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
                  disabled={loadingBarbers}
                >
                  <option value="">Todos</option>
                  {barbers.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-white">Gestión rápida</p>

            <p className="mt-1 text-sm text-slate-400">
              Crea reservas manuales o importa citas desde otros sistemas.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              className="
                inline-flex
                min-h-11
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-cyan-300
                px-5
                text-sm
                font-semibold
                text-slate-950
                transition
                hover:bg-cyan-200
                active:scale-[0.98]
            "
            >
              <span>＋</span>
              Nueva reserva
            </button>

            <button
              className="
                inline-flex
                min-h-11
                items-center
                justify-center
                gap-2
                rounded-2xl
                border
                border-white/10
                bg-white/[0.04]
                px-5
                text-sm
                font-medium
                text-white
                transition
                hover:bg-white/[0.08]
                active:scale-[0.98]
            "
            >
              <span>⇪</span>
              Importar citas
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-sm font-medium text-white">Resultados</p>
              <p className="text-sm text-slate-400">
                {loading
                  ? "Cargando citas..."
                  : `${appointments.length} citas en esta pagina`}
              </p>
            </div>

            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-slate-400">
              {STATUS_LABELS[status]}
            </div>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-slate-400">
            Pagina {page + 1}
          </div>
        </div>

        {error ? (
          <div className="border-b border-red-400/10 bg-red-500/10 px-6 py-4 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <div
          className={`hidden border-b border-white/8 px-6 py-3 text-xs uppercase tracking-[0.18em] text-slate-500 lg:grid lg:items-center lg:gap-8 ${RESULTS_GRID}`}
        >
          <span>Cliente</span>
          <span>Servicio</span>
          <span>Horario</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>

        <div className="divide-y divide-white/8">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className={`grid gap-4 px-4 py-4 sm:px-6 lg:gap-8 ${RESULTS_GRID}`}
              >
                <div className="h-5 rounded-full bg-white/8" />
                <div className="h-5 rounded-full bg-white/8" />
                <div className="h-5 rounded-full bg-white/8" />
                <div className="h-10 rounded-2xl bg-white/8" />
              </div>
            ))
          ) : appointments.length ? (
            appointments.map((appointment) => {
              const state = getAppointmentState(appointment);
              const locked = isAppointmentLocked(appointment);

              const modifyButtonClass = locked
                ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-slate-500"
                : "border-cyan-400/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/20";

              const cancelButtonClass = locked
                ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-slate-500"
                : "border-red-400/20 bg-red-500/10 text-red-100 hover:bg-red-500/20";

              return (
                <article key={appointment.id} className="px-4 py-3 sm:px-6">
                  <div className="space-y-3 lg:hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-300/80">
                          {formatDayLabel(appointment.startTime)}
                        </p>
                        <p className="mt-2 text-[2.5rem] leading-none font-semibold tracking-tight text-white">
                          {formatTime(appointment.startTime)}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          hasta {formatTime(appointment.endTime)}
                        </p>
                      </div>

                      <span
                        className={`inline-flex shrink-0 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${state.tone}`}
                      >
                        {state.label}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xl font-semibold text-white">
                            {appointment.customerName}
                          </p>
                          <p className="mt-1 hidden break-all text-sm text-slate-400 sm:block">
                            {appointment.customerEmail}
                          </p>
                        </div>

                        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                          {formatShortDate(appointment.startTime)}
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-sm text-slate-300">
                          {appointment.serviceName}
                          <span className="mx-2 text-slate-600">·</span>
                          {appointment.barberName}
                        </p>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <button
                          disabled={locked}
                          className={`
                            inline-flex
                            h-10
                            items-center
                            justify-center
                            rounded-xl
                            border
                            px-4
                            text-xs
                            font-semibold
                            transition
                            ${modifyButtonClass}
                        `}
                        >
                          Modificar
                        </button>

                        <button
                          disabled={locked}
                          className={`
                            inline-flex
                            h-10
                            items-center
                            justify-center
                            rounded-xl
                            border
                            px-4
                            text-xs
                            font-semibold
                            transition
                            ${cancelButtonClass}
                        `}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`hidden lg:grid lg:items-center lg:gap-6 ${RESULTS_GRID}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xl font-semibold text-white sm:text-2xl lg:text-base lg:font-semibold">
                          {appointment.customerName}
                        </p>
                        <p className="mt-1 text-base text-slate-400 lg:text-sm">
                          {appointment.customerEmail}
                        </p>
                      </div>

                      <span
                        className={`inline-flex rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] lg:hidden ${state.tone}`}
                      >
                        {state.label}
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:block">
                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500 lg:hidden">
                          Servicio
                        </p>
                        <p className="text-sm font-medium text-slate-100">
                          {appointment.serviceName}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {appointment.barberName}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 px-4 py-3 lg:hidden">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/70">
                          Turno
                        </p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          {formatDayLabel(appointment.startTime)} ·{" "}
                          {formatTime(appointment.startTime)}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          Fin {formatTime(appointment.endTime)}
                        </p>
                      </div>
                    </div>

                    <div className="hidden lg:block">
                      <p className="text-sm font-semibold text-white">
                        {formatDateTime(appointment.startTime)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Fin {formatDateTime(appointment.endTime)}
                      </p>
                    </div>

                    <div className="flex justify-start">
                      <span
                        className={`inline-flex justify-center rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] whitespace-nowrap ${state.tone}`}
                      >
                        {state.label}
                      </span>
                    </div>

                    <div className="flex w-full flex-col gap-2">
                      <button
                        disabled={locked}
                        className={`
                            w-full
                            rounded-xl
                            border
                            px-4
                            py-3
                            text-sm
                            font-semibold
                            transition
                            ${modifyButtonClass}
                        `}
                      >
                        Modificar
                      </button>

                      <button
                        disabled={locked}
                        className={`
                            w-full
                            rounded-xl
                            border
                            px-4
                            py-3
                            text-sm
                            font-semibold
                            transition
                            ${cancelButtonClass}
                        `}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="px-6 py-10 text-center text-sm text-slate-400">
              No hay citas que coincidan con los filtros actuales.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-xl text-sm text-slate-400">
            Usa los filtros para acotar resultados y navega pagina a pagina.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:flex">
            <button
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              disabled={page === 0 || loading}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Anterior
            </button>

            <button
              onClick={() => setPage((current) => current + 1)}
              disabled={loading || appointments.length < PAGE_SIZE}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
