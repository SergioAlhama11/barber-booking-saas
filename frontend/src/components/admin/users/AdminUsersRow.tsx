"use client";

import type { AdminUser } from "@/services/admin/users/types";

import UserRoleBadge from "./UserRoleBadge";
import UserAssignmentBadge from "./UserAssignmentBadge";

type Props = {
  user: AdminUser;
};

const USERS_GRID = "lg:grid-cols-[minmax(420px,2.5fr)_180px_220px_180px]";

export default function AdminUsersRow({ user }: Props) {
  return (
    <article
      className="
        px-5
        py-5
        transition
        hover:bg-white/[0.02]
      "
    >
      {/* MOBILE */}

      <div className="space-y-4 lg:hidden">
        <div>
          <p className="break-all font-medium text-white">{user.email}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <UserRoleBadge role={user.role} />

          <UserAssignmentBadge user={user} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            className="
              rounded-xl
              border
              border-white/10
              py-2
              text-sm
              text-white
            "
          >
            Editar
          </button>

          <button
            className="
              rounded-xl
              border
              border-red-500/20
              py-2
              text-sm
              text-red-300
            "
          >
            Eliminar
          </button>
        </div>
      </div>

      {/* DESKTOP */}

      <div
        className={`
          hidden
          lg:grid
          ${USERS_GRID}
          lg:items-center
        `}
      >
        <p className="break-all text-white">{user.email}</p>

        <div>
          <UserRoleBadge role={user.role} />
        </div>

        <UserAssignmentBadge user={user} />

        <div className="flex items-center gap-2">
          <button
            className="
              rounded-xl
              border
              border-white/10
              px-3
              py-2
              text-xs
              text-white
              transition
              hover:bg-white/[0.05]
            "
          >
            Editar
          </button>

          <button
            className="
              rounded-xl
              border
              border-red-500/20
              px-3
              py-2
              text-xs
              text-red-300
              transition
              hover:bg-red-500/10
            "
          >
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}
