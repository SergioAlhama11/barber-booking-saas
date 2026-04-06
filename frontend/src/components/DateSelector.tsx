"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

type Props = {
  date: string;
  minDate: string;
  onChange: (date: string) => void;
  onCheck: () => void;
  disabled?: boolean; // 🔥 AÑADIDO
};

export default function DateSelector({
  date,
  minDate,
  onChange,
  onCheck,
  disabled = false,
}: Props) {
  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-lg font-semibold">Selecciona la fecha</h2>

      <div className="bg-gray-900 p-4 rounded-xl">
        <DayPicker
          mode="single"
          selected={new Date(date)}
          onSelect={(d) => {
            if (!d) return;
            onChange(d.toISOString().split("T")[0]);
          }}
          disabled={{ before: new Date(minDate) }}
        />
      </div>

      <button
        onClick={onCheck}
        disabled={disabled}
        className={`
          w-full py-3 rounded-xl font-medium transition
          ${
            disabled
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }
        `}
      >
        Ver disponibilidad
      </button>
    </div>
  );
}
