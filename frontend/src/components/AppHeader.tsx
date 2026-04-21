"use client";

import { useEffect } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { slug } = useParams() as { slug?: string };

  const isHome = pathname === `/barbershops/${slug}`;
  const isMyBookings = pathname.includes("my-bookings");
  const displayName = slug ? slug.replace(/-/g, " ") : "Barber";

  useEffect(() => {
    if (!slug) return;

    localStorage.setItem("last_barbershop_slug", slug);
  }, [slug]);

  return (
    <div className="sticky top-0 z-50 border-b border-gray-800/80 bg-black/85 backdrop-blur-xl">
      <div className="max-w-md mx-auto px-4 py-2.5">
        <div className="grid grid-cols-[92px_1fr_96px] items-center gap-2">
          {!isHome ? (
            <button
              onClick={() => router.back()}
              className="justify-self-start inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-900 transition"
            >
              <span aria-hidden="true">←</span>
              <span>Volver</span>
            </button>
          ) : (
            <div />
          )}

          <div className="min-w-0 text-center">
            <p className="truncate text-lg font-semibold tracking-tight text-white">
              {displayName}
            </p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
              Barber booking
            </p>
          </div>

          {slug && (
            <button
              onClick={() => router.push(`/barbershops/${slug}/my-bookings`)}
              className={`justify-self-end inline-flex items-center justify-center rounded-full px-3 py-2 text-sm transition ${
                isMyBookings
                  ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                  : "text-gray-400 hover:text-white hover:bg-gray-900"
              }`}
            >
              Mis citas
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
