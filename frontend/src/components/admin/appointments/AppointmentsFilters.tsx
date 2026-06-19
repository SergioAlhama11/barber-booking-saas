"use client";

import type { ReactNode } from "react";
import type { AdminAppointmentStatus } from "@/services/admin/appointments/types";
import type { AdminBarber } from "@/services/admin/barbers/types";
import type { AdminBarbershop } from "@/services/admin/barbershops/types";

function SelectField({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}

      <span
        className="
          pointer-events-none
          absolute
          right-4
          top-1/2
          -translate-y-1/2
          text-slate-500
          text-[10px]
        "
      >
        ▼
      </span>
    </div>
  );
}

type Props = {
  status: AdminAppointmentStatus;
  searchInput: string;
  fromDate: string;
  toDate: string;

  barberId: number | "";
  barbershopId: number | "";

  isSuperAdmin: boolean;
  isBarberOnly: boolean;

  loadingBarbers: boolean;

  barbers: AdminBarber[];
  barbershops: AdminBarbershop[];

  onStatusChange: (value: AdminAppointmentStatus) => void;
  onSearchChange: (value: string) => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onBarberChange: (value: number | "") => void;
  onBarbershopChange: (value: number | "") => void;
};

export function AppointmentsFilters({
  status,
  searchInput,
  fromDate,
  toDate,
  barberId,
  barbershopId,
  isSuperAdmin,
  isBarberOnly,
  loadingBarbers,
  barbers,
  barbershops,
  onStatusChange,
  onSearchChange,
  onFromDateChange,
  onToDateChange,
  onBarberChange,
  onBarbershopChange,
}: Props) {
  return (
    <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <label className="flex flex-col gap-2">
        <span className="text-sm text-slate-300">Buscar cliente</span>

        <input
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Nombre o email"
          className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-slate-300">Estado</span>

        <SelectField>
          <select
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as AdminAppointmentStatus)
            }
            className="
              h-12
              w-full
              rounded-2xl
              border
              border-white/10
              bg-white/[0.04]
              px-4
              pr-10
              text-sm
              text-white
              outline-none
              appearance-none
              transition
              focus:border-cyan-400/60
            "
          >
            <option value="ACTIVE">Activas</option>
            <option value="COMPLETED">Completadas</option>
            <option value="CANCELLED">Canceladas</option>
            <option value="ALL">Todas</option>
          </select>
        </SelectField>
      </label>

      {isSuperAdmin && (
        <label className="flex flex-col gap-2">
          <span className="text-sm text-slate-300">Barbería</span>

          <SelectField>
            <select
              value={barbershopId}
              onChange={(event) =>
                onBarbershopChange(
                  event.target.value ? Number(event.target.value) : "",
                )
              }
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 pr-10 text-sm text-white outline-none appearance-none transition focus:border-cyan-400/60"
            >
              <option value="">Todas las barberías</option>

              {barbershops.map((barbershop) => (
                <option key={barbershop.id} value={barbershop.id}>
                  {barbershop.name}
                </option>
              ))}
            </select>
          </SelectField>
        </label>
      )}

      <label className="flex flex-col gap-2">
        <span className="text-sm text-slate-300">Desde</span>

        <input
          type="date"
          value={fromDate}
          onChange={(event) => onFromDateChange(event.target.value)}
          className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/60"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-slate-300">Hasta</span>

        <input
          type="date"
          value={toDate}
          onChange={(event) => onToDateChange(event.target.value)}
          className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60"
        />
      </label>

      {(!isSuperAdmin || barbershopId !== "") && (
        <label className="flex flex-col gap-2">
          <span className="text-sm text-slate-300">
            {isBarberOnly ? "Tu agenda" : "Barbero"}
          </span>

          <SelectField>
            <select
              value={barberId}
              onChange={(event) =>
                onBarberChange(
                  event.target.value ? Number(event.target.value) : "",
                )
              }
              disabled={loadingBarbers || isBarberOnly}
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 pr-10 text-sm text-white outline-none appearance-none transition focus:border-cyan-400/60"
            >
              {!isBarberOnly && <option value="">Todos</option>}

              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name}
                </option>
              ))}
            </select>
          </SelectField>
        </label>
      )}
    </div>
  );
}
