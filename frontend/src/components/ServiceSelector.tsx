"use client";

import { Service } from "@/types";
import { useState } from "react";

type Props = {
  services: Service[];
  selectedService: Service | null;
  onSelect: (service: Service) => void;
};

export default function ServiceSelector({
  services,
  selectedService,
  onSelect,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  const visibleServices = expanded ? services : services.slice(0, 4);

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold lg:text-2xl">
        ¿Qué quieres hacerte?
      </h2>

      <div className="grid gap-3 md:grid-cols-2">
        {visibleServices.map((service) => {
          const isSelected = selectedService?.id === service.id;

          return (
            <button
              key={service.id}
              onClick={() => onSelect(service)}
              className={`w-full rounded-2xl border p-4 text-left transition-all
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-600/15 shadow-[0_0_0_1px_rgba(59,130,246,0.4)]"
                    : "bg-gray-900 border-gray-700 hover:bg-gray-800"
                }
              `}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-xs text-gray-400">
                    {service.durationMinutes} min
                  </p>
                </div>

                <p className="font-semibold text-blue-400">{service.price}€</p>
              </div>
            </button>
          );
        })}
      </div>

      {services.length > 4 && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
          >
            {expanded
              ? "Mostrar menos"
              : `Ver ${services.length - 4} servicios más`}
          </button>
        </div>
      )}
    </div>
  );
}
