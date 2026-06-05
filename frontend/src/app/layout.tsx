import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import InstallPWA from "@/components/InstallPWA";
import { AuthProvider } from "@/components/AuthProvider";
import PageTransition from "@/components/PageTransition";

import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Trimly",
  description: "Reserva tu cita",
  appleWebApp: {
    title: "Trimly",
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  themeColor: "#08101d",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="bg-[#08101d]">
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          safe-area-shell
          text-white
          min-h-screen
          overflow-x-hidden
        `}
      >
        <Providers>
          <AuthProvider>
            <ServiceWorkerRegister />
            <InstallPWA />

            <PageTransition>{children}</PageTransition>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
