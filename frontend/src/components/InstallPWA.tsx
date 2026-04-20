"use client";

import { usePWAInstall } from "@/hooks/usePWAInstall";

export default function InstallPWA() {
  const { install, dismiss, visible, canInstall, isIOS, isStandalone } =
    usePWAInstall();

  if (!visible || isStandalone) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3 animate-slide-up">
        {/* TEXT */}
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-white">📲 Instala la app</p>

          <p className="text-xs text-gray-400">Acceso rápido sin navegador</p>

          {/* iOS hint */}
          {!canInstall && isIOS && (
            <p className="text-xs text-gray-500 mt-1">
              Pulsa compartir → “Añadir a inicio”
            </p>
          )}
        </div>

        {/* CTA */}
        {canInstall && (
          <button
            onClick={install}
            className="bg-blue-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
          >
            Instalar
          </button>
        )}

        {/* CLOSE */}
        <button onClick={dismiss} className="text-gray-500 text-lg px-2">
          ✕
        </button>
      </div>
    </div>
  );
}
