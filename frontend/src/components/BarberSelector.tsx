"use client";

import { useEffect, useState } from "react";
import { Barber } from "@/types";
import { getAvailability } from "@/services/api";
import { getTodayLocal } from "@/services/dateService";

type Props = {
  barbers: Barber[];
  selectedBarber: Barber | null;
  selectedServiceId: number | null;
  slug: string;
  date: string;
  onSelect: (barber: Barber) => void;
};

export default function BarberSelector({
  barbers,
  selectedBarber,
  selectedServiceId,
  slug,
  date,
  onSelect,
}: Props) {
  const [availability, setAvailability] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedServiceId || barbers.length === 0) return;

    let cancelled = false;

    async function load() {
      setLoading(true);

      const results: Record<number, number> = {};

      try {
        if (!selectedServiceId) return;

        await Promise.all(
          barbers.map(async (barber) => {
            const res = await getAvailability(
              slug,
              barber.id,
              selectedServiceId,
              date,
            );

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

  function getLabel(count?: number) {
    if (count === undefined) return "Consultando...";
    if (count === 0) return "Sin huecos";
    if (count <= 3) return "Pocas citas";
    return "Disponible";
  }

  function getColor(count?: number) {
    if (count === undefined) return "text-gray-500";
    if (count === 0) return "text-red-400";
    if (count <= 3) return "text-yellow-400";
    return "text-green-400";
  }

  return (
    <div className="space-y-4 mt-6">
      <h2 className="text-lg font-semibold">¿Con quién quieres reservar?</h2>

      <div className="space-y-3">
        {barbers.map((barber) => {
          const isSelected = selectedBarber?.id === barber.id;
          const count = availability[barber.id];

          return (
            <button
              key={barber.id}
              onClick={() => onSelect(barber)}
              className={`
                w-full p-4 rounded-2xl flex items-center gap-3 transition-all border
                ${
                  isSelected
                    ? "bg-blue-600/20 border-blue-500 ring-2 ring-blue-500 scale-[1.02]"
                    : "bg-gray-900 border-gray-700 hover:bg-gray-800"
                }
              `}
            >
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                {barber.name.charAt(0)}
              </div>

              <div className="text-left flex-1">
                <p className="font-medium">{barber.name}</p>

                <p className={`text-xs ${getColor(count)}`}>
                  {loading ? "Consultando..." : getLabel(count)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
