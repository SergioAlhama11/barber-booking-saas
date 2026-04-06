export default function ConversionBadge({ rate }: { rate: number }) {
  let color = "text-red-400";

  if (rate > 20) color = "text-green-400";
  else if (rate > 10) color = "text-yellow-400";

  return (
    <span className={`text-sm font-medium ${color}`}>{rate.toFixed(1)}%</span>
  );
}
