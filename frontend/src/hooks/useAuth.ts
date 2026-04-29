import { useState } from "react";
import { requestOtp, verifyOtp } from "@/services/api";

export function useAuth(slug: string) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState(
    () => localStorage.getItem("auth_email") || "",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendOtp() {
    setLoading(true);
    setError("");

    try {
      await requestOtp(email, slug);
      localStorage.setItem("auth_email", email);
      setStep("otp");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error enviando código",
      );
    }

    setLoading(false);
  }

  async function verify(code: string): Promise<boolean> {
    setLoading(true);
    setError("");

    try {
      await verifyOtp(email, code);

      // 🔥 clave para UX
      localStorage.setItem("auth_email", email);

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código incorrecto");
      return false;
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setStep("email");
    setError("");
  }

  return {
    step,
    email,
    setEmail,
    sendOtp,
    verify,
    loading,
    error,
    reset,
  };
}
