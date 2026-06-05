"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import AppContainer from "@/components/AppContainer";
import AppHeader from "@/components/AppHeader";
import CancelStatus from "@/components/CancelStatus";

import { cancelAppointmentByToken } from "@/services/api";

export default function CancelPage() {
  const searchParams = useSearchParams();
  const { slug } = useParams() as { slug: string };

  const token = searchParams.get("token");
  const success = searchParams.get("success");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  const [message, setMessage] = useState<string>();

  useEffect(() => {
    // ✅ cancelación manual desde my-bookings
    if (success === "true") {
      setStatus("success");
      return;
    }

    // ❌ sin token
    if (!token) {
      setStatus("error");
      setMessage("Token no proporcionado");
      return;
    }

    // ✅ cancelación vía email/token
    cancelAppointmentByToken(slug, token)
      .then(() => {
        setStatus("success");
      })
      .catch(() => {
        setStatus("error");
        setMessage("El enlace no es válido o ha expirado");
      });
  }, [slug, token, success]);

  return (
    <div className="min-h-screen bg-black text-white">
      <AppContainer>
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
          <CancelStatus slug={slug} status={status} message={message} />
        </div>
      </AppContainer>
    </div>
  );
}
