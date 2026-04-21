"use client";

import { Service, Barber } from "@/types";
import { useBooking } from "@/hooks/useBooking";

import ServiceSelector from "./ServiceSelector";
import BarberSelector from "./BarberSelector";
import DateSelector from "./DateSelector";
import SlotSelector from "./SlotSelector";
import BookingForm from "./BookingForm";
import SlotSkeleton from "./SlotSkeleton";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

import { formatSmartDate } from "@/services/dateService";
import { formatTimeSlot } from "@/services/dateService";

export default function Booking({
  services,
  barbers,
  slug,
}: {
  services: Service[];
  barbers: Barber[];
  slug: string;
}) {
  const booking = useBooking(slug);

  useEffect(() => {
    if (booking.selectedService?.id && !booking.selectedService.name) {
      const fullService = services.find(
        (service) => service.id === booking.selectedService?.id,
      );

      if (fullService) {
        booking.hydrateService(fullService);
      }
    }

    if (booking.selectedBarber?.id && !booking.selectedBarber.name) {
      const fullBarber = barbers.find(
        (barber) => barber.id === booking.selectedBarber?.id,
      );

      if (fullBarber) {
        booking.hydrateBarber(fullBarber);
      }
    }
  }, [
    barbers,
    booking,
    booking.selectedBarber?.id,
    booking.selectedBarber?.name,
    booking.selectedService?.id,
    booking.selectedService?.name,
    services,
  ]);

  // =========================
  // ANIMATION VARIANTS
  // =========================

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      {booking.selectedService && booking.selectedBarber && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-3 z-30 bg-gray-950/90 backdrop-blur border border-gray-800 px-4 py-3 rounded-2xl shadow-lg shadow-black/20"
        >
          <div className="flex justify-between items-start gap-4 text-sm">
            <div className="min-w-0">
              <p className="font-medium text-white truncate">
                {booking.selectedService.name}
              </p>

              <p className="text-xs text-gray-400">
                {booking.selectedService.durationMinutes} min
                {booking.selectedService.price &&
                  ` · ${booking.selectedService.price}€`}
              </p>

              <p className="text-gray-500 text-xs mt-1">
                {booking.selectedBarber.name}
              </p>
            </div>

            {booking.selectedSlot && (
              <div className="text-right shrink-0">
                <p className="text-[11px] uppercase tracking-wide text-gray-500">
                  Hora
                </p>
                <p className="text-blue-400 font-semibold text-base">
                  {formatTimeSlot(booking.selectedSlot)}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
      {/* ERROR GLOBAL */}
      <AnimatePresence>
        {booking.error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-3 bg-red-900/20 border border-red-800 text-red-300 rounded-2xl text-sm"
          >
            {booking.error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 1 - SERVICE */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <ServiceSelector
          services={services}
          selectedService={booking.selectedService}
          onSelect={booking.selectService}
        />
      </motion.div>

      {/* STEP 2 - BARBER */}
      <AnimatePresence>
        {booking.selectedService && (
          <motion.div initial="hidden" animate="visible" exit="hidden" variants={fadeUp}>
            <BarberSelector
              barbers={barbers}
              selectedBarber={booking.selectedBarber}
              selectedServiceId={booking.selectedService?.id ?? null}
              slug={slug}
              date={booking.date}
              onSelect={booking.selectBarber}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 3 - DATE */}
      <AnimatePresence>
        {booking.selectedBarber && (
          <motion.div initial="hidden" animate="visible" exit="hidden" variants={fadeUp}>
            <DateSelector
              date={booking.date}
              minDate={booking.today}
              onChange={booking.changeDate}
              onCheck={booking.loadAvailability}
              disabled={!booking.selectedBarber}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOADING */}
      <AnimatePresence>
        {booking.loadingSlots && <SlotSkeleton />}
      </AnimatePresence>

      {/* STEP 4 - SLOTS */}
      <AnimatePresence>
        {booking.hasSearched && (
          <motion.div initial="hidden" animate="visible" exit="hidden" variants={fadeUp}>
            <SlotSelector
              slots={booking.slots}
              selectedSlot={booking.selectedSlot}
              onSelect={booking.selectSlot}
            />

            {/* 👉 SUGERENCIA AUTOMÁTICA (SIN REDUNDANCIA) */}
            {booking.slots.length === 0 && booking.suggestedDate && (
              <div className="mt-4 rounded-2xl border border-amber-700/40 bg-amber-500/10 px-4 py-4 text-center space-y-2">
                <p className="text-sm font-medium text-white">
                  No hay huecos para este día
                </p>
                <p className="text-xs text-gray-400">
                  Te sugerimos la siguiente fecha con disponibilidad.
                </p>

                <button
                  onClick={async () => {
                    const next = booking.suggestedDate!;
                    booking.changeDate(next);
                    await booking.loadAvailability(next);
                  }}
                  className="inline-flex items-center justify-center rounded-xl bg-amber-300/15 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-300/20 transition"
                >
                  Ver disponibilidad {formatSmartDate(booking.suggestedDate)}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 5 - FORM */}
      <AnimatePresence>
        {booking.selectedSlot && (
          <motion.div initial="hidden" animate="visible" exit="hidden" variants={fadeUp}>
            <BookingForm
              selectedSlot={booking.selectedSlot}
              customerName={booking.customerName}
              customerEmail={booking.customerEmail}
              onNameChange={booking.setCustomerName}
              onEmailChange={booking.setCustomerEmail}
              onSubmit={booking.book}
              loading={booking.loading}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
