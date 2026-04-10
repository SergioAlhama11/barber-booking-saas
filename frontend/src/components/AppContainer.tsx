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

      <div className="w-full px-4 py-6 max-w-md mx-auto space-y-6">
        <div className="bg-gray-900/60 backdrop-blur border border-gray-800 rounded-2xl p-4 shadow-lg">
          {children}
        </div>

        {/* Footer consistente */}
        <div className="text-center text-xs text-gray-500">
          💡 Cancelación fácil desde el email
        </div>
      </div>
    </div>
  );
}
