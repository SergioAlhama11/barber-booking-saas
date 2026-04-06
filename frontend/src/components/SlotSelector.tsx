"use client";

import { useMemo, useState } from "react";

type Props = {
  slots: string[];
  selectedSlot: string | null;
  onSelect: (slot: string) => void;
};

export default function SlotSelector({ slots, selectedSlot, onSelect }: Props) {
  const [showAll, setShowAll] = useState(false);

  const sortedSlots = useMemo(() => [...slots].sort(), [slots]);

  const recommendedSlot = sortedSlots[0];
  const visibleSlots = showAll ? sortedSlots : sortedSlots.slice(0, 6);

  const format = (slot: string) => slot.slice(0, 5);

  // EMPTY STATE
  if (slots.length === 0) {
    return (
      <div className="mt-8 text-center space-y-3">
        <p className="text-red-500 font-medium">
          ❌ No hay citas disponibles para esta fecha
        </p>
        <p className="text-gray-400 text-sm">
          Prueba con otro día o cambia de servicio/barbero
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4 text-white">
        Horarios disponibles
      </h2>

      {/* RECOMENDADO */}
      {recommendedSlot && (
        <div className="mb-5 p-4 rounded-2xl bg-green-900/30 border border-green-700">
          <p className="text-xs text-green-400 uppercase">Recomendado</p>

          <button
            onClick={() => onSelect(recommendedSlot)}
            className={`mt-2 w-full py-3 rounded-xl font-semibold transition
              ${
                selectedSlot === recommendedSlot
                  ? "bg-green-600 text-white"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
          >
            {format(recommendedSlot)}
          </button>
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {visibleSlots.map((slot) => {
          const isSelected = selectedSlot === slot;

          return (
            <button
              key={slot}
              onClick={() => onSelect(slot)}
              className={`py-3 rounded-xl border transition
                ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-gray-900 border-gray-700 text-white hover:bg-gray-800"
                }`}
            >
              {format(slot)}
            </button>
          );
        })}
      </div>

      {/* VER MÁS */}
      {slots.length > 6 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll((p) => !p)}
            className="text-blue-400 text-sm hover:text-blue-300"
          >
            {showAll ? "Ver menos" : "Ver más horarios"}
          </button>
        </div>
      )}
    </div>
  );
}
