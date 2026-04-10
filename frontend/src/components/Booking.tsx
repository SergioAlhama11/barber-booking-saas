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
import { useEffect, useRef } from "react";

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

  // =========================
  // AUTO SCROLL REFS
  // =========================

  const barberRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  function scrollTo<T extends HTMLElement>(ref: React.RefObject<T | null>) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // =========================
  // AUTO FLOW
  // =========================

  useEffect(() => {
    if (booking.hasSearched) scrollTo(slotsRef);
  }, [booking.hasSearched]);

  useEffect(() => {
    if (booking.selectedSlot) scrollTo(formRef);
  }, [booking.selectedSlot]);

  // =========================
  // ANIMATION VARIANTS
  // =========================

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-6 max-w-md w-full mx-auto space-y-6">
      {booking.selectedService && booking.selectedBarber && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur border border-gray-800 p-3 rounded-xl"
        >
          <div className="flex justify-between items-center text-sm">
            <div>
              <p className="font-medium text-white">
                {booking.selectedService.name}
              </p>

              <p className="text-xs text-gray-400">
                {booking.selectedService.durationMinutes} min
                {booking.selectedService.price &&
                  ` · ${booking.selectedService.price}€`}
              </p>

              <p className="text-gray-400 text-xs">
                {booking.selectedBarber.name}
              </p>
            </div>

            {booking.selectedSlot && (
              <div className="text-right">
                <p className="text-blue-400 font-semibold">
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
            className="p-4 bg-red-900/30 border border-red-700 text-red-400 rounded-xl"
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
          <motion.div
            ref={barberRef}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeUp}
          >
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
          <motion.div
            ref={dateRef}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeUp}
          >
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
          <motion.div
            ref={slotsRef}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeUp}
          >
            <SlotSelector
              slots={booking.slots}
              selectedSlot={booking.selectedSlot}
              onSelect={booking.selectSlot}
            />

            {/* 👉 SUGERENCIA AUTOMÁTICA */}
            {booking.slots.length === 0 && (
              <div className="mt-4 text-center space-y-2">
                <p className="text-red-400 font-medium">
                  ❌ No quedan huecos este día
                </p>

                {booking.suggestedDate && (
                  <>
                    {/* 👇 AQUÍ VA */}
                    <p className="text-gray-400 text-xs">
                      Próximo hueco disponible
                    </p>

                    <button
                      onClick={async () => {
                        const next = booking.suggestedDate!;
                        booking.changeDate(next);
                        await booking.loadAvailability(next);
                      }}
                      className="text-yellow-300 underline text-sm hover:text-yellow-200 transition"
                    >
                      👉 Ver disponibilidad{" "}
                      {formatSmartDate(booking.suggestedDate)}
                    </button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* STEP 5 - FORM */}
      <AnimatePresence>
        {booking.selectedSlot && (
          <motion.div
            ref={formRef}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeUp}
          >
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
