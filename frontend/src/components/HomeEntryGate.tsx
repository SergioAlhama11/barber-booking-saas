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

    if (!savedSlug) return;

    if (!availableSlugs.includes(savedSlug)) {
      localStorage.removeItem(LAST_BARBERSHOP_KEY);
      return;
    }

    router.replace(`/barbershops/${savedSlug}`);
  }, [availableSlugs, router]);

  return null;
}
