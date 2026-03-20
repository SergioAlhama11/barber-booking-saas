"use client";

import { Barber } from "@/types";

export default function BarberSelector({
  barbers,
  selectedBarber,
  onSelect,
}: {
  barbers: Barber[];
  selectedBarber: Barber | null;
  onSelect: (barber: Barber) => void;
}) {
  return (
    <>
      <h2 className="text-xl font-semibold mt-6 mb-4">
        Seleccione el Barbero:
      </h2>

      <div className="space-y-2">
        {barbers.map((b) => (
          <button
            key={b.id}
            onClick={() => onSelect(b)}
            className={`w-full border p-3 rounded text-left ${
              selectedBarber?.id === b.id
                ? "bg-black text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>
    </>
  );
}
