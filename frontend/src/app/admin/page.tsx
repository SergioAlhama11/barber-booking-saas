"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminSession } from "@/hooks/useAdminSession";

export default function AdminEntryPage() {
  const router = useRouter();
  const { isReady, isLogged } = useAdminSession();

  useEffect(() => {
    if (!isReady) return;
    router.replace(isLogged ? "/admin/appointments" : "/admin/login");
  }, [isLogged, isReady, router]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-5 text-sm text-slate-300 shadow-2xl shadow-black/20">
        Cargando panel...
      </div>
    </div>
  );
}
