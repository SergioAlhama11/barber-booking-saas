"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminBarbers } from "@/services/admin/barbers/api";
import { getAdminBarbershops } from "@/services/admin/barbershops/api";

import { useCreateAdminUser } from "@/hooks/admin/useCreateAdminUser";
import { useCreateUserForm } from "@/hooks/admin/useCreateUserForm";

import { AdminBarbershop } from "@/services/admin/barbershops/types";
import { AdminBarber } from "@/services/admin/barbers/types";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CreateUserModal({ open, onClose }: Props) {
  const { form, errors, validate, updateField, reset } = useCreateUserForm();

  const createUserMutation = useCreateAdminUser();

  const barbershopsQuery = useQuery<AdminBarbershop[]>({
    queryKey: ["admin-barbershops"],
    queryFn: getAdminBarbershops,
    enabled: open,
  });

  const barbersQuery = useQuery<AdminBarber[]>({
    queryKey: ["admin-barbers"],
    queryFn: () => getAdminBarbers(),
    enabled: open,
  });

  const barbers =
    form.barbershopId === ""
      ? []
      : (barbersQuery.data ?? []).filter(
          (barber) => barber.barbershopId === form.barbershopId,
        );

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit() {
    if (!validate()) {
      return;
    }

    createUserMutation.mutate(
      {
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        barbershopId: form.barbershopId === "" ? undefined : form.barbershopId,
        barberId: form.barberId === "" ? undefined : form.barberId,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#0b1120] p-6 shadow-2xl">
        {/* HEADER */}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-300/80">
              NUEVO USUARIO
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-white">
              Crear usuario interno
            </h2>
          </div>

          <button
            onClick={handleClose}
            disabled={createUserMutation.isPending}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10"
          >
            ✕
          </button>
        </div>

        {/* FORM */}

        <div className="mt-6 space-y-4">
          <input
            type="email"
            value={form.email}
            placeholder="Email"
            onChange={(e) => updateField("email", e.target.value)}
          />

          {errors.email && (
            <p className="text-sm text-red-400">{errors.email}</p>
          )}

          <input
            type="password"
            value={form.password}
            placeholder="Contraseña"
            onChange={(e) => updateField("password", e.target.value)}
          />

          {errors.password && (
            <p className="text-sm text-red-400">{errors.password}</p>
          )}

          <select
            value={form.role}
            onChange={(e) => updateField("role", e.target.value as any)}
          >
            <option value="SUPER_ADMIN">Super Admin</option>

            <option value="OWNER">Propietario</option>

            <option value="BARBER">Barbero</option>
          </select>

          {form.role !== "SUPER_ADMIN" && (
            <select
              value={form.barbershopId}
              onChange={(e) =>
                updateField(
                  "barbershopId",
                  e.target.value ? Number(e.target.value) : "",
                )
              }
            >
              <option value="">Selecciona barbería</option>

              {barbershopsQuery.data?.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          )}

          {form.role === "BARBER" && (
            <select
              value={form.barberId}
              onChange={(e) =>
                updateField(
                  "barberId",
                  e.target.value ? Number(e.target.value) : "",
                )
              }
            >
              <option value="">Selecciona barbero</option>

              {barbers.map((barber) => (
                <option key={barber.id} value={barber.id}>
                  {barber.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* ERROR API */}

        {createUserMutation.error instanceof Error && (
          <div className="mt-4 rounded-xl bg-red-500/10 p-4 text-red-300">
            {createUserMutation.error.message}
          </div>
        )}

        {/* ACTIONS */}

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={handleClose} disabled={createUserMutation.isPending}>
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            disabled={createUserMutation.isPending}
          >
            {createUserMutation.isPending ? "Creando..." : "Crear usuario"}
          </button>
        </div>
      </div>
    </div>
  );
}
