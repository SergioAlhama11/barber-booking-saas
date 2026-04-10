"use client";

import { formatTimeSlot } from "@/services/dateService";

export default function BookingForm({
  selectedSlot,
  customerName,
  customerEmail,
  onNameChange,
  onEmailChange,
  onSubmit,
  loading,
  error,
}: {
  selectedSlot: string;
  customerName: string;
  customerEmail: string;
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error?: string | null;
}) {
  return (
    <div className="mt-6 space-y-4">
      <p className="font-semibold">
        Hora seleccionada: {formatTimeSlot(selectedSlot)}
      </p>

      <h2 className="text-xl font-semibold">Introduzca sus datos:</h2>

      <input
        type="text"
        placeholder="Nombre"
        value={customerName}
        onChange={(e) => onNameChange(e.target.value)}
        className="border p-3 rounded w-full"
      />

      <input
        type="email"
        placeholder="Email"
        value={customerEmail}
        onChange={(e) => onEmailChange(e.target.value)}
        className="border p-3 rounded w-full"
      />

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button
        type="button" // 🔥 CLAVE
        onClick={onSubmit}
        disabled={loading}
        className={`w-full py-3 rounded font-semibold transition ${
          loading
            ? "bg-gray-400 text-white"
            : "bg-green-500 hover:bg-green-600 text-white"
        }`}
      >
        {loading ? "Realizando la reserva..." : "Reservar"}
      </button>
    </div>
  );
}
