import { getBarbershops } from "@/services/api";
import HomeEntryGate from "@/components/HomeEntryGate";

export default async function Home() {
  const res = await getBarbershops();

  const availableSlugs = res.data?.map((b) => b.slug) ?? [];

  return <HomeEntryGate availableSlugs={availableSlugs} />;
}
