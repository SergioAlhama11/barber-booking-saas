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
  compact?: boolean;
};

export default function DateSelector({
  date,
  minDate,
  onChange,
  onCheck,
  disabled = false,
  compact = false,
}: Props) {
  return (
    <div className={compact ? "w-full space-y-3" : "mt-5 w-full space-y-3 lg:space-y-4"}>
      <div className="space-y-1">
        <h2 className="text-[1.9rem] font-semibold tracking-tight text-white lg:text-[2.1rem]">
          Selecciona la fecha
        </h2>
        <p className="text-sm text-gray-500">
          Elige un nuevo día para consultar la disponibilidad.
        </p>
      </div>

      <div className={`w-full rounded-[30px] border border-white/8 bg-[#121826] p-4 text-white shadow-[0_10px_40px_rgba(0,0,0,0.25)] ${compact ? "" : "lg:max-w-[720px]"} lg:p-5`}>
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

      <p className="text-sm text-gray-500">
        {disabled
          ? "Selecciona un barbero para ver disponibilidad"
          : "La disponibilidad se actualiza al cambiar de día"}
      </p>
    </div>
  );
}
