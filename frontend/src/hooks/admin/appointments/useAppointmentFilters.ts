import { useState } from "react";
import { getTodayLocal } from "@/services/dateService";
import type { AdminAppointmentStatus } from "@/services/admin/appointments/types";

export function useAppointmentFilters() {
  const [status, setStatus] = useState<AdminAppointmentStatus>("ACTIVE");

  const [searchInput, setSearchInput] = useState("");

  const [fromDate, setFromDate] = useState(getTodayLocal());

  const [toDate, setToDate] = useState(getTodayLocal());

  const [barberId, setBarberId] = useState<number | "">("");

  const [barbershopId, setBarbershopId] = useState<number | "">("");

  const [page, setPage] = useState(0);

  return {
    status,
    setStatus,

    searchInput,
    setSearchInput,

    fromDate,
    setFromDate,

    toDate,
    setToDate,

    barberId,
    setBarberId,

    barbershopId,
    setBarbershopId,

    page,
    setPage,
  };
}
