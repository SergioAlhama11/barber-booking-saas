"use client";

import Link from "next/link";
import { useState } from "react";

const HINT_KEY_PREFIX = "my-bookings-hint-dismissed:";

type Props = {
  slug: string;
};

export default function MyBookingsEntryHint({ slug }: Props) {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const storageKey = `${HINT_KEY_PREFIX}${slug}`;
    return window.localStorage.getItem(storageKey) !== "1";
  });

  function dismissHint() {
    const storageKey = `${HINT_KEY_PREFIX}${slug}`;
    window.localStorage.setItem(storageKey, "1");
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 px-4 py-4 text-white shadow-lg shadow-blue-950/20">
      <div className="space-y-3">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.18em] text-blue-200/80">
            Acceso a tus citas
          </p>
          <p className="text-sm font-medium leading-6">
            Si ya reservaste, puedes ver, cambiar o cancelar tu cita desde
            aqui.
          </p>
          <p className="text-xs text-blue-100/75">
            Entra con tu email o directamente desde el enlace que recibiste por
            correo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/barbershops/${slug}/my-bookings`}
            className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-gray-200"
          >
            📅 Ver mis citas
          </Link>

          <button
            onClick={dismissHint}
            className="inline-flex items-center justify-center rounded-full px-3 py-2 text-xs text-blue-100/80 transition hover:bg-white/5 hover:text-white"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
