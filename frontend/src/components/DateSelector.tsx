"use client";

export default function DateSelector({
  date,
  minDate,
  onChange,
  onCheck,
  disabled,
}: {
  date: string;
  minDate: string;
  onChange: (value: string) => void;
  onCheck: () => void;
  disabled: boolean;
}) {
  return (
    <>
      <h2 className="text-xl font-semibold mt-6 mb-2">
        Seleccione la fecha de reserva:
      </h2>

      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          min={minDate}
          onChange={(e) => onChange(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          onClick={onCheck}
          disabled={disabled}
          className={`px-4 py-2 rounded ${
            disabled ? "bg-gray-300 text-gray-500" : "bg-blue-500 text-white"
          }`}
        >
          Comprobar disponibilidad
        </button>
      </div>
    </>
  );
}
