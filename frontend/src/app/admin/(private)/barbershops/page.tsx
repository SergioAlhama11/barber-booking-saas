"use client";

import { useState } from "react";

import { useAdminBarbershops } from "@/hooks/admin/barbershops/useAdminBarbershops";
import { useCreateAdminBarbershop } from "@/hooks/admin/barbershops/useCreateAdminBarbershop";
import { useUpdateAdminBarbershop } from "@/hooks/admin/barbershops/useUpdateAdminBarbershop";
import { useDeleteAdminBarbershop } from "@/hooks/admin/barbershops/useDeleteAdminBarbershop";

export default function AdminBarbershopsPage() {
  const { data: barbershops = [], isLoading } = useAdminBarbershops();

  const createMutation = useCreateAdminBarbershop();
  const updateMutation = useUpdateAdminBarbershop();
  const deleteMutation = useDeleteAdminBarbershop();

  const [name, setName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");

  if (isLoading) {
    return <p>Cargando barberías...</p>;
  }

  return (
    <div className="space-y-8 p-6">
      <section className="rounded border p-4">
        <h2 className="mb-4 text-lg font-semibold">Crear barbería</h2>

        <div className="flex flex-col gap-3">
          <input
            placeholder="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded border p-2"
          />

          <input
            placeholder="Owner email"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            className="rounded border p-2"
          />

          <button
            onClick={() =>
              createMutation.mutate(
                {
                  name,
                  ownerEmail,
                },
                {
                  onSuccess: () => {
                    setName("");
                    setOwnerEmail("");
                  },
                },
              )
            }
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Crear
          </button>
        </div>
      </section>

      <section className="rounded border p-4">
        <h2 className="mb-4 text-lg font-semibold">Barberías</h2>

        <div className="space-y-3">
          {barbershops.map((barbershop) => (
            <BarbershopRow
              key={barbershop.id}
              id={barbershop.id}
              name={barbershop.name}
              slug={barbershop.slug}
              onUpdate={(newName) =>
                updateMutation.mutate({
                  id: barbershop.id,
                  request: {
                    name: newName,
                  },
                })
              }
              onDelete={() => deleteMutation.mutate(barbershop.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

type RowProps = {
  id: number;
  name: string;
  slug: string;
  onUpdate: (name: string) => void;
  onDelete: () => void;
};

function BarbershopRow({ name, slug, onUpdate, onDelete }: RowProps) {
  const [editingName, setEditingName] = useState(name);

  return (
    <div className="flex items-center gap-3 rounded border p-3">
      <div className="flex-1">
        <input
          value={editingName}
          onChange={(e) => setEditingName(e.target.value)}
          className="w-full rounded border p-2"
        />

        <p className="mt-1 text-sm text-slate-500">{slug}</p>
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
