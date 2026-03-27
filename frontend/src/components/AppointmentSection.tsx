import AppointmentCard from "./AppointmentCard";

type Props = {
  title: string;
  appointments: any[];
  showCancel?: boolean;
  onResend?: (id: number) => void;
};

export default function AppointmentSection({
  title,
  appointments,
  showCancel,
  onResend,
}: Props) {
  if (!appointments.length) {
    return (
      <div style={{ marginTop: 30 }}>
        <h2>{title}</h2>
        <p>No hay citas</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 30 }}>
      <h2>{title}</h2>

      {appointments.map((a) => (
        <AppointmentCard
          key={a.id}
          appointment={a}
          showCancel={showCancel}
          onResend={onResend}
        />
      ))}
    </div>
  );
}
