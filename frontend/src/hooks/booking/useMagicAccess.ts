"use client";

import { useCallback, useMemo, useState } from "react";
import { exchangeMagicToken } from "@/services/api";
import { setAuthSession } from "@/services/authSession";

export function useMagicAccess(rawToken: string | null) {
  const magicToken = useMemo(
    () => (rawToken && rawToken.length > 10 ? rawToken : undefined),
    [rawToken],
  );
  const [magicMessage, setMagicMessage] = useState<string | null>(null);

  const consumeMagicToken = useCallback(async () => {
    if (!magicToken) return null;

    try {
      const session = await exchangeMagicToken(magicToken);
      setAuthSession({ email: session.email });
      setMagicMessage("Acceso verificado desde tu email");
      return session;
    } catch {
      setMagicMessage("El enlace ha caducado. Puedes entrar con un codigo.");
      throw new Error("MAGIC_LINK_EXPIRED");
    }
  }, [magicToken]);

  return {
    magicToken,
    magicMessage,
    setMagicMessage,
    consumeMagicToken,
  };
}
