"use client";

import AppHeader from "@/components/AppHeader";
import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import CancelStatus from "@/components/CancelStatus";
import { cancelAppointment } from "@/services/api";

export default function CancelPage() {
  const searchParams = useSearchParams();
  const { slug } = useParams() as { slug: string };

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Token no proporcionado");
      return;
    }

    cancelAppointment(token, slug)
      .then(() => setStatus("success"))
      .catch((err: any) => {
        setStatus("error");

        if (err.status === 404) {
          setMessage("El enlace no es válido o ya ha sido utilizado");
        } else {
          setMessage("Error inesperado");
        }
      });
  }, [searchParams, slug]);

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader />
      <CancelStatus status={status} message={message} />
    </div>
  );
}
