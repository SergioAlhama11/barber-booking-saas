"use client";

import { Service } from "@/types";

export default function ServiceSelector({
  services,
  selectedService,
  onSelect,
}: {
  services: Service[];
  selectedService: Service | null;
  onSelect: (service: Service) => void;
}) {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">
        Seleccione el servicio deseado:
      </h2>

      <div className="space-y-2">
        {services.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className={`w-full border p-3 rounded text-left ${
              selectedService?.id === s.id
                ? "bg-black text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {s.name} ({s.durationMinutes} min)
          </button>
        ))}
      </div>
    </>
  );
}
