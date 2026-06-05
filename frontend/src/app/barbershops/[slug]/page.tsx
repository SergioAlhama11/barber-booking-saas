import { getBarbershops, getServices, getBarbers } from "@/services/api";
import { Service, Barber } from "@/types";
import Booking from "@/components/Booking";
import Link from "next/link";
import ErrorState from "@/components/ErrorState";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [shopRes, servicesRes, barbersRes] = await Promise.all([
    getBarbershops(),
    getServices(slug),
    getBarbers(slug),
  ]);

  // =========================
  // ERROR STATE (PRO)
  // =========================
  if (servicesRes.error || barbersRes.error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <ErrorState
          title="Error cargando la barbería"
          description="Verifica la URL o que la barbería exista."
        />
      </div>
    );
  }

  const services: Service[] = servicesRes.data || [];
  const barbers: Barber[] = barbersRes.data || [];
  const shopName =
    shopRes.data?.find((s: { slug: string; name: string }) => s.slug === slug)
      ?.name ??
    slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(54,189,248,0.12),_transparent_28%),linear-gradient(180deg,_#02050d_0%,_#090f1b_54%,_#050815_100%)] text-white">
      <div className="mx-auto w-full max-w-[1500px] px-4 pt-6 pb-8 sm:px-6 lg:px-8">
        <div className="space-y-7 lg:space-y-9">
          <div className="flex items-start justify-between gap-3 xl:gap-6">
            <Link
              href="/barbershops"
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-800 bg-gray-900 px-3 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-800 hover:text-white active:scale-[0.98]"
            >
              <span aria-hidden="true">←</span>
              <span>Barberías</span>
            </Link>

            <div className="flex flex-col items-end gap-2">
              <Link
                href={`/barbershops/${slug}/my-bookings`}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-800 bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-gray-800 active:scale-[0.98]"
              >
                <span aria-hidden="true">📅</span>
                <span>Mis citas</span>
              </Link>
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(60,130,246,0.16),transparent_28%),linear-gradient(180deg,rgba(17,24,39,0.94),rgba(15,21,35,0.86))] px-6 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] xl:px-8 xl:py-7">
            <div className="space-y-4">
              <div className="max-w-4xl space-y-3 text-center lg:text-left">
                <p className="text-[11px] uppercase tracking-[0.24em] text-blue-200/75">
                  Reserva online
                </p>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl xl:text-6xl">
                  💈 {shopName}
                </h1>

                <p className="max-w-4xl text-sm leading-7 text-slate-300 sm:text-base">
                  Reserva tu próxima cita en pocos pasos y consulta la
                  disponibilidad en tiempo real.
                </p>
              </div>

              <div className="hidden lg:block">
                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-3.5">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-blue-200/70">
                      Paso 1
                    </p>
                    <p className="mt-1.5 text-base font-semibold text-white">
                      Elige el servicio
                    </p>
                    <p className="mt-1.5 text-sm leading-6 text-slate-400">
                      Selecciona el corte o servicio que quieres reservar.
                    </p>
                  </div>

                  <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-3.5">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-blue-200/70">
                      Paso 2
                    </p>
                    <p className="mt-1.5 text-base font-semibold text-white">
                      Selecciona profesional
                    </p>
                    <p className="mt-1.5 text-sm leading-6 text-slate-400">
                      Consulta qué barberos tienen disponibilidad.
                    </p>
                  </div>

                  <div className="rounded-[1.35rem] border border-white/8 bg-white/[0.03] p-3.5">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-blue-200/70">
                      Paso 3
                    </p>
                    <p className="mt-1.5 text-base font-semibold text-white">
                      Confirma tu cita
                    </p>
                    <p className="mt-1.5 text-sm leading-6 text-slate-400">
                      Introduce tus datos y recibe la confirmación al instante.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[2.2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(15,21,35,0.94),rgba(10,15,28,0.9))] p-4 shadow-[0_26px_80px_rgba(0,0,0,0.24)] backdrop-blur sm:p-5 xl:p-7">
            <Booking services={services} barbers={barbers} slug={slug} />
          </div>
        </div>
      </div>
    </div>
  );
}
