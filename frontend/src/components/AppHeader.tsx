"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { getBarbershop } from "@/services/api";

// 🔥 nuevo hook simple inline (no hace falta archivo aparte)
function useSession() {
  const [email, setEmail] = useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem("auth_email"),
  );

  function logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_email");
    setEmail(null);
  }

  return { email, isLogged: !!email, logout };
}

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

  // 🔥 sesión
  const { email, isLogged, logout } = useSession();

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

  useEffect(() => {
    if (!slug) return;
    localStorage.setItem("last_barbershop_slug", slug);
  }, [slug]);

  return (
    <div className="sticky top-0 z-50 border-b border-gray-800/80 bg-black/85 backdrop-blur-xl">
      <div className="max-w-md mx-auto px-4 py-2.5">
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

            {/* 🔥 AQUÍ ESTÁ LA MAGIA */}
            <p className="text-[11px] text-gray-500">
              {isLogged ? (
                <span className="text-gray-400">{email}</span>
              ) : (
                "Barber booking"
              )}
            </p>
          </div>

          {/* RIGHT */}
          <div className="flex justify-end items-center gap-2">
            {slug && (
              <button
                onClick={() => router.push(`/barbershops/${slug}/my-bookings`)}
                className={`inline-flex items-center justify-center rounded-full px-3 py-2 text-sm transition ${
                  isMyBookings
                    ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-900"
                }`}
              >
                Mis citas
              </button>
            )}

            {/* 🔥 logout */}
            {isLogged && (
              <button
                onClick={() => {
                  logout();
                  router.push(`/barbershops/${slug}/my-bookings`);
                }}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Salir
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
