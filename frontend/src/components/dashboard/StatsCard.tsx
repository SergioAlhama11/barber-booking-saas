type Props = {
  title: string;
  value: React.ReactNode; // 🔥 clave
  subtitle?: string;
};

export default function StatsCard({ title, value, subtitle }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <p className="text-sm text-gray-400">{title}</p>

      <p className="text-3xl font-bold text-white mt-2">{value}</p>

      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}
