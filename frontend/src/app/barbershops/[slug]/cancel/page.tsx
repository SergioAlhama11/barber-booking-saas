"use client";

import AppHeader from "@/components/AppHeader";
import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import CancelStatus from "@/components/CancelStatus";
import { cancelAppointmentByToken } from "@/services/api";

export default function CancelPage() {
  const searchParams = useSearchParams();
  const { slug } = useParams() as { slug: string };
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    if (!token) {
      return;
    }

    cancelAppointmentByToken(slug, token)
      .then(() => setStatus("success"))
      .catch(() => {
        setStatus("error");
        setMessage("El enlace no es válido o ha expirado");
      });
  }, [slug, token]);

  const resolvedStatus = token ? status : "error";
  const resolvedMessage = token ? message : "Token no proporcionado";

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader />
      <CancelStatus status={resolvedStatus} message={resolvedMessage} />
    </div>
  );
}
