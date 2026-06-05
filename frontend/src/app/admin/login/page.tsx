"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/services/adminApi";
import { setAdminSession } from "@/services/adminSession";
import { useAdminSession } from "@/hooks/useAdminSession";

export default function AdminLoginPage() {
  const router = useRouter();
  const { isReady, isLogged, refreshSession } = useAdminSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isReady && isLogged) {
      router.replace("/admin/appointments");
    }
  }, [isLogged, isReady, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { token } = await loginAdmin(email, password);
      const me = await refreshSession(token);

      if (!me) {
        throw new Error("No se pudo validar la sesion");
      }

      setAdminSession({ token, me });
      router.replace("/admin/appointments");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo iniciar sesion",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center py-4 sm:py-8">
      <div className="grid w-full max-w-6xl gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8 lg:p-10">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
            PANEL PROFESIONAL
          </p>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            La agenda del equipo, siempre bajo control.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
            Accede al panel privado para gestionar reservas, revisar la agenda
            del día y mantener organizado el trabajo de la barbería.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/80">
                ACCESO SEGURO
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Inicio de sesión privado para administradores y barberos.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                GESTIÓN RÁPIDA
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Consulta y organiza citas desde cualquier dispositivo.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                AGENDA EN TIEMPO REAL
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Visualiza cambios y reservas al instante.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-[#09101e]/80 p-5">
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-emerald-100">
                Vista diaria clara
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
                Filtros rápidos
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
                Optimizado para móvil
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Diseñado para que el equipo encuentre rápidamente quién viene, a
              qué hora y qué servicio tiene reservado.
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[#0b1120]/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
              INICIAR SESIÓN
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Accede al panel
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Introduce tus credenciales para abrir la agenda y gestionar las
              reservas de la barbería.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@trimly.com"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:bg-white/[0.06]"
                autoComplete="username"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-slate-300">Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:bg-white/[0.06]"
                autoComplete="current-password"
                required
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error === "SESSION_EXPIRED"
                  ? "La sesion ha expirado. Vuelve a iniciar sesion."
                  : error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar al panel"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
