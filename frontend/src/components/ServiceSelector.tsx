"use client";

import { Service } from "@/types";

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
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">¿Qué quieres hacerte?</h2>

      <div className="space-y-3">
        {services.map((service) => {
          const isSelected = selectedService?.id === service.id;

          return (
            <button
              key={service.id}
              onClick={() => onSelect(service)}
              className={`
                w-full p-4 rounded-2xl text-left transition-all border

                ${
                  isSelected
                    ? "bg-blue-600/20 border-blue-500 ring-2 ring-blue-500 scale-[1.02]"
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
    </div>
  );
}
