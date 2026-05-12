import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import InstallPWA from "@/components/InstallPWA";
import { AuthProvider } from "@/components/AuthProvider";
import PageTransition from "@/components/PageTransition";

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
  },
};

export const viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <ServiceWorkerRegister />
          <InstallPWA />

          <PageTransition>{children}</PageTransition>
        </AuthProvider>
      </body>
    </html>
  );
}
