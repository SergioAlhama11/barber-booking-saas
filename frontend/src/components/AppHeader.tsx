"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useSession } from "@/hooks/booking/useSessions";
import { getBarbershop } from "@/services/api";

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { slug } = useParams() as { slug?: string };

  const isHome = pathname === `/barbershops/${slug}`;
  const isMyBookings = pathname.includes("my-bookings");

  const storageKey = slug ? `barbershop_name_${slug}` : "barbershop_name";

  const [name, setName] = useState<string>(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return localStorage.getItem(storageKey) || "";
  });

  const [loggingOut, setLoggingOut] = useState(false);

  // 🔥 sesión
  const { email, isLogged, isReady, logout } = useSession();

  useEffect(() => {
    if (!slug) return;

    const storageKey = `barbershop_name_${slug}`;

    const cached = localStorage.getItem(storageKey);

    if (cached) {
      setName(cached);
      return;
    }

    getBarbershop(slug).then((res) => {
      if (!res.error && res.data) {
        setName(res.data.name);

        localStorage.setItem(storageKey, res.data.name);
      }
    });
  }, [slug]);

  const displayName = name || (slug ? slug.replace(/-/g, " ") : "Barber");

  async function handleLogout() {
    if (!slug || loggingOut) return;

    try {
      setLoggingOut(true);
      await logout();
      router.replace(`/barbershops/${slug}`);
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  useEffect(() => {
    if (!slug) return;
    localStorage.setItem("last_barbershop_slug", slug);
  }, [slug]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/6 bg-black/80 backdrop-blur-2xl">
      <div className="w-full px-4 py-3 sm:px-6 xl:px-10 2xl:px-14">
        <div className="space-y-3">
          {/* TOP BAR */}

          <div className="grid grid-cols-[88px_minmax(0,1fr)_88px] items-center gap-2 sm:grid-cols-[110px_1fr_110px] xl:grid-cols-[140px_1fr_140px]">
            {/* LEFT */}

            <div className="min-w-[90px]">
              {!isHome ? (
                <button
                  onClick={() => router.back()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-sm text-slate-300 transition hover:border-white/12 hover:bg-white/[0.06] hover:text-white"
                >
                  <span>←</span>
                  <span>Volver</span>
                </button>
              ) : null}
            </div>

            {/* CENTER */}

            <div className="min-w-0 text-center">
              <p className="mx-auto w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-[1.55rem] font-semibold tracking-tight text-white sm:text-[1.9rem] xl:text-[2.4rem]">
                {displayName}
              </p>

              <p className="mt-1 hidden text-[11px] uppercase tracking-[0.22em] text-slate-500 sm:block">
                {isMyBookings
                  ? "Gestion de reservas"
                  : isReady && isLogged && email
                    ? "Acceso activo"
                    : "Reserva online"}
              </p>
            </div>

            {/* RIGHT */}

            <div className="flex min-w-[90px] justify-end">
              {isMyBookings && isReady && isLogged ? (
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 px-4 text-sm font-medium text-red-200 transition hover:bg-red-500/15 disabled:opacity-60"
                >
                  {loggingOut ? "Saliendo..." : "Cerrar"}
                </button>
              ) : slug && !isMyBookings ? (
                <button
                  onClick={() =>
                    router.push(`/barbershops/${slug}/my-bookings`)
                  }
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] px-4 text-sm font-medium text-white transition hover:border-white/12 hover:bg-white/[0.06]"
                >
                  📅 Citas
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
