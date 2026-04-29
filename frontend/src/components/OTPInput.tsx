"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, ClipboardEvent, KeyboardEvent } from "react";

type Props = {
  length?: number;
  onComplete: (code: string) => void;
};

export default function OtpInput({ length = 6, onComplete }: Props) {
  const [values, setValues] = useState(Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  function handleChange(i: number, val: string) {
    if (!/^[0-9]?$/.test(val)) return;

    const newValues = [...values];
    newValues[i] = val;
    setValues(newValues);

    if (val && i < length - 1) {
      inputsRef.current[i + 1]?.focus();
    }

    if (newValues.every((v) => v !== "")) {
      onComplete(newValues.join(""));
    }
  }

  function handleKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !values[i] && i > 0) {
      inputsRef.current[i - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLDivElement>) {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");

    if (!paste) return;

    const newValues = paste.slice(0, length).split("");
    while (newValues.length < length) newValues.push("");

    setValues(newValues);

    if (!newValues.includes("")) {
      onComplete(newValues.join(""));
    }
  }

  return (
    <div className="flex justify-center gap-2" onPaste={handlePaste}>
      {values.map((v, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          value={v}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleChange(i, e.target.value)
          }
          onKeyDown={(e) => handleKeyDown(i, e)}
          maxLength={1}
          inputMode="numeric"
          className="w-12 h-14 text-center text-xl font-semibold rounded-xl bg-gray-900 border border-gray-700 focus:border-blue-500 outline-none transition"
        />
      ))}
    </div>
  );
}
