"use client";

import { useState } from "react";
import { Service, Barber } from "@/types";
import { getAvailability, createAppointment } from "@/services/api";
import { useRouter } from "next/navigation";

export function useBooking(slug: string) {
  const today = new Date().toISOString().split("T")[0];
  const router = useRouter();

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [error, setError] = useState<string | null>(null);

  function resetSearch() {
    setSlots([]);
    setSelectedSlot(null);
    setHasSearched(false);
  }

  function clearError() {
    setError(null);
  }

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

  async function loadAvailability() {
    if (!selectedBarber || !selectedService) return;

    try {
      setLoadingSlots(true);

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

      setSlots(res.data.slots);
      setHasSearched(true);
    } catch {
      setError("Error loading availability");
    } finally {
      setLoadingSlots(false);
    }
  }

  async function book() {
    if (
      !selectedSlot ||
      !selectedBarber ||
      !selectedService ||
      !customerName ||
      !customerEmail
    ) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError(null);

    const response = await createAppointment(slug, {
      barberId: selectedBarber.id,
      serviceId: selectedService.id,
      customerName,
      customerEmail,
      startTime: `${date}T${selectedSlot}`,
    });

    setLoading(false);

    // 🔴 AQUÍ ESTÁ LA CLAVE
    if (response.error) {
      console.log("UI ERROR:", response.message);
      setError(response.message || "Error al reservar cita");
      return;
    }

    if (!response.data) {
      setError("Respuesta inválida del servidor");
      return;
    }

    // ✅ SOLO SI TODO OK
    router.push(
      `/barbershops/${slug}/booking/confirmation/${response.data.id}`,
    );
  }

  return {
    today,
    selectedService,
    selectedBarber,
    selectedSlot,
    date,
    slots,
    hasSearched,
    customerName,
    customerEmail,
    loading,
    loadingSlots,
    error,

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
