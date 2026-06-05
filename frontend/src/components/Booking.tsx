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

function PlaceholderCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-[1.6rem] border border-dashed border-white/8 bg-white/[0.02] p-6 text-center">
      <div className="max-w-xs space-y-2">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-sm leading-6 text-slate-400">{body}</p>
      </div>
    </div>
  );
}

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

  useEffect(() => {
    if (
      booking.selectedBarber?.id &&
      !barbers.some((b) => b.id === booking.selectedBarber?.id)
    ) {
      booking.selectBarber(null as never);
    }

    if (
      booking.selectedService?.id &&
      !services.some((s) => s.id === booking.selectedService?.id)
    ) {
      booking.selectService(null as never);
    }
  }, [booking, barbers, services]);

  // =========================
  // ANIMATION VARIANTS
  // =========================

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const summaryDate = booking.date
    ? formatSmartDate(booking.date)
    : "sin fecha";

  const desktopPanelClass =
    "rounded-[1.9rem] border border-white/8 bg-[#111827]/88 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.18)]";

  const desktopSummary = (
    <div className="rounded-[1.9rem] border border-white/8 bg-[#111827] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.2)] xl:p-5">
      <p className="text-[11px] uppercase tracking-[0.22em] text-blue-200/70">
        Estado de la reserva
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <p className="text-sm text-slate-500">Servicio</p>
          <p className="mt-1 text-base font-semibold text-white">
            {booking.selectedService?.name || "Selecciona un servicio"}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Barbero</p>
          <p className="mt-1 text-base font-semibold text-white">
            {booking.selectedBarber?.name || "Elige profesional"}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Fecha</p>
          <p className="mt-1 text-base font-semibold text-white">
            {summaryDate}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Hora</p>
          <p className="mt-1 text-base font-semibold text-blue-300">
            {booking.selectedSlot
              ? formatTimeSlot(booking.selectedSlot)
              : "Pendiente"}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-5 lg:space-y-6">
      {booking.selectedService && booking.selectedBarber && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-3 z-30 rounded-2xl border border-gray-800 bg-gray-950/90 px-4 py-3 shadow-lg shadow-black/20 backdrop-blur lg:hidden"
        >
          <div className="flex justify-between items-start gap-4 text-sm">
            <div className="min-w-0">
              <p className="font-medium text-white truncate">
                {booking.selectedService.name}
              </p>

              <p className="text-xs text-gray-400">
                {booking.selectedService.durationMinutes} min
                {booking.selectedService.price &&
                  ` · ${booking.selectedService.price} €`}
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

      <div className="space-y-6 lg:hidden">
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <ServiceSelector
            services={services}
            selectedService={booking.selectedService}
            onSelect={booking.selectService}
          />
        </motion.div>

        <AnimatePresence>
          {booking.selectedService && (
            <motion.div
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

        <AnimatePresence>
          {booking.selectedBarber && (
            <motion.div
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

        <AnimatePresence>
          {booking.loadingSlots && <SlotSkeleton />}
        </AnimatePresence>

        <AnimatePresence>
          {booking.hasSearched && (
            <motion.div
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

        <AnimatePresence>
          {booking.selectedSlot && (
            <motion.div
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

      <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
        <div className="space-y-5">
          {!booking.selectedService ? (
            <section className={desktopPanelClass}>
              <ServiceSelector
                services={services}
                selectedService={booking.selectedService}
                onSelect={booking.selectService}
              />
            </section>
          ) : (
            <div className="grid gap-5 xl:grid-cols-2">
              <section className={desktopPanelClass}>
                <ServiceSelector
                  services={services}
                  selectedService={booking.selectedService}
                  onSelect={booking.selectService}
                />
              </section>

              <section className={desktopPanelClass}>
                <BarberSelector
                  compact
                  barbers={barbers}
                  selectedBarber={booking.selectedBarber}
                  selectedServiceId={booking.selectedService.id}
                  slug={slug}
                  date={booking.date}
                  onSelect={booking.selectBarber}
                />
              </section>
            </div>
          )}

          {booking.selectedBarber && (
            <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
              <section className={desktopPanelClass}>
                <DateSelector
                  compact
                  date={booking.date}
                  minDate={booking.today}
                  onChange={booking.changeDate}
                  onCheck={booking.loadAvailability}
                />
              </section>

              <section className={desktopPanelClass}>
                {booking.loadingSlots ? (
                  <SlotSkeleton />
                ) : booking.hasSearched ? (
                  <>
                    <SlotSelector
                      compact
                      slots={booking.slots}
                      selectedSlot={booking.selectedSlot}
                      onSelect={booking.selectSlot}
                    />

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
                          Ver disponibilidad{" "}
                          {formatSmartDate(booking.suggestedDate)}
                        </button>
                      </div>
                    )}
                  </>
                ) : null}
              </section>
            </div>
          )}
        </div>

        <aside className="sticky top-24 space-y-4">
          {desktopSummary}

          {booking.selectedSlot ? (
            <BookingForm
              compact
              selectedSlot={booking.selectedSlot}
              customerName={booking.customerName}
              customerEmail={booking.customerEmail}
              onNameChange={booking.setCustomerName}
              onEmailChange={booking.setCustomerEmail}
              onSubmit={booking.book}
              loading={booking.loading}
            />
          ) : (
            <div className="rounded-[1.9rem] border border-white/8 bg-[#111827] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.2)] xl:p-5">
              <p className="text-[11px] uppercase tracking-[0.22em] text-blue-200/70">
                Siguiente paso
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Completa servicio, profesional, fecha y hora. Cuando elijas un
                hueco, aquí aparecerá el formulario final.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
