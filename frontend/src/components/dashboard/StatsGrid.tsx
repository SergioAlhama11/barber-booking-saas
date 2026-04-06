import StatsCard from "./StatsCard";
import ConversionBadge from "./ConversionBadge";

type Props = {
  scans: number;
  conversions: number;
  conversionRate: number;
};

export default function StatsGrid({
  scans,
  conversions,
  conversionRate,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatsCard
        title="Escaneos QR"
        value={scans}
        subtitle="Clientes que han escaneado"
      />

      <StatsCard
        title="Reservas"
        value={conversions}
        subtitle="Citas generadas"
      />

      <StatsCard
        title="Conversión"
        value={<ConversionBadge rate={conversionRate} />}
        subtitle="Eficiencia del QR"
      />
    </div>
  );
}
