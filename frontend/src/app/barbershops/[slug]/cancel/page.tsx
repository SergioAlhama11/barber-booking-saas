"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import AppContainer from "@/components/AppContainer";
import CancelStatus from "@/components/CancelStatus";

import { cancelAppointmentByToken } from "@/services/api";

export default function CancelPage() {
  const searchParams = useSearchParams();
  const { slug } = useParams() as { slug: string };

  const token = searchParams.get("token");
  const success = searchParams.get("success");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    success === "true" ? "success" : token ? "loading" : "error",
  );

  const [message, setMessage] = useState<string | undefined>(
    token ? undefined : "Token no proporcionado",
  );

  useEffect(() => {
    if (success === "true") {
      return;
    }

    if (!token) {
      return;
    }

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
