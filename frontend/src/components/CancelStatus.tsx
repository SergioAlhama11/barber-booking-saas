import Link from "next/link";

type Status = "loading" | "success" | "error";

export default function CancelStatus({
  status,
  message,
  slug,
}: {
  status: Status;
  message?: string;
  slug: string;
}) {
  return (
    <div className="w-full overflow-hidden rounded-[2.5rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(60,130,246,0.18),transparent_30%),linear-gradient(180deg,rgba(17,24,39,0.96),rgba(11,16,28,0.94))] p-8 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-10">
      {/* LOADING */}

      {status === "loading" && (
        <div className="flex flex-col items-center text-center">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-cyan-400/20 border-t-cyan-300" />

          <p className="mt-8 text-[11px] uppercase tracking-[0.24em] text-cyan-200/70">
            Procesando cancelación
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
            Cancelando tu cita...
          </h1>

          <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
            Estamos procesando tu solicitud. Esto solo tardará unos segundos.
          </p>
        </div>
      )}

      {/* SUCCESS */}

      {status === "success" && (
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-green-400/20 bg-green-400/10 text-4xl">
            ✓
          </div>

          <p className="mt-8 text-[11px] uppercase tracking-[0.24em] text-green-200/70">
            Cancelación completada
          </p>

          <h1 className="mt-4 text-5xl font-bold tracking-tight text-white">
            Cita cancelada
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">
            Tu reserva ha sido cancelada correctamente. El horario vuelve a
            estar disponible para nuevas reservas.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/barbershops/${slug}`}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-cyan-300 px-6 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Reservar nueva cita
            </Link>

            <Link
              href={`/barbershops/${slug}/my-bookings`}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-6 text-sm font-medium text-white transition hover:bg-white/[0.06]"
            >
              Ver mis reservas
            </Link>
          </div>
        </div>
      )}

      {/* ERROR */}

      {status === "error" && (
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-red-400/20 bg-red-400/10 text-4xl text-red-200">
            ✕
          </div>

          <p className="mt-8 text-[11px] uppercase tracking-[0.24em] text-red-200/70">
            Error de cancelación
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white">
            No se pudo cancelar la cita
          </h1>

          <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">
            {message || "El enlace no es válido o ha expirado."}
          </p>

          <div className="mt-10">
            <Link
              href={`/barbershops/${slug}`}
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] px-6 text-sm font-medium text-white transition hover:bg-white/[0.06]"
            >
              Volver a la barbería
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
