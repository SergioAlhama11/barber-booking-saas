"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useSession } from "@/hooks/useSessions";
import { getBarbershop } from "@/services/api";

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { slug } = useParams() as { slug?: string };

  const isHome = pathname === `/barbershops/${slug}`;
  const isMyBookings = pathname.includes("my-bookings");

  const [name, setName] = useState<string>(() =>
    typeof window === "undefined"
      ? ""
      : localStorage.getItem("barbershop_name") || "",
  );
  const [loggingOut, setLoggingOut] = useState(false);

  // 🔥 sesión
  const { email, isLogged, isReady, logout } = useSession();

  useEffect(() => {
    if (!slug) return;
    if (name) return;

    getBarbershop(slug).then((res) => {
      if (!res.error && res.data) {
        setName(res.data.name);
        localStorage.setItem("barbershop_name", res.data.name);
      }
    });
  }, [slug, name]);

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
    <div className="sticky top-0 z-50 border-b border-gray-800/80 bg-black/85 backdrop-blur-xl">
      <div className="max-w-md mx-auto px-4 py-2.5 space-y-2">
        <div className="grid grid-cols-[92px_1fr_96px] items-center gap-2">
          {/* LEFT */}
          {!isHome ? (
            <button
              onClick={() => router.back()}
              className="justify-self-start inline-flex items-center gap-1.5 rounded-full px-2.5 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-900 transition"
            >
              ← Volver
            </button>
          ) : (
            <div />
          )}

          {/* CENTER */}
          <div className="min-w-0 text-center">
            <p className="truncate text-lg font-semibold tracking-tight text-white">
              {displayName}
            </p>

            <p className="text-[11px] text-gray-500">
              {isMyBookings ? (
                "Acceso a tus citas"
              ) : isLogged ? (
                <span className="text-gray-400">{email}</span>
              ) : (
                "Barber booking"
              )}
            </p>
          </div>

          {/* RIGHT */}
          <div className="flex justify-end items-center gap-2">
            {slug && !isMyBookings && (
              <button
                onClick={() => router.push(`/barbershops/${slug}/my-bookings`)}
                className={`inline-flex items-center justify-center rounded-full px-3 py-2 text-sm transition ${
                  "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                Mis citas
              </button>
            )}

            {isMyBookings && isReady && isLogged ? (
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex items-center justify-center rounded-full border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-300 transition hover:bg-red-500/15 disabled:opacity-60"
              >
                {loggingOut ? "Saliendo..." : "Cerrar acceso"}
              </button>
            ) : null}

            {!isMyBookings && isReady && isLogged && (
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="text-xs text-red-400 hover:text-red-300"
              >
                {loggingOut ? "Saliendo..." : "Salir"}
              </button>
            )}
          </div>
        </div>

        {isMyBookings && (
          <div className="rounded-2xl border border-gray-800 bg-gray-950/70 px-3 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
                  Acceso temporal
                </p>
                <p className="truncate text-sm text-white">
                  {isReady && isLogged && email
                    ? email
                    : "Accede con tu email para gestionar tus citas"}
                </p>
              </div>

              {slug && (
                <button
                  onClick={() => router.push(`/barbershops/${slug}`)}
                  className="shrink-0 rounded-full bg-white px-3 py-2 text-xs font-medium text-black transition hover:bg-gray-200"
                >
                  Reservar
                </button>
              )}
            </div>

            <p className="mt-2 text-xs text-gray-500">
              {isReady && isLogged
                ? "Puedes revisar, modificar o cancelar tus reservas desde aqui."
                : "Te enviaremos un codigo a tu email para recuperar el acceso."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
