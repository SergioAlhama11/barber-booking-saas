"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminSession } from "@/hooks/useAdminSession";

export default function AdminPrivateEntryPage() {
  const router = useRouter();
  const { isReady, me } = useAdminSession();

  useEffect(() => {
    if (!isReady || !me) {
      return;
    }

    if (me.roles.includes("SUPER_ADMIN")) {
      router.replace("/admin/barbershops");
      return;
    }

    router.replace("/admin/appointments");
  }, [isReady, me, router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-5 text-sm text-slate-300">
        Cargando panel...
      </div>
    </div>
  );
}
