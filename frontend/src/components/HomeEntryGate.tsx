"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const LAST_BARBERSHOP_KEY = "last_barbershop_slug";

type Props = {
  availableSlugs: string[];
};

export default function HomeEntryGate({ availableSlugs }: Props) {
  const router = useRouter();

  useEffect(() => {
    const savedSlug = localStorage.getItem(LAST_BARBERSHOP_KEY);

    // NO HAY SLUG GUARDADO
    if (!savedSlug) {
      router.replace("/barbershops");
      return;
    }

    // SLUG INVALIDO
    if (!availableSlugs.includes(savedSlug)) {
      localStorage.removeItem(LAST_BARBERSHOP_KEY);

      router.replace("/barbershops");
      return;
    }

    // SLUG OK
    router.replace(`/barbershops/${savedSlug}`);
  }, [availableSlugs, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-sm text-gray-500">
      Cargando...
    </div>
  );
}
