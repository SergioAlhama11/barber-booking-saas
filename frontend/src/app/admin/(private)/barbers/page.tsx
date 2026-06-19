"use client";

import { useState } from "react";

import { useAdminSession } from "@/hooks/useAdminSession";

import { useAdminBarbers } from "@/hooks/admin/barbers/useAdminBarbers";
import { useCreateAdminBarber } from "@/hooks/admin/barbers/useCreateAdminBarber";
import { useUpdateAdminBarber } from "@/hooks/admin/barbers/useUpdateAdminBarber";
import { useDeleteAdminBarber } from "@/hooks/admin/barbers/useDeleteAdminBarber";

import { useAdminBarbershops } from "@/hooks/admin/barbershops/useAdminBarbershops";

export default function AdminBarbersPage() {
  const { me } = useAdminSession();

  const isSuperAdmin = me?.roles.includes("SUPER_ADMIN");

  const [name, setName] = useState("");
  const [barbershopId, setBarbershopId] = useState<number | "">("");

  const { data: barbershops = [] } = useAdminBarbershops();

  const { data: barbers = [], isLoading } = useAdminBarbers(
    typeof barbershopId === "number" ? barbershopId : undefined,
  );

  const createMutation = useCreateAdminBarber();
  const updateMutation = useUpdateAdminBarber();
  const deleteMutation = useDeleteAdminBarber();

  if (isLoading) {
    return <p>Cargando barberos...</p>;
  }

  return (
    <div className="space-y-8 p-6">
      <section className="rounded border p-4">
        <h2 className="mb-4 text-lg font-semibold">Crear barbero</h2>

        <div className="space-y-3">
          {isSuperAdmin && (
            <select
              value={barbershopId}
              onChange={(e) =>
                setBarbershopId(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full rounded border p-2"
            >
              <option value="">Selecciona barbería</option>

              {barbershops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          )}

          <div className="flex gap-3">
            <input
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded border p-2"
            />

            <button
              disabled={
                createMutation.isPending ||
                (isSuperAdmin && barbershopId === "")
              }
              onClick={() =>
                createMutation.mutate(
                  {
                    name,

                    ...(typeof barbershopId === "number"
                      ? { barbershopId }
                      : {}),
                  },
                  {
                    onSuccess: () => {
                      setName("");
                    },
                  },
                )
              }
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
              Crear
            </button>
          </div>
        </div>
      </section>

      <section className="rounded border p-4">
        <h2 className="mb-4 text-lg font-semibold">Barberos</h2>

        {barbers.length === 0 ? (
          <p className="text-slate-500">No hay barberos para mostrar.</p>
        ) : (
          <div className="space-y-3">
            {barbers.map((barber) => (
              <BarberRow
                key={barber.id}
                name={barber.name}
                barbershopId={barber.barbershopId}
                onUpdate={(newName) =>
                  updateMutation.mutate({
                    id: barber.id,
                    request: {
                      name: newName,
                    },
                  })
                }
                onDelete={() => deleteMutation.mutate(barber.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

type RowProps = {
  name: string;
  barbershopId: number;
  onUpdate: (name: string) => void;
  onDelete: () => void;
};

function BarberRow({ name, barbershopId, onUpdate, onDelete }: RowProps) {
  const [editingName, setEditingName] = useState(name);

  return (
    <div className="flex items-center gap-3 rounded border p-3">
      <div className="flex-1">
        <input
          value={editingName}
          onChange={(e) => setEditingName(e.target.value)}
          className="w-full rounded border p-2"
        />

        <p className="mt-1 text-sm text-slate-500">Barbería #{barbershopId}</p>
      </div>

      <button
        onClick={() => onUpdate(editingName)}
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
  );
}
