"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";

import { formatTimeSlot } from "@/services/dateService";

type Props = {
  slots: string[];
  selectedSlot: string | null;
  onSelect: (slot: string) => void;
  compact?: boolean;
};

const MAX_VISIBLE = 6;

export default function SlotSelector({
  slots,
  selectedSlot,
  onSelect,
  compact = false,
}: Props) {
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
  }, [onSelect, recommendedSlot, selectedSlot]);

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

        <div className="grid grid-cols-3 gap-3 lg:grid-cols-4 xl:grid-cols-5">
          {visible.map((slot) => {
            const isSelected = selectedSlot === slot;

            return (
              <motion.button
                key={slot}
                onClick={() => handleSelect(slot)}
                whileTap={{ scale: 0.92 }}
                animate={{
                  scale: isSelected ? 1.02 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={`
                  rounded-xl border px-3 py-3 font-medium transition

                  ${
                    isSelected
                      ? "border-blue-400 bg-blue-600 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-300"
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
    <div className={compact ? "space-y-4" : "mt-5 space-y-4 lg:space-y-5"}>
      <div className="space-y-1">
        <h2 className="text-[1.9rem] font-semibold tracking-tight text-white lg:text-[2.1rem]">
          Horarios disponibles
        </h2>
        <p className="text-sm text-gray-500">
          Hemos destacado el primer hueco libre para que te resulte más rápido.
        </p>
      </div>

      {recommendedSlot && (
        <div className="rounded-[24px] border border-emerald-500/20 bg-emerald-500/10 p-4 lg:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-200">
                Recomendado
              </p>
              <p className="mt-1 text-sm text-emerald-50/80">
                Primer hueco libre para ir más rápido.
              </p>
            </div>

            <motion.button
              onClick={() => handleSelect(recommendedSlot)}
              whileTap={{ scale: 0.98 }}
              animate={{
                scale: selectedSlot === recommendedSlot ? 1.01 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
              className={`
                inline-flex min-h-11 items-center justify-center rounded-2xl border px-5 py-2.5 font-semibold transition lg:min-w-[168px]

                ${
                  selectedSlot === recommendedSlot
                    ? "border-emerald-300 bg-emerald-400/10 text-emerald-100"
                    : "border-emerald-400/40 bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                }
              `}
            >
              <span className="inline-flex items-center gap-2">
                {selectedSlot === recommendedSlot ? "Seleccionado" : "Elegir"}
                <span>{formatTimeSlot(recommendedSlot)}</span>
              </span>
            </motion.button>
          </div>
        </div>
      )}

      {renderGroup("Mañana", morningSlots)}
      {renderGroup("Tarde", afternoonSlots)}

      {hasExpandable && (
        <div className="text-center">
          <button
            onClick={() => setShowAll((p) => !p)}
            className="rounded-full border border-white/8 px-4 py-2 text-sm text-blue-300 transition hover:bg-white/[0.04] hover:text-blue-200"
          >
            {showAll ? "Ver menos" : "Ver más horarios"}
          </button>
        </div>
      )}
    </div>
  );
}
