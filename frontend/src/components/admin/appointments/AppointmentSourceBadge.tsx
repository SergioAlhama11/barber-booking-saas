import type { AppointmentSource } from "@/services/admin/appointments/types";

type Props = {
  source: AppointmentSource;
};

const CONFIG = {
  ONLINE: {
    label: "🌐 Online",
    className: "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  },
  MANUAL: {
    label: "✍️ Manual",
    className: "border-violet-500/20 bg-violet-500/10 text-violet-300",
  },
  IMPORTED: {
    label: "📥 Importada",
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  },
} as const;

export function AppointmentSourceBadge({ source }: Props) {
  const badge = CONFIG[source];

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        px-2.5
        py-1
        text-[11px]
        font-semibold
        whitespace-nowrap
        ${badge.className}
      `}
    >
      {badge.label}
    </span>
  );
}
