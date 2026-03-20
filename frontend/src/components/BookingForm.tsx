"use client";

export default function BookingForm({
  selectedSlot,
  customerName,
  customerEmail,
  onNameChange,
  onEmailChange,
  onSubmit,
  loading,
}: {
  selectedSlot: string;
  customerName: string;
  customerEmail: string;
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
}) {
  return (
    <div className="mt-6">
      <p className="font-semibold mb-4">
        Hora seleccionada: {selectedSlot.slice(0, 5)}
      </p>

      <h2 className="text-xl font-semibold mb-2">Introduzca sus datos:</h2>

      <input
        type="text"
        placeholder="Nombre"
        value={customerName}
        onChange={(e) => onNameChange(e.target.value)}
        className="border p-2 rounded block mb-2 w-full"
      />

      <input
        type="email"
        placeholder="Email"
        value={customerEmail}
        onChange={(e) => onEmailChange(e.target.value)}
        className="border p-2 rounded block mb-2 w-full"
      />

      <button
        onClick={onSubmit}
        disabled={loading}
        className={`mt-4 px-4 py-2 rounded w-full ${
          loading ? "bg-gray-400 text-white" : "bg-green-500 text-white"
        }`}
      >
        {loading ? "Realizando la reserva..." : "Reservar"}
      </button>
    </div>
  );
}
