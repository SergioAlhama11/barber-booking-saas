"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";

import { formatTimeSlot } from "@/services/dateService";

type Props = {
  slots: string[];
  selectedSlot: string | null;
  onSelect: (slot: string) => void;
};

const MAX_VISIBLE = 6;

export default function SlotSelector({ slots, selectedSlot, onSelect }: Props) {
  const [showAll, setShowAll] = useState(false);

  const sortedSlots = useMemo(() => [...slots].sort(), [slots]);
  const recommendedSlot = sortedSlots[0];

  // =========================
  // AUTO SELECT (SMART UX)
  // =========================
  useEffect(() => {
    if (!selectedSlot && recommendedSlot) {
      onSelect(recommendedSlot);
    }
  }, [recommendedSlot]);

  // =========================
  // HAPTIC FEEDBACK
  // =========================
  function triggerHaptic() {
    // Android real vibration
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(15);
    }

    // 🔥 iOS fallback → nada físico, pero reforzamos visual (ya lo hacemos con animación)
  }

  function handleSelect(slot: string) {
    triggerHaptic();
    onSelect(slot);
  }

  // GROUPING (PRO)
  // =========================
  function getHour(slot: string) {
    return parseInt(slot.split(":")[0], 10);
  }

  const morningSlots = sortedSlots.filter((s) => getHour(s) < 15);
  const afternoonSlots = sortedSlots.filter((s) => getHour(s) >= 15);

  const hasExpandable =
    morningSlots.length > MAX_VISIBLE || afternoonSlots.length > MAX_VISIBLE;

  function renderGroup(title: string, group: string[]) {
    if (group.length === 0) return null;

    const visible = showAll ? group : group.slice(0, 6);

    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-400">{title}</p>

        <div className="grid grid-cols-3 gap-3">
          {visible.map((slot) => {
            const isSelected = selectedSlot === slot;

            return (
              <motion.button
                key={slot}
                onClick={() => handleSelect(slot)}
                whileTap={{ scale: 0.92 }}
                animate={{
                  scale: isSelected ? 1.05 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={`
                  py-3 rounded-xl border font-medium transition

                  ${
                    isSelected
                      ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400"
                      : "bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800"
                  }
                `}
              >
                {formatTimeSlot(slot)}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================
  // EMPTY STATE
  // =========================
  if (slots.length === 0) return null;

  return (
    <div className="mt-6 space-y-5">
      <h2 className="text-lg font-semibold">Horarios disponibles</h2>

      {recommendedSlot && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-700/40 relative">
          <p className="text-xs text-emerald-300 uppercase tracking-[0.18em] mb-2">
            Recomendado
          </p>

          <motion.button
            onClick={() => handleSelect(recommendedSlot)}
            whileTap={{ scale: 0.95 }}
            animate={{
              scale: selectedSlot === recommendedSlot ? 1.05 : 1,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            className={`
              w-full py-3 rounded-xl font-semibold transition

              ${
                selectedSlot === recommendedSlot
                  ? "bg-blue-600 text-white shadow-lg ring-2 ring-blue-400"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white"
              }
            `}
          >
            {formatTimeSlot(recommendedSlot)}
          </motion.button>

          {selectedSlot === recommendedSlot && (
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow">
              ✓
            </div>
          )}
        </div>
      )}

      {renderGroup("Mañana", morningSlots)}
      {renderGroup("Tarde", afternoonSlots)}

      {hasExpandable && (
        <div className="text-center">
          <button
            onClick={() => setShowAll((p) => !p)}
            className="text-blue-400 text-sm hover:text-blue-300 transition"
          >
            {showAll ? "Ver menos" : "Ver más horarios"}
          </button>
        </div>
      )}
    </div>
  );
}
