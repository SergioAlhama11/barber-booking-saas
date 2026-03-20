"use client";

import { useState } from "react";
import { Service, Barber } from "@/types";
import { getAvailability, createAppointment } from "@/services/api";
import { useRouter } from "next/navigation";

export function useBooking(slug: string) {
  const today = new Date().toISOString().split("T")[0];
  const router = useRouter();

  // STATE
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

  // HELPERS
  function resetSearch() {
    setSlots([]);
    setSelectedSlot(null);
    setHasSearched(false);
  }

  function resetForm() {
    setCustomerName("");
    setCustomerEmail("");
    setSelectedSlot(null);
  }

  function clearError() {
    setError(null);
  }

  // ACTIONS

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

      const data = await getAvailability(
        slug,
        selectedBarber.id,
        selectedService.id,
        date,
      );

      setSlots(data.slots);
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

    try {
      setLoading(true);
      setError(null);

      await createAppointment(slug, {
        barberId: selectedBarber.id,
        serviceId: selectedService.id,
        customerName,
        customerEmail,
        startTime: `${date}T${selectedSlot}`,
      });

      router.push(
        `/booking/confirmation?date=${date}&time=${selectedSlot.slice(0, 5)}&barber=${encodeURIComponent(selectedBarber.name)}&service=${encodeURIComponent(selectedService.name)}&email=${encodeURIComponent(customerEmail)}`,
      );
    } catch (error: any) {
      if (error.status === 409) {
        setError("This slot was just booked. Showing updated availability...");
        setSelectedSlot(null); // 👈 CLAVE
        await loadAvailability();
      } else if (error.status === 400) {
        setError(error.message);
      } else {
        setError("Unexpected error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return {
    // state
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

    // setters directos
    setCustomerName,
    setCustomerEmail,

    // actions
    selectService,
    selectBarber,
    changeDate,
    selectSlot,
    loadAvailability,
    book,
  };
}
