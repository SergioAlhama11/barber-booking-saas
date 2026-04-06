"use client";

import { Service } from "@/types";

export default function ServiceSelector({
  services,
  selectedService,
  onSelect,
}: {
  services: Service[] | null | undefined;
  selectedService: Service | null;
  onSelect: (service: Service) => void;
}) {
  // 🔴 loading / null safety
  if (!services) {
    return <p className="text-gray-500">Cargando servicios...</p>;
  }

  // 🔴 empty state
  if (services.length === 0) {
    return <p className="text-gray-500">No hay servicios disponibles</p>;
  }

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
            className={`w-full border p-3 rounded text-left transition ${
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
