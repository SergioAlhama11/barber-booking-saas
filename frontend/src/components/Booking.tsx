"use client";

import { Service, Barber } from "@/types";
import { useBooking } from "@/hooks/useBooking";

import ServiceSelector from "./ServiceSelector";
import BarberSelector from "./BarberSelector";
import DateSelector from "./DateSelector";
import SlotSelector from "./SlotSelector";
import BookingForm from "./BookingForm";

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

  return (
    <div className="p-6 max-w-xl mx-auto">
      <ServiceSelector
        services={services}
        selectedService={booking.selectedService}
        onSelect={booking.selectService}
      />

      {booking.selectedService && (
        <BarberSelector
          barbers={barbers}
          selectedBarber={booking.selectedBarber}
          onSelect={booking.selectBarber}
        />
      )}

      {booking.selectedBarber && (
        <DateSelector
          date={booking.date}
          minDate={booking.today}
          onChange={booking.changeDate}
          onCheck={booking.loadAvailability}
          disabled={!booking.selectedBarber || !booking.selectedService}
        />
      )}

      <SlotSelector
        slots={booking.slots}
        selectedSlot={booking.selectedSlot}
        onSelect={booking.selectSlot}
      />

      {booking.hasSearched && booking.slots.length === 0 && (
        <p className="mt-4 text-gray-500">No availability for selected date</p>
      )}

      {booking.selectedSlot && (
        <BookingForm
          selectedSlot={booking.selectedSlot}
          customerName={booking.customerName}
          customerEmail={booking.customerEmail}
          onNameChange={booking.setCustomerName}
          onEmailChange={booking.setCustomerEmail}
          onSubmit={booking.book}
          loading={booking.loading}
        />
      )}

      {booking.error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {booking.error}
        </div>
      )}
    </div>
  );
}
