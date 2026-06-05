"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import OtpInput from "@/components/OTPInput";
import { useAuth } from "@/hooks/useAuth";

type AuthModalProps = {
  open: boolean;
  onSuccess: () => void;
  onClose?: () => void;
};

export default function AuthModal({
  open,
  onSuccess,
  onClose,
}: AuthModalProps) {
  const { slug } = useParams() as { slug: string };
  const auth = useAuth(slug);
  const { email, error, loading, reset, sendOtp, setEmail, step, verify } =
    auth;
  const [timer, setTimer] = useState(30);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClose = useCallback(() => {
    reset();
    setTimer(30);
    onClose?.();
  }, [onClose, reset]);

  useEffect(() => {
    if (step !== "otp") return;

    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  // ⌨️ cerrar con ESC
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }

    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleClose, open]);

  // 🎯 autofocus email
  useEffect(() => {
    if (open && step === "email") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, step]);

  async function handleSendOtp() {
    setTimer(30);
    await sendOtp();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* modal */}
      <div
        className="relative z-10 w-[90%] max-w-md bg-gray-950 border border-gray-800 rounded-3xl p-6 space-y-5 text-center animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ❌ close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        {/* TITLE */}
        <h2 className="text-lg font-semibold">Accede a tus citas</h2>

        {/* SUBTITLE */}
        <p className="text-sm text-gray-400">
          No necesitas cuenta. Te enviaremos un codigo a tu email para acceder a
          tus citas.
        </p>

        {/* EMAIL STEP */}
        {step === "email" && (
          <div className="space-y-3">
            <input
              ref={inputRef}
              type="email"
              placeholder="Email con el que hiciste la reserva"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-700 focus:border-blue-500 outline-none"
            />

            <button
              onClick={handleSendOtp}
              disabled={!email || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-2.5 rounded-xl transition disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Continuar"}
            </button>
          </div>
        )}

        {/* OTP STEP */}
        {step === "otp" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">Código enviado a</p>

            <p className="text-white font-medium break-all">{email}</p>

            <OtpInput
              length={6}
              onComplete={async (code) => {
                const ok = await verify(code);
                if (ok) onSuccess();
              }}
            />

            {/* RESEND */}
            <div className="flex items-center justify-center gap-4">
              {timer > 0 ? (
                <p className="text-xs text-gray-500">Reenviar en {timer}s</p>
              ) : (
                <button
                  onClick={handleSendOtp}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Reenviar código
                </button>
              )}

              <button
                onClick={reset}
                className="text-sm text-gray-500 hover:text-gray-300"
              >
                Cambiar email
              </button>
            </div>
          </div>
        )}

        {/* LOADING */}
        {loading && step === "otp" && (
          <p className="text-gray-400 text-sm">Verificando...</p>
        )}

        {/* ERROR */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* CANCEL */}
        <button
          onClick={handleClose}
          className="text-xs text-gray-500 hover:text-gray-300"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
