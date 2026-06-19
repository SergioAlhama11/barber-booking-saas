"use client";

import { useState } from "react";

import { useAdminBarbershops } from "@/hooks/admin/barbershops/useAdminBarbershops";
import { useAdminServices } from "@/hooks/admin/services/useAdminServices";
import { useCreateAdminService } from "@/hooks/admin/services/useCreateAdminService";
import { useUpdateAdminService } from "@/hooks/admin/services/useUpdateAdminService";
import { useDeleteAdminService } from "@/hooks/admin/services/useDeleteAdminService";

export default function AdminServicesPage() {
  const [selectedBarbershopId, setSelectedBarbershopId] = useState<
    number | undefined
  >();

  const { data: barbershops = [] } = useAdminBarbershops();

  const { services, loading } = useAdminServices(selectedBarbershopId);

  const createMutation = useCreateAdminService();
  const updateMutation = useUpdateAdminService();
  const deleteMutation = useDeleteAdminService();

  const [name, setName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [price, setPrice] = useState(15);

  if (loading) {
    return <p>Cargando servicios...</p>;
  }

  return (
    <div className="space-y-8 p-6">
      <section className="rounded border p-4">
        <h2 className="mb-4 text-lg font-semibold">Seleccionar barbería</h2>

        <select
          value={selectedBarbershopId ?? ""}
          onChange={(e) =>
            setSelectedBarbershopId(
              e.target.value ? Number(e.target.value) : undefined,
            )
          }
          className="w-full rounded border p-2"
        >
          <option value="">Todas las barberías</option>

          {barbershops.map((barbershop) => (
            <option key={barbershop.id} value={barbershop.id}>
              {barbershop.name}
            </option>
          ))}
        </select>
      </section>

      <section className="rounded border p-4">
        <h2 className="mb-4 text-lg font-semibold">Crear servicio</h2>

        <div className="flex flex-col gap-3">
          <input
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded border p-2"
          />

          <input
            type="number"
            placeholder="Duración (min)"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="rounded border p-2"
          />

          <input
            type="number"
            step="0.01"
            placeholder="Precio"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="rounded border p-2"
          />

          <button
            disabled={!selectedBarbershopId}
            onClick={() =>
              createMutation.mutate(
                {
                  name,
                  durationMinutes,
                  price,
                  barbershopId: selectedBarbershopId,
                },
                {
                  onSuccess: () => {
                    setName("");
                    setDurationMinutes(30);
                    setPrice(15);
                  },
                },
              )
            }
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            Crear
          </button>
        </div>
      </section>

      <section className="rounded border p-4">
        <h2 className="mb-4 text-lg font-semibold">Servicios</h2>

        <div className="space-y-3">
          {services.map((service) => (
            <ServiceRow
              key={service.id}
              service={service}
              onUpdate={(request) =>
                updateMutation.mutate({
                  id: service.id,
                  request,
                })
              }
              onDelete={() => deleteMutation.mutate(service.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

type ServiceRowProps = {
  service: {
    id: number;
    name: string;
    durationMinutes: number;
    price: number;
  };
  onUpdate: (request: {
    name: string;
    durationMinutes: number;
    price: number;
  }) => void;
  onDelete: () => void;
};

function ServiceRow({ service, onUpdate, onDelete }: ServiceRowProps) {
  const [name, setName] = useState(service.name);
  const [durationMinutes, setDurationMinutes] = useState(
    service.durationMinutes,
  );
  const [price, setPrice] = useState(service.price);

  return (
    <div className="rounded border p-3">
      <div className="flex flex-col gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded border p-2"
        />

        <input
          type="number"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(Number(e.target.value))}
          className="rounded border p-2"
        />

        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="rounded border p-2"
        />

        <div className="flex gap-2">
          <button
            onClick={() =>
              onUpdate({
                name,
                durationMinutes,
                price,
              })
            }
            className="rounded bg-green-600 px-3 py-2 text-white"
          >
            Guardar
          </button>

          <button
            onClick={onDelete}
            className="rounded bg-red-600 px-3 py-2 text-white"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
