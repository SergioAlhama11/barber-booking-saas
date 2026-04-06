import { getQrStats } from "@/services/dashboard";
import StatsGrid from "@/components/dashboard/StatsGrid";

export default async function DashboardPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  let stats;

  try {
    stats = await getQrStats(slug);
  } catch {
    return (
      <div className="p-6 text-center text-red-400">
        Error cargando métricas
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-white">📊 Dashboard - {slug}</h1>

      <StatsGrid
        scans={stats.scans}
        conversions={stats.conversions}
        conversionRate={stats.conversionRate}
      />
    </div>
  );
}
