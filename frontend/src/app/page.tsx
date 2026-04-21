import Link from "next/link";

import { getBarbershops } from "@/services/api";
import HomeEntryGate from "@/components/HomeEntryGate";
import type { Barbershop } from "@/types";

export default async function Home() {
  const barbershopsRes = await getBarbershops();
  const barbershops: Barbershop[] = barbershopsRes.data ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
      <HomeEntryGate
        availableSlugs={barbershops.map((barbershop) => barbershop.slug)}
      />

      <main className="w-full max-w-md mx-auto px-4 py-8 space-y-6">
        <div className="space-y-3 text-center">
          <p className="text-5xl">💈</p>
          <h1 className="text-4xl font-bold tracking-tight">Reserva tu cita</h1>
          <p className="text-sm text-gray-400">
            Elige una barbería para entrar a la reserva.
          </p>
        </div>

        {barbershops.length === 0 ? (
          <div className="rounded-3xl border border-gray-800 bg-gray-900/60 px-5 py-6 text-center space-y-2">
            <p className="font-medium text-white">
              No hay barberías disponibles
            </p>
            <p className="text-sm text-gray-500">
              Añade una barbería en el sistema para poder empezar.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {barbershops.map((barbershop) => (
              <Link
                key={barbershop.id}
                href={`/barbershops/${barbershop.slug}`}
                className="block rounded-3xl border border-gray-800 bg-gray-900/60 px-5 py-5 transition hover:border-blue-500/40 hover:bg-gray-900"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xl font-semibold text-white truncate">
                      {barbershop.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {barbershop.slug}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-blue-500/10 px-3 py-2 text-sm text-blue-300">
                    Entrar
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
