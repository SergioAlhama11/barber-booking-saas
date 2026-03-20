import { getServices, getBarbers } from "@/services/api";
import { Service, Barber } from "@/types";
import Booking from "@/components/Booking";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // 1. Obtener slug (Next 16 → Promise)
  const { slug } = await params;

  // 2. Llamadas en paralelo (mejor rendimiento)
  const [services, barbers]: [Service[], Barber[]] = await Promise.all([
    getServices(slug),
    getBarbers(slug),
  ]);

  // 3. Render
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6"> Barbershop: {slug} </h1>
      <Booking services={services} barbers={barbers} slug={slug} />
    </div>
  );
}
