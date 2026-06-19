"use client";

import { useState } from "react";

import type { CreateAdminBarbershopRequest } from "@/services/admin/barbershops/types";

type Props = {
  onSubmit: (values: CreateAdminBarbershopRequest) => void;
  isLoading: boolean;
};

export function CreateBarbershopForm({ onSubmit, isLoading }: Props) {
  const [name, setName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    onSubmit({
      name,
      ownerEmail,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 items-end">
      <div>
        <label>Nombre</label>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre"
        />
      </div>

      <div>
        <label>Email propietario</label>

        <input
          value={ownerEmail}
          onChange={(e) => setOwnerEmail(e.target.value)}
          placeholder="Email propietario"
        />
      </div>

      <button disabled={isLoading}>Crear barbería</button>
    </form>
  );
}
