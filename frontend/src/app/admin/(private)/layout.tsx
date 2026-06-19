"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminSession } from "@/hooks/useAdminSession";

export default function PrivateAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const { isReady, isLogged, me, logout } = useAdminSession();

  console.log("LAYOUT_ME", me);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isReady) return;

    if (!isLogged) {
      router.replace("/admin/login");
    }
  }, [isReady, isLogged, router]);

  if (!isReady || !isLogged) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Cargando...
      </div>
    );
  }

  const menu = [
    {
      label: "Citas",
      href: "/admin/appointments",
    },
    {
      label: "Barberos",
      href: "/admin/barbers",
    },
    {
      label: "Servicios",
      href: "/admin/services",
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace("/admin/login");
  };

  if (me?.roles.includes("SUPER_ADMIN")) {
    menu.push(
      {
        label: "Usuarios",
        href: "/admin/users",
      },
      {
        label: "Barberías",
        href: "/admin/barbershops",
      },
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#020817] text-slate-100">
      {/* HEADER MOBILE */}
      <header
        className="
        fixed
        top-0
        left-0
        right-0
        z-40
        flex
        h-16
        items-center
        justify-between
        border-b
        border-white/10
        bg-[#020817]/95
        px-4
        backdrop-blur-xl
        lg:hidden
      "
      >
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          border
          border-white/10
          bg-white/[0.03]
        "
        >
          ☰
        </button>

        <span className="text-lg font-semibold">Trimly</span>

        <div className="w-10" />
      </header>

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          <aside
            className="
            fixed
            inset-y-0
            left-0
            z-50
            flex
            w-[280px]
            flex-col
            border-r
            border-white/10
            bg-[#020817]
            p-6
            shadow-2xl
            lg:hidden
          "
          >
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Trimly</h1>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl text-slate-400"
              >
                ×
              </button>
            </div>

            <nav className="mt-8 flex flex-1 flex-col gap-2">
              {menu.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                    rounded-2xl
                    px-4
                    py-3
                    transition
                    ${
                      active
                        ? "bg-cyan-400/20 text-cyan-100"
                        : "text-slate-300 hover:bg-white/[0.04]"
                    }
                  `}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-white/10 pt-4">
              <p className="mb-4 break-all text-xs text-slate-500">
                {me?.email}
              </p>

              <button
                onClick={handleLogout}
                className="
                w-full
                rounded-2xl
                border
                border-red-500/20
                bg-red-500/10
                px-4
                py-3
                text-red-100
                transition
                hover:bg-red-500/20
              "
              >
                Cerrar sesión
              </button>
            </div>
          </aside>
        </>
      )}

      {/* DESKTOP LAYOUT */}
      <div className="flex h-full">
        <aside
          className="
          hidden
          h-screen
          w-72
          shrink-0
          border-r
          border-white/10
          bg-black/20
          p-6
          lg:flex
          lg:flex-col
        "
        >
          <h1 className="text-2xl font-bold">Trimly</h1>

          <p className="mt-2 text-sm text-slate-400">Panel de administración</p>

          <nav className="mt-8 flex flex-1 flex-col gap-2">
            {menu.map((item) => {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                  rounded-2xl
                  px-4
                  py-3
                  transition
                  ${
                    active
                      ? "bg-cyan-400/20 text-cyan-100"
                      : "text-slate-300 hover:bg-white/[0.04]"
                  }
                `}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 pt-4">
            <p className="mb-4 break-all text-xs text-slate-500">{me?.email}</p>

            <button
              onClick={handleLogout}
              className="
              w-full
              rounded-2xl
              border
              border-red-500/20
              bg-red-500/10
              px-4
              py-3
              text-red-100
              transition
              hover:bg-red-500/20
            "
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main
          className="
          min-w-0
          flex-1
          overflow-x-hidden
          overflow-y-auto
          pt-20
          lg:pt-0
          p-4
          sm:p-6
          lg:p-8
        "
        >
          {children}
        </main>
      </div>
    </div>
  );
}
