"use client";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { es } from "date-fns/locale";
import { formatLocalDate } from "@/services/dateService";

type Props = {
  date: string;
  minDate: string;
  onChange: (date: string) => void;
  onCheck: (date: string) => void;
  disabled?: boolean;
};

export default function DateSelector({
  date,
  minDate,
  onChange,
  onCheck,
  disabled = false,
}: Props) {
  return (
    <div className="mt-6 space-y-4 w-full">
      <h2 className="text-lg font-semibold">Selecciona la fecha</h2>

      <div className="bg-gray-900/70 border border-gray-800 text-white rounded-3xl p-4 shadow-lg w-full">
        <DayPicker
          mode="single"
          locale={es}
          weekStartsOn={1}
          selected={new Date(date)}
          onSelect={(d) => {
            if (!d) return;

            const formatted = formatLocalDate(d);

            onChange(formatted);
            onCheck(formatted);
          }}
          disabled={{ before: new Date(minDate) }}
        />
      </div>

      <p className="text-xs text-gray-500">
        {disabled
          ? "Selecciona un barbero para ver disponibilidad"
          : "La disponibilidad se actualiza al cambiar de día"}
      </p>
    </div>
  );
}
