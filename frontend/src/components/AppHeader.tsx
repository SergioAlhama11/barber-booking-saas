"use client";

import { useRouter, useParams, usePathname } from "next/navigation";

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { slug } = useParams() as { slug?: string };

  const isHome = pathname === `/barbershops/${slug}`;
  const isMyBookings = pathname.includes("my-bookings");

  return (
    <div className="sticky top-0 z-50 bg-black border-b border-gray-800">
      <div className="max-w-md mx-auto flex items-center justify-between p-4">
        {/* LEFT */}
        {!isHome ? (
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-400 hover:text-white"
          >
            ← Volver
          </button>
        ) : (
          <div />
        )}

        {/* CENTER */}
        <h1 className="text-sm font-semibold text-white">{slug || "Barber"}</h1>

        {/* RIGHT */}
        {slug && (
          <button
            onClick={() => router.push(`/barbershops/${slug}/my-bookings`)}
            className={`text-sm ${
              isMyBookings ? "text-blue-400" : "text-gray-400"
            }`}
          >
            Mis citas
          </button>
        )}
      </div>
    </div>
  );
}
