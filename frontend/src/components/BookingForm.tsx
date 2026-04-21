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
    <div className="mt-6 space-y-4 rounded-3xl border border-gray-800 bg-gray-950/60 p-5">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.18em] text-gray-500">
          Hora seleccionada
        </p>
        <p className="font-semibold text-lg text-white">
          {formatTimeSlot(selectedSlot)}
        </p>
      </div>

      <h2 className="text-xl font-semibold">Introduce tus datos</h2>

      <input
        type="text"
        placeholder="Nombre"
        value={customerName}
        onChange={(e) => onNameChange(e.target.value)}
        className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
      />

      <input
        type="email"
        placeholder="Email"
        value={customerEmail}
        onChange={(e) => onEmailChange(e.target.value)}
        className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
      />

      <p className="text-xs text-gray-500">
        Te enviaremos la confirmación y el enlace de cancelación al email.
      </p>

      {error && <div className="text-red-400 text-sm">{error}</div>}

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className={`w-full py-3 rounded-2xl font-semibold transition ${
          loading
            ? "bg-gray-700 text-gray-300"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {loading ? "Realizando la reserva..." : "Reservar"}
      </button>
    </div>
  );
}
