"use client";

import { useEffect, useState } from "react";
import { Barber } from "@/types";
import { getAvailability } from "@/services/api";

type Props = {
  barbers: Barber[];
  selectedBarber: Barber | null;
  selectedServiceId: number | null;
  slug: string;
  date: string;
  onSelect: (barber: Barber) => void;
  compact?: boolean;
};

export default function BarberSelector({
  barbers,
  selectedBarber,
  selectedServiceId,
  slug,
  date,
  onSelect,
  compact = false,
}: Props) {
  const [availability, setAvailability] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedServiceId || barbers.length === 0) return;

    const serviceId = selectedServiceId;
    let cancelled = false;

    async function load() {
      setLoading(true);

      const results: Record<number, number> = {};

      try {
        await Promise.all(
          barbers.map(async (barber) => {
            const res = await getAvailability(slug, barber.id, serviceId, date);

            results[barber.id] = res.data?.slots?.length ?? 0;
          }),
        );

        if (!cancelled) {
          setAvailability(results);
        }
      } catch (e) {
        console.error("Error loading barber availability", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [barbers, selectedServiceId, slug, date]);

  // =========================
  // UX LABELS (CLAVE)
  // =========================

  function getLabel(count?: number) {
    if (count === undefined) return "Consultando...";
    if (count === 0) return "Sin huecos hoy";
    if (count <= 3) return "Pocas citas hoy";
    return "Disponible hoy";
  }

  function getColor(count?: number) {
    if (count === undefined) return "text-gray-500";
    if (count === 0) return "text-red-400";
    if (count <= 3) return "text-yellow-400";
    return "text-green-400";
  }

  function getDotColor(count?: number) {
    if (count === undefined) return "bg-gray-500";
    if (count === 0) return "bg-red-500";
    if (count <= 3) return "bg-yellow-500";
    return "bg-green-500";
  }

  return (
    <div className={compact ? "space-y-3" : "mt-5 space-y-3"}>
      <h2 className="text-lg font-semibold lg:text-2xl">
        ¿Con quién quieres reservar?
      </h2>

      <div className="grid gap-3 md:grid-cols-2">
        {barbers.map((barber) => {
          const isSelected = selectedBarber?.id === barber.id;
          const count = availability[barber.id];

          return (
            <button
              key={barber.id}
              onClick={() => onSelect(barber)}
              className={`
                flex w-full items-center gap-3 rounded-2xl border p-4 transition-all
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-600/15 shadow-[0_0_0_1px_rgba(59,130,246,0.4)]"
                    : "bg-gray-900 border-gray-700 hover:bg-gray-800"
                }
              `}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                {barber.name.charAt(0)}
              </div>

              {/* Info */}
              <div className="text-left flex-1">
                <p className="font-medium">{barber.name}</p>

                <div className="flex items-center gap-2 mt-1">
                  {/* Dot estado */}
                  <div
                    className={`w-2 h-2 rounded-full ${getDotColor(count)}`}
                  />

                  {/* Texto */}
                  <p className={`text-xs ${getColor(count)}`}>
                    {loading ? "Consultando..." : getLabel(count)}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
