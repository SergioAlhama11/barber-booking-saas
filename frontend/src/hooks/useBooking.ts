"use client";

import { useState, useEffect } from "react";
import { Service, Barber } from "@/types";
import { getAvailability, createAppointment } from "@/services/api";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "booking_state";

export function useBooking(slug: string) {
  const today = new Date().toISOString().split("T")[0];
  const router = useRouter();

  // =========================
  // STATE
  // =========================

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

  // Persistencia
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setSelectedService(parsed.service ?? null);
      setSelectedBarber(parsed.barber ?? null);
    } catch {
      console.warn("Error parsing booking state");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        service: selectedService,
        barber: selectedBarber,
      }),
    );
  }, [selectedService, selectedBarber]);

  // Tracking source (?src=qr)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const src = params.get("src");

    if (src) setSource(src);
  }, []);

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

  function formatDate(date: Date) {
    return date.toISOString().split("T")[0];
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

  async function findNextAvailableDate(): Promise<string | null> {
    if (!selectedBarber || !selectedService) return null;

    for (let i = 1; i <= 7; i++) {
      const next = new Date(date);
      next.setDate(next.getDate() + i);

      const formatted = formatDate(next);

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

  async function loadAvailability() {
    if (!selectedBarber || !selectedService) return;

    try {
      setLoadingSlots(true);
      setSuggestedDate(null);

      const res = await getAvailability(
        slug,
        selectedBarber.id,
        selectedService.id,
        date,
      );

      if (res.error || !res.data) {
        setError(res.message || "Error loading availability");
        return;
      }

      const slots = res.data.slots ?? [];

      setSlots(slots);
      setHasSearched(true);

      if (slots.length > 0) {
        // 🔥 AUTO SELECT PRIMER SLOT
        setSelectedSlot(slots[0]);
      } else {
        const next = await findNextAvailableDate();
        setSuggestedDate(next);
      }
    } catch {
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

      const response = await createAppointment(slug, {
        barberId: selectedBarber.id,
        serviceId: selectedService.id,
        customerName,
        customerEmail,
        startTime: `${date}T${selectedSlot}`,
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

  // =========================
  // RETURN
  // =========================

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
    changeDate,
    selectSlot,

    loadAvailability,
    book,
  };
}
