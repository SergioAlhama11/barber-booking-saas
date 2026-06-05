"use client";

import AppHeader from "@/components/AppHeader";

export default function AppContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-black via-[#050816] to-black text-white">
      <AppHeader />

      <main className="flex-1 w-full px-4 py-5 sm:px-6 xl:px-10 2xl:px-14">
        {children}
      </main>

      <footer className="border-t border-white/6 px-4 py-6 sm:px-6 xl:px-10 2xl:px-14">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs text-slate-400">
            Acceso temporal seguro
          </div>

          <div className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs text-slate-400">
            Modificación en tiempo real
          </div>

          <div className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1 text-xs text-slate-400">
            Confirmación por email
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-600">
          Gestiona tus reservas desde cualquier dispositivo.
        </p>
      </footer>
    </div>
  );
}
