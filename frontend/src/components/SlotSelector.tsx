"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

import { formatTimeSlot } from "@/services/dateService";

type Props = {
  slots: string[];
  selectedSlot: string | null;
  onSelect: (slot: string) => void;
};

export default function SlotSelector({ slots, selectedSlot, onSelect }: Props) {
  const [showAll, setShowAll] = useState(false);
  const selectedRef = useRef<HTMLButtonElement | null>(null);

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

  // =========================
  // SCROLL UX
  // =========================
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedSlot]);

  // =========================
  // GROUPING (PRO)
  // =========================
  function getHour(slot: string) {
    return parseInt(slot.split(":")[0], 10);
  }

  const morningSlots = sortedSlots.filter((s) => getHour(s) < 15);
  const afternoonSlots = sortedSlots.filter((s) => getHour(s) >= 15);

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
                ref={isSelected ? selectedRef : undefined}
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
    <div className="mt-6 space-y-6">
      <h2 className="text-lg font-semibold">Horarios disponibles</h2>

      {/* =========================
          RECOMENDADO
      ========================= */}
      {recommendedSlot && (
        <div className="p-4 rounded-2xl bg-green-900/20 border border-green-700 relative">
          <p className="text-xs text-green-400 uppercase mb-2">Recomendado</p>

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
                  : "bg-green-600 hover:bg-green-700 text-white"
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

      {/* =========================
          GROUPS
      ========================= */}
      {renderGroup("🌅 Mañana", morningSlots)}
      {renderGroup("🌇 Tarde", afternoonSlots)}

      {/* =========================
          VER MÁS
      ========================= */}
      {slots.length > 6 && (
        <div className="text-center">
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
