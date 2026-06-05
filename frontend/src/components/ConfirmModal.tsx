"use client";

import { useEffect } from "react";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    if (open) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* OVERLAY */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0f172a] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)] animate-fadeIn"
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-500 transition hover:text-white"
        >
          ✕
        </button>

        {/* CONTENT */}
        <div className="space-y-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-red-300/70">
              Confirmación
            </p>

            <h2 className="mt-3 text-2xl font-bold text-white">{title}</h2>

            {description && (
              <p className="mt-3 text-sm leading-7 text-slate-400">
                {description}
              </p>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06]"
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                danger
                  ? "bg-red-500/90 text-white hover:bg-red-500"
                  : "bg-cyan-300 text-slate-950 hover:bg-cyan-200"
              }`}
            >
              {loading ? "Procesando..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
