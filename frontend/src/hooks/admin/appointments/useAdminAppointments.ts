"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getAdminAppointments } from "@/services/admin/appointments/api";
import { getAdminBarbers } from "@/services/admin/barbers/api";
import { getAdminBarbershops } from "@/services/admin/barbershops/api";

import type { AdminAppointment } from "@/services/admin/appointments/types";
import type { AdminBarber } from "@/services/admin/barbers/types";
import type { AdminBarbershop } from "@/services/admin/barbershops/types";

import {
  PAGE_SIZE,
  toInstantRangeEnd,
  toInstantRangeStart,
} from "@/components/admin/appointments/utils";

type Props = {
  me: {
    roles: string[];
    barberId?: number | null;
    barbershopId?: number | null;
  } | null;

  filters: {
    status: string;
    searchInput: string;
    fromDate: string;
    toDate: string;
    barberId: number | "";
    barbershopId: number | "";
    page: number;
  };
};

export function useAdminAppointments({ me, filters }: Props) {
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const deferredSearch = useDeferredValue(filters.searchInput);

  const isBarberOnly = Boolean(me?.roles.includes("BARBER") && me?.barberId);

  const isSuperAdmin = Boolean(me?.roles.includes("SUPER_ADMIN"));

  const effectiveBarberId =
    isBarberOnly && typeof me?.barberId === "number"
      ? me.barberId
      : filters.barberId;

  const effectiveBarbershopId = isSuperAdmin
    ? filters.barbershopId
    : (me?.barbershopId ?? "");

  const barbershopsQuery = useQuery<AdminBarbershop[]>({
    queryKey: ["admin-barbershops"],
    queryFn: getAdminBarbershops,
    enabled: !!me && isSuperAdmin,
  });

  const barbersQuery = useQuery<AdminBarber[]>({
    queryKey: ["admin-barbers", effectiveBarbershopId],

    queryFn: () =>
      getAdminBarbers(
        typeof effectiveBarbershopId === "number"
          ? effectiveBarbershopId
          : undefined,
      ),

    enabled:
      !!me && (!isSuperAdmin || typeof effectiveBarbershopId === "number"),
  });

  const appointmentsQuery = useQuery<AdminAppointment[]>({
    queryKey: [
      "admin-appointments",
      filters.status,
      deferredSearch,
      filters.fromDate,
      filters.toDate,
      effectiveBarberId,
      effectiveBarbershopId,
      filters.page,
    ],

    queryFn: () =>
      getAdminAppointments({
        status: filters.status as any,

        search: deferredSearch.trim() || undefined,

        from: toInstantRangeStart(filters.fromDate),

        to: toInstantRangeEnd(filters.toDate),

        barberId:
          typeof effectiveBarberId === "number" ? effectiveBarberId : undefined,

        barbershopId:
          typeof effectiveBarbershopId === "number"
            ? effectiveBarbershopId
            : undefined,

        page: filters.page,
        size: PAGE_SIZE,
      }),

    enabled: !!me,
  });

  const appointments = useMemo(
    () =>
      [...(appointmentsQuery.data ?? [])].sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      ),
    [appointmentsQuery.data],
  );

  const nextAppointment =
    appointments.find(
      (appointment) =>
        !appointment.cancelledAt &&
        new Date(appointment.startTime).getTime() >= nowMs,
    ) ??
    appointments.find((appointment) => !appointment.cancelledAt) ??
    null;

  return {
    appointments,

    nextAppointment,

    loading: appointmentsQuery.isLoading || appointmentsQuery.isFetching,

    loadingBarbers: barbersQuery.isLoading || barbersQuery.isFetching,

    error:
      appointmentsQuery.error instanceof Error
        ? appointmentsQuery.error.message
        : "",

    barbers: barbersQuery.data ?? [],

    barbershops: barbershopsQuery.data ?? [],

    isBarberOnly,

    isSuperAdmin,
    refetch: appointmentsQuery.refetch,
  };
}
