"use client";

import { useState } from "react";

import { useAdminSession } from "@/hooks/useAdminSession";

import { useAdminBarbers } from "@/hooks/admin/barbers/useAdminBarbers";

import { useAppointmentFilters } from "@/hooks/admin/appointments/useAppointmentFilters";
import { useAdminAppointments } from "@/hooks/admin/appointments/useAdminAppointments";
import { useAdminCreateAppointment } from "@/hooks/admin/appointments/useAdminCreateAppointment";
import { useAdminUpdateAppointment } from "@/hooks/admin/appointments/useAdminUpdateAppointment";
import { useAdminCancelAppointment } from "@/hooks/admin/appointments/useAdminCancelAppointment";

import { useAdminServices } from "@/hooks/admin/services/useAdminServices";

import type {
  AdminAppointment,
  AdminCreateAppointmentRequest,
  AdminUpdateAppointmentRequest,
} from "@/services/admin/appointments/types";

import { AppointmentsFilters } from "@/components/admin/appointments/AppointmentsFilters";
import { AppointmentsList } from "@/components/admin/appointments/AppointmentsList";
import { NextAppointmentCard } from "@/components/admin/appointments/NextAppointmentCard";

import { CreateAppointmentModal } from "@/components/admin/appointments/CreateAppointmentModal";
import { ImportAppointmentModal } from "@/components/admin/appointments/ImportAppointmentModal";
import { EditAppointmentModal } from "@/components/admin/appointments/EditAppointmentModal";
import { CancelAppointmentDialog } from "@/components/admin/appointments/CancelAppointmentDialog";

export default function AdminAppointmentsPage() {
  const { me } = useAdminSession();

  const filters = useAppointmentFilters();

  const { create, loading: creating } = useAdminCreateAppointment();
  const { update, loading: updating } = useAdminUpdateAppointment();
  const { cancel, loading: cancelling } = useAdminCancelAppointment();

  const appointmentsData = useAdminAppointments({
    me,
    filters,
  });

  const {
    appointments,
    nextAppointment,
    loading,
    loadingBarbers,
    error,
    barbers,
    barbershops,
    isBarberOnly,
    isSuperAdmin,
    refetch,
  } = appointmentsData;

  const selectedBarbershop = barbershops.find(
    (barbershop) => barbershop.id === filters.barbershopId,
  );

  const availabilitySlug =
    selectedBarbershop?.slug ??
    barbershops.find((barbershop) => barbershop.id === me?.barbershopId)
      ?.slug ??
    "";

  const { services, loading: loadingServices } = useAdminServices(
    isSuperAdmin
      ? typeof filters.barbershopId === "number"
        ? filters.barbershopId
        : undefined
      : (me?.barbershopId ?? undefined),
  );

  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const canManageAppointments =
    !isSuperAdmin || typeof filters.barbershopId === "number";

  const [editingAppointment, setEditingAppointment] =
    useState<AdminAppointment | null>(null);

  const editBarbershopId = editingAppointment?.barbershopId;

  const { data: editBarbers = [], isLoading: loadingEditBarbers } =
    useAdminBarbers(editBarbershopId);

  const { services: editServices, loading: loadingEditServices } =
    useAdminServices(editBarbershopId);

  const editSlug =
    barbershops.find((barbershop) => barbershop.id === editBarbershopId)
      ?.slug ?? "";

  const [cancellingAppointment, setCancellingAppointment] =
    useState<AdminAppointment | null>(null);

  const handleCreateAppointment = async (
    request: AdminCreateAppointmentRequest,
  ) => {
    await create(request);

    setCreateOpen(false);
  };

  const handleUpdateAppointment = async (
    request: AdminUpdateAppointmentRequest,
  ) => {
    if (!editingAppointment) {
      return;
    }

    await update(editingAppointment.id, request);

    setEditingAppointment(null);
  };

  const handleCancelAppointment = async () => {
    if (!cancellingAppointment) {
      return;
    }

    await cancel(cancellingAppointment.id);

    setCancellingAppointment(null);
  };

  if (!me) {
    return (
      <div className="flex flex-1 items-center justify-center">Cargando...</div>
    );
  }

  return (
    <div className="space-y-6 px-4 pb-6 pt-4">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(140deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <div className="p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
                PANEL DE CITAS
              </p>

              <h1 className="mt-3 text-5xl font-semibold text-white">
                Agenda del equipo
              </h1>

              <p className="mt-3 text-slate-300">
                Consulta las reservas del día, organiza la agenda y gestiona
                cambios rápidamente.
              </p>
            </div>

            <NextAppointmentCard appointment={nextAppointment} />
          </div>
        </div>
      </section>

      <AppointmentsFilters
        status={filters.status}
        searchInput={filters.searchInput}
        fromDate={filters.fromDate}
        toDate={filters.toDate}
        barberId={filters.barberId}
        barbershopId={filters.barbershopId}
        isSuperAdmin={isSuperAdmin}
        isBarberOnly={isBarberOnly}
        loadingBarbers={loadingBarbers}
        barbers={barbers}
        barbershops={barbershops}
        onStatusChange={filters.setStatus}
        onSearchChange={filters.setSearchInput}
        onFromDateChange={filters.setFromDate}
        onToDateChange={filters.setToDate}
        onBarberChange={filters.setBarberId}
        onBarbershopChange={filters.setBarbershopId}
      />

      <div className="flex justify-end gap-3">
        <button
          disabled={!canManageAppointments}
          onClick={() => setImportOpen(true)}
          className="
            rounded-2xl
            border
            border-white/10
            bg-white/5
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-white/10
            disabled:opacity-50
          "
        >
          Importar citas
        </button>

        <button
          disabled={!canManageAppointments}
          onClick={() => setCreateOpen(true)}
          className="
            rounded-2xl
            bg-cyan-300
            px-5
            py-3
            text-sm
            font-semibold
            text-slate-950
            transition
            hover:bg-cyan-200
            disabled:opacity-50
          "
        >
          Nueva cita
        </button>
        <ImportAppointmentModal
          open={importOpen}
          onClose={() => setImportOpen(false)}
          barbershopId={
            isSuperAdmin
              ? (filters.barbershopId as number)
              : (me.barbershopId as number)
          }
          barbers={barbers}
          services={services}
          onImported={async () => {
            await refetch();
          }}
        />
      </div>

      {isSuperAdmin && !filters.barbershopId && (
        <p className="text-sm text-amber-300">
          Selecciona una barbería para crear o importar citas.
        </p>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      <AppointmentsList
        appointments={appointments}
        loading={loading}
        onEdit={(appointment) => {
          setEditingAppointment(appointment);
        }}
        onCancel={(appointment) => {
          setCancellingAppointment(appointment);
        }}
      />

      <CreateAppointmentModal
        open={createOpen}
        loading={creating || loadingServices}
        barbers={barbers}
        services={services}
        slug={availabilitySlug}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateAppointment}
      />

      <EditAppointmentModal
        open={!!editingAppointment}
        appointment={editingAppointment}
        loading={updating || loadingEditBarbers || loadingEditServices}
        barbers={editBarbers}
        services={editServices}
        slug={editSlug}
        onClose={() => setEditingAppointment(null)}
        onSubmit={handleUpdateAppointment}
      />

      <CancelAppointmentDialog
        open={!!cancellingAppointment}
        appointment={cancellingAppointment}
        loading={cancelling}
        onClose={() => setCancellingAppointment(null)}
        onConfirm={handleCancelAppointment}
      />
    </div>
  );
}
