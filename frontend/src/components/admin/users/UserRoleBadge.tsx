type Props = {
  role: string;
};

function getRoleLabel(role: string) {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Admin";

    case "OWNER":
      return "Propietario";

    case "BARBER":
      return "Barbero";

    default:
      return role;
  }
}

function getRoleColor(role: string) {
  switch (role) {
    case "SUPER_ADMIN":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-100";

    case "OWNER":
      return "border-violet-400/20 bg-violet-400/10 text-violet-100";

    case "BARBER":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-100";

    default:
      return "border-white/10 bg-white/[0.04] text-white";
  }
}

export default function UserRoleBadge({ role }: Props) {
  return (
    <span
      className={`
        rounded-full
        border
        px-3
        py-1
        text-xs
        font-medium
        ${getRoleColor(role)}
      `}
    >
      {getRoleLabel(role)}
    </span>
  );
}
