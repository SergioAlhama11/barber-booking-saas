"use client";

import { useState, useEffect } from "react";
import { Service, Barber } from "@/types";
import { getAvailability, createAppointment } from "@/services/api";
import { useRouter } from "next/navigation";
import {
  buildUTCDateTime,
  getTodayLocal,
  formatLocalDate,
} from "@/services/dateService";

const STORAGE_KEY = "booking_state";

export function useBooking(slug: string) {
  const today = getTodayLocal();
  const router = useRouter();

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [suggestedDate, setSuggestedDate] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string>("direct");

  // =========================
  // INIT
  // =========================

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);

      if (parsed.serviceId) {
        setSelectedService({ id: parsed.serviceId } as Service);
      }

      if (parsed.barberId) {
        setSelectedBarber({ id: parsed.barberId } as Barber);
      }
    } catch {
      console.warn("Error parsing booking state");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        serviceId: selectedService?.id ?? null,
        barberId: selectedBarber?.id ?? null,
      }),
    );
  }, [selectedService, selectedBarber]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const src = params.get("src");
    if (src) setSource(src);
  }, []);

  // =========================
  // AUTOLOAD
  // =========================

  useEffect(() => {
    if (!selectedService?.id || !selectedBarber?.id) return;
    if (selectedBarber && selectedService) {
      loadAvailability(date);
    }
  }, [selectedBarber, selectedService, date]);

  // =========================
  // HELPERS
  // =========================

  function resetSearch() {
    setSlots([]);
    setSelectedSlot(null);
    setHasSearched(false);
    setSuggestedDate(null);
  }

  function clearError() {
    setError(null);
  }

  // =========================
  // SELECTORS
  // =========================

  function selectService(service: Service) {
    clearError();
    setSelectedService(service);
    setSelectedBarber(null);
    resetSearch();
  }

  function selectBarber(barber: Barber) {
    clearError();
    setSelectedBarber(barber);
    resetSearch();
  }

  function hydrateService(service: Service) {
    setSelectedService((current) => {
      if (!current || current.id !== service.id) return current;
      if (current.name === service.name) return current;
      return service;
    });
  }

  function hydrateBarber(barber: Barber) {
    setSelectedBarber((current) => {
      if (!current || current.id !== barber.id) return current;
      if (current.name === barber.name) return current;
      return barber;
    });
  }

  function changeDate(newDate: string) {
    clearError();
    setDate(newDate);
    resetSearch();
  }

  function selectSlot(slot: string) {
    clearError();
    setSelectedSlot(slot);
  }

  // =========================
  // SMART AVAILABILITY
  // =========================

  async function findNextAvailableDate(fromDate: string) {
    if (!selectedBarber || !selectedService) return null;

    const base = new Date(fromDate);

    for (let i = 1; i <= 14; i++) {
      const next = new Date(base);
      next.setDate(next.getDate() + i);

      const formatted = formatLocalDate(next);

      const res = await getAvailability(
        slug,
        selectedBarber.id,
        selectedService.id,
        formatted,
      );

      const slots = res.data?.slots ?? [];

      if (!res.error && slots.length > 0) {
        return formatted;
      }
    }

    return null;
  }

  // =========================
  // LOAD AVAILABILITY
  // =========================

  async function loadAvailability(customDate?: string) {
    if (!selectedBarber || !selectedService) return;

    try {
      setLoadingSlots(true);
      setSuggestedDate(null);

      const targetDate = customDate ?? date;

      const res = await getAvailability(
        slug,
        selectedBarber.id,
        selectedService.id,
        targetDate,
      );

      if (res.error || !res.data) {
        setError(res.message || "Error loading availability");
        return;
      }

      const slots = res.data.slots ?? [];

      setSlots(slots);
      setHasSearched(true);

      if (slots.length > 0) {
        setSelectedSlot((prev) => prev ?? slots[0]); // 🔥 no sobrescribe selección manual
      } else {
        const next = await findNextAvailableDate(targetDate);
        setSuggestedDate(next);
      }
    } catch (e) {
      console.error("LOAD ERROR", e);
      setError("Error loading availability");
    } finally {
      setLoadingSlots(false);
    }
  }

  // =========================
  // BOOK
  // =========================

  async function book() {
    if (
      !selectedSlot ||
      !selectedBarber ||
      !selectedService ||
      !customerName ||
      !customerEmail
    ) {
      setError("Por favor completa todos los campos");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const startTime = buildUTCDateTime(date, selectedSlot);

      const response = await createAppointment(slug, {
        barberId: selectedBarber.id,
        serviceId: selectedService.id,
        customerName,
        customerEmail,
        startTime,
        source,
      });

      if (response.error || !response.data) {
        setError(response.message || "Error al reservar cita");
        return;
      }

      router.push(
        `/barbershops/${slug}/booking/confirmation/${response.data.id}`,
      );
    } catch {
      setError("Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return {
    today,
    selectedService,
    selectedBarber,
    selectedSlot,
    date,
    slots,
    hasSearched,
    suggestedDate,
    customerName,
    customerEmail,
    loading,
    loadingSlots,
    error,
    source,
    setCustomerName,
    setCustomerEmail,
    selectService,
    selectBarber,
    hydrateService,
    hydrateBarber,
    changeDate,
    selectSlot,
    loadAvailability,
    book,
  };
}
