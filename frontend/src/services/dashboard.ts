const API_URL = "http://192.168.18.212:8080";

export type QrStats = {
  scans: number;
  conversions: number;
  conversionRate: number;
};

export async function getQrStats(slug: string): Promise<QrStats> {
  const res = await fetch(`${API_URL}/barbershops/${slug}/qr/stats`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Error loading stats");
  }

  return res.json();
}
