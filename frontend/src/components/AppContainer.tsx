"use client";

import AppHeader from "@/components/AppHeader";

export default function AppContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
      <AppHeader />

      <div className="w-full max-w-md mx-auto px-4 py-6 space-y-6">
        {children}

        <div className="pb-4 text-center text-[11px] text-gray-600">
          Gestiona tus reservas desde la app o el enlace del email
        </div>
      </div>
    </div>
  );
}
