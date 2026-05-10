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
    <div className="sticky top-0 z-50 border-b border-white/6 bg-black/80 backdrop-blur-2xl">
      <div className="max-w-md mx-auto px-4 py-3 space-y-3">
        <div className="grid grid-cols-[92px_1fr_92px] items-center gap-2">
          {!isHome ? (
            <button
              onClick={() => router.back()}
              className="justify-self-start inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-sm text-gray-300 transition hover:border-white/12 hover:bg-white/[0.06] hover:text-white"
            >
              <span aria-hidden="true">←</span>
              <span>Volver</span>
            </button>
          ) : (
            <div />
          )}

          <div className="min-w-0 text-center">
            <p className="truncate text-[2rem] font-semibold tracking-tight text-white">
              {displayName}
            </p>

            <p className="mt-0.5 text-[11px] tracking-[0.18em] uppercase text-gray-500">
              {isMyBookings
                ? "Gestion de reservas"
                : isReady && isLogged && email
                  ? "Acceso activo"
                  : "Reserva online"}
            </p>
          </div>

          <div className="flex justify-end">
            {isMyBookings && isReady && isLogged ? (
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 px-3 text-xs font-medium text-red-200 transition hover:bg-red-500/15 disabled:opacity-60"
              >
                {loggingOut ? "Saliendo..." : "Cerrar"}
              </button>
            ) : slug && !isMyBookings ? (
              <button
                onClick={() => router.push(`/barbershops/${slug}/my-bookings`)}
                className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] px-3 text-sm font-medium text-white transition hover:border-white/12 hover:bg-white/[0.06]"
              >
                📅 Citas
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>

        {isMyBookings ? (
          <div className="rounded-3xl border border-white/8 bg-[#0d1220] px-4 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  Sesion temporal
                </p>
                <p className="truncate text-sm font-medium text-white">
                  {isReady && isLogged && email
                    ? email
                    : "Accede con tu email para recuperar tus citas"}
                </p>
              </div>

              {slug && (
                <button
                  onClick={() => router.push(`/barbershops/${slug}`)}
                  className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-slate-200"
                >
                  Reservar
                </button>
              )}
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {isReady && isLogged
                ? "Desde aqui puedes revisar, modificar o cancelar tus reservas con acceso temporal."
                : "Te enviaremos un codigo de acceso o podras entrar desde el enlace recibido por email."}
            </p>
          </div>
        ) : isReady && isLogged && email ? (
          <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
                Sesion activa
              </p>
              <p className="truncate text-sm text-gray-200">{email}</p>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-full px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
            >
              {loggingOut ? "Saliendo..." : "Salir"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
