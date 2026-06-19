"use client";

import { useEffect } from "react";

import type { ReactNode } from "react";

type Props = {
  open: boolean;

  title: string;

  onClose: () => void;

  children: ReactNode;

  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "5xl";

  danger?: boolean;
};

const widths: Record<NonNullable<Props["maxWidth"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "5xl": "max-w-5xl",
};

export function AdminModal({
  open,
  title,
  onClose,
  children,
  maxWidth = "xl",
  danger = false,
}: Props) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4">
      <div
        onClick={(event) => event.stopPropagation()}
        className={`
            mx-auto
            my-8
            flex
            max-h-[90vh]
            w-full
            ${widths[maxWidth]}
            flex-col
            overflow-hidden
            rounded-3xl
            bg-slate-900
            ${danger ? "border border-red-500/20" : "border border-white/10"}
        `}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-900 px-6 py-4">
          <h2 className="text-xl font-semibold text-white">{title}</h2>

          <button
            onClick={onClose}
            className="text-slate-400 transition hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
