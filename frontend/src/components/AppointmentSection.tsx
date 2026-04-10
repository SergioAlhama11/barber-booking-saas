"use client";

import AppointmentCard from "./AppointmentCard";

type SectionProps = {
  title: string;
  appointments: any[];
  showCancel?: boolean;
  onResend?: (id: number) => void;
  onClick?: (appointment: any) => void;
};

export default function AppointmentSection({
  title,
  appointments,
  showCancel,
  onResend,
  onClick,
}: SectionProps) {
  if (!appointments || appointments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>

      {appointments.map((a) => {
        const isCancelled = !!a.cancelledAt;

        return (
          <AppointmentCard
            key={a.id}
            appointment={a}
            showCancel={showCancel}
            onResend={onResend}
            onClick={!isCancelled && onClick ? () => onClick(a) : undefined}
          />
        );
      })}
    </div>
  );
}
