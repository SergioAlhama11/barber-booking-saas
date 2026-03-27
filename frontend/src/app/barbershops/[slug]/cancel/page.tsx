"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import CancelStatus from "@/components/CancelStatus";
import { cancelAppointment } from "@/services/api";

type Status = "loading" | "success" | "error";

export default function CancelPage() {
  const searchParams = useSearchParams();
  const params = useParams();

  const slug = params.slug as string;

  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    if (!searchParams || !slug) return;

    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setErrorMessage("Token no proporcionado");
      return;
    }

    async function cancel(validToken: string) {
      try {
        await cancelAppointment(validToken, slug); // 🔥 dinámico
        setStatus("success");
      } catch (err: any) {
        setStatus("error");

        if (err.status === 404) {
          setErrorMessage("El enlace no es válido o ya ha sido utilizado");
        } else if (err.status === 400) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage("Error inesperado. Inténtalo de nuevo");
        }
      }
    }

    cancel(token);
  }, [searchParams, slug]);

  return <CancelStatus status={status} message={errorMessage} />;
}
