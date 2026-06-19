import { useCallback, useState } from "react";
import { requestOtp, verifyOtp } from "@/services/api";
import {
  getAuthEmail,
  setAuthEmail,
  setAuthSession,
} from "@/services/authSession";

export function useAuth(slug: string) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState(() => getAuthEmail() || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendOtp = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      await requestOtp(email, slug);
      setAuthEmail(email);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error enviando código");
    } finally {
      setLoading(false);
    }
  }, [email, slug]);

  const verify = useCallback(
    async (code: string): Promise<boolean> => {
      setLoading(true);
      setError("");

      try {
        await verifyOtp(email, code);
        setAuthSession({ email });

        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Código incorrecto";

        switch (message) {
          case "OTP_INVALID":
            setError("El código introducido no es válido.");
            break;

          case "OTP_EXPIRED":
            setError("El código ha caducado. Solicita uno nuevo.");
            break;

          default:
            setError(message);
        }

        return false;
      } finally {
        setLoading(false);
      }
    },
    [email],
  );

  const reset = useCallback(() => {
    setStep("email");
    setError("");
  }, []);

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
