import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(69,211,255,0.16),_transparent_24%),radial-gradient(circle_at_80%_0%,_rgba(90,101,255,0.12),_transparent_28%),linear-gradient(180deg,_#040712_0%,_#09101d_52%,_#050815_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </div>
    </div>
  );
}
