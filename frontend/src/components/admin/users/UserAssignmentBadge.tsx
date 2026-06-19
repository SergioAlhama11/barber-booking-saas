import type { AdminUser } from "@/services/admin/users/types";

type Props = {
  user: AdminUser;
};

function getAssignment(user: AdminUser) {
  if (user.role === "SUPER_ADMIN") {
    return "Global";
  }

  if (user.role === "OWNER") {
    return user.barbershopId ? `Barbería #${user.barbershopId}` : "Sin asignar";
  }

  if (user.role === "BARBER") {
    return user.barberId ? `Barbero #${user.barberId}` : "Sin asignar";
  }

  return "-";
}

export default function UserAssignmentBadge({ user }: Props) {
  return (
    <span
      className="
        rounded-full
        border
        border-white/10
        bg-white/[0.04]
        px-3
        py-1
        text-xs
        text-slate-300
      "
    >
      {getAssignment(user)}
    </span>
  );
}
