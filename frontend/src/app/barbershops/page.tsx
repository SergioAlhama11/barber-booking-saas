import Link from "next/link";

import { getBarbershops } from "@/services/api";
import type { Barbershop } from "@/types";

export default async function BarbershopsPage() {
  const barbershopsRes = await getBarbershops();

  const barbershops: Barbershop[] = barbershopsRes.data ?? [];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(54,189,248,0.12),_transparent_28%),linear-gradient(180deg,_#02050d_0%,_#090f1b_54%,_#050815_100%)] text-white">
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="space-y-8">
          <div className="space-y-3 text-center sm:space-y-4">
            <p className="text-5xl">💈</p>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Reserva tu cita sin llamadas ni esperas
            </h1>

            <p className="mx-auto max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
              Elige barbería, servicio y hora en menos de un minuto desde
              cualquier dispositivo.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <Link
              href="/admin"
              className="block rounded-[2rem] border border-cyan-400/20 bg-cyan-400/10 px-5 py-5 transition hover:border-cyan-300/40 hover:bg-cyan-400/14 sm:px-6 sm:py-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 text-left">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">
                    ACCESO PROFESIONAL
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white sm:text-xl">
                    Panel privado para la barbería
                  </p>
                  <p className="mt-2 text-sm leading-6 text-cyan-50/75">
                    Gestiona citas, horarios y clientes desde una interfaz
                    rápida y pensada para el día a día del equipo.
                  </p>
                </div>

                <span className="shrink-0 rounded-full bg-cyan-200 px-3 py-2 text-sm font-medium text-slate-950">
                  Entrar
                </span>
              </div>
            </Link>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] px-5 py-5 sm:px-6 sm:py-6">
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                PENSADO PARA EL EQUIPO
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                Todo organizado en un único panel
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Consulta las próximas citas, filtra reservas y trabaja
                cómodamente desde móvil, tablet o escritorio.
              </p>
            </div>
          </div>

          {barbershops.length === 0 ? (
            <div className="rounded-[2rem] border border-gray-800 bg-gray-900/60 px-5 py-6 text-center space-y-2">
              <p className="font-medium text-white">
                No hay barberías disponibles
              </p>

              <p className="text-sm text-gray-500">
                Añade una barbería para comenzar.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {barbershops.map((barbershop) => (
                <Link
                  key={barbershop.id}
                  href={`/barbershops/${barbershop.slug}`}
                  className="block rounded-[2rem] border border-gray-800 bg-gray-900/60 px-5 py-5 transition hover:border-blue-500/40 hover:bg-gray-900"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-xl font-semibold text-white">
                        {barbershop.name}
                      </p>

                      <p className="truncate text-sm text-gray-500">
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
        </div>
      </main>
    </div>
  );
}
