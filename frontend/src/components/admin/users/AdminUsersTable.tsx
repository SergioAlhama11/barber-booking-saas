"use client";

import { useAdminUsers } from "@/hooks/admin/useAdminUsers";

import AdminUsersRow from "./AdminUsersRow";

const USERS_GRID = "lg:grid-cols-[minmax(420px,2.5fr)_180px_220px_180px]";

export default function AdminUsersTable() {
  const { search, setSearch, users, isLoading } = useAdminUsers();

  return (
    <section
      className="
        overflow-hidden
        rounded-[2rem]
        border
        border-white/10
        bg-white/[0.03]
        backdrop-blur-xl
      "
    >
      <div className="border-b border-white/10 p-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por email..."
          className="
            h-12
            w-full
            rounded-2xl
            border
            border-white/10
            bg-white/[0.04]
            px-4
            text-white
            outline-none
            transition
            placeholder:text-slate-500
            focus:border-cyan-400/50
          "
        />
      </div>

      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <h2 className="font-semibold text-white">
            Usuarios ({users.length})
          </h2>

          <p className="text-sm text-slate-400">Gestión de cuentas internas</p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-6 text-slate-400">Cargando usuarios...</div>
      ) : users.length === 0 ? (
        <div className="p-10 text-center text-slate-400">
          No se encontraron usuarios.
        </div>
      ) : (
        <>
          <div
            className={`
              hidden
              lg:grid
              lg:items-center
              ${USERS_GRID}
              border-b
              border-white/10
              px-6
              py-3
              text-xs
              uppercase
              tracking-[0.18em]
              text-slate-500
            `}
          >
            <span>Email</span>
            <span>Rol</span>
            <span>Asignación</span>
            <span>Acciones</span>
          </div>

          <div className="divide-y divide-white/10">
            {users.map((user) => (
              <AdminUsersRow key={user.id} user={user} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
