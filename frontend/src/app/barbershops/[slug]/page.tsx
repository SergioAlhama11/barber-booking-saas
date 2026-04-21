import { getBarbershops, getServices, getBarbers } from "@/services/api";
import { Service, Barber } from "@/types";
import Booking from "@/components/Booking";
import Link from "next/link";

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
        <div className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center space-y-3">
          <p className="text-red-400 text-lg font-semibold">
            ❌ Error cargando la barbería
          </p>
          <p className="text-gray-400 text-sm">
            Verifica la URL o que la barbería exista.
          </p>
        </div>
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
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
      <div className="w-full px-4 py-5 space-y-5 max-w-md mx-auto sm:max-w-md">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold leading-tight">💈 {shopName}</h1>
            <p className="text-xs text-gray-400">Reserva tu cita en segundos</p>
          </div>

          <Link
            href={`/barbershops/${slug}/my-bookings`}
            className="flex items-center gap-1 text-sm px-3 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 transition"
          >
            📅
            <span className="hidden sm:inline">Mis citas</span>
          </Link>
        </div>

        <div className="w-full bg-gray-900/60 backdrop-blur border border-gray-800 rounded-3xl p-4 shadow-lg">
          <Booking services={services} barbers={barbers} slug={slug} />
        </div>

        <div className="text-center text-xs text-gray-500">
          💡 Cancelación fácil desde el email
        </div>
      </div>
    </div>
  );
}
