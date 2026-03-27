type Props = {
  appointment: any;
  showCancel?: boolean;
  onResend?: (id: number) => void;
};

export default function AppointmentCard({
  appointment,
  showCancel,
  onResend,
}: Props) {
  const date = new Date(appointment.startTime);

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "10px",
        opacity: appointment.cancelledAt ? 0.5 : 1,
      }}
    >
      <p>
        <strong>Fecha:</strong> {date.toLocaleString()}
      </p>

      <p>
        <strong>Servicio:</strong> {appointment.serviceName}
      </p>

      <p>
        <strong>Barbero:</strong> {appointment.barberName}
      </p>

      <p>
        <strong>Estado:</strong>{" "}
        {appointment.cancelledAt ? "Cancelada ❌" : "Activa"}
      </p>

      {showCancel && (
        <button onClick={() => onResend?.(appointment.id)}>
          Reenviar enlace de cancelación
        </button>
      )}
    </div>
  );
}
