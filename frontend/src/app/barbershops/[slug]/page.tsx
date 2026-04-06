import { getServices, getBarbers } from "@/services/api";
import { Service, Barber } from "@/types";
import Booking from "@/components/Booking";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // ✅ IMPORTANTE
  const { slug } = await params;

  const [servicesRes, barbersRes] = await Promise.all([
    getServices(slug),
    getBarbers(slug),
  ]);

  if (servicesRes.error || barbersRes.error) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center">
        <p className="text-red-500 text-lg font-semibold">
          ❌ Error cargando la barbería
        </p>
        <p className="text-gray-500 mt-2">
          Verifica que la URL es correcta o que la barbería existe.
        </p>
      </div>
    );
  }

  const services: Service[] = servicesRes.data || [];
  const barbers: Barber[] = barbersRes.data || [];

  return (
    <div className="p-6 max-w-xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center">💈 {slug}</h1>

      <Booking services={services} barbers={barbers} slug={slug} />
    </div>
  );
}
