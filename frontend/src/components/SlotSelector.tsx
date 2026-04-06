"use client";

import { useState } from "react";

type Props = {
  slots: string[];
  selectedSlot: string | null;
  onSelect: (slot: string) => void;
};

export default function SlotSelector({ slots, selectedSlot, onSelect }: Props) {
  const [showAll, setShowAll] = useState(false);

  if (slots.length === 0) {
    return (
      <div className="mt-6 text-center text-gray-500">
        No hay huecos disponibles
      </div>
    );
  }

  const sortedSlots = [...slots].sort();
  const recommendedSlot = sortedSlots[0];

  const visibleSlots = showAll ? sortedSlots : sortedSlots.slice(0, 5);

  return (
    <div className="mt-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-3">
        Horarios disponibles
      </h2>

      {/* 🔥 RECOMENDADO (TOUCH FRIENDLY) */}
      <div className="mb-4 p-3 rounded-xl bg-green-50 border">
        <p className="text-xs text-gray-500">Recomendado</p>

        <button
          onClick={() => onSelect(recommendedSlot)}
          className={`mt-2 w-full py-3 text-lg font-semibold rounded-xl transition ${
            selectedSlot === recommendedSlot
              ? "bg-green-600 text-white"
              : "bg-green-500 text-white active:scale-95"
          }`}
        >
          {recommendedSlot.slice(0, 5)}
        </button>
      </div>

      {/* 🔥 GRID RESPONSIVE */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {visibleSlots.map((slot) => {
          const isRecommended = slot === recommendedSlot;

          return (
            <button
              key={slot}
              onClick={() => onSelect(slot)}
              className={`relative py-3 text-base rounded-xl border transition active:scale-95 ${
                selectedSlot === slot
                  ? "bg-blue-500 text-white"
                  : "bg-white hover:bg-gray-100"
              }`}
            >
              {slot.slice(0, 5)}

              {isRecommended && (
                <span className="absolute -top-2 -right-2 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 🔥 VER MÁS / MENOS */}
      {slots.length > 5 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="text-sm text-blue-500 active:opacity-70"
          >
            {showAll ? "Ver menos" : "Ver más horarios"}
          </button>
        </div>
      )}
    </div>
  );
}
