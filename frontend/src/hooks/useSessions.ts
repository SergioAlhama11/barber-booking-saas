import { useState } from "react";

export function useSession() {
  const [email, setEmail] = useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem("auth_email"),
  );

  function logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_email");
    setEmail(null);
  }

  return {
    email,
    isLogged: !!email,
    logout,
  };
}
