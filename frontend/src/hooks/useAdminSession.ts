"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearAdminSession,
  readAdminSession,
  setAdminSession,
  subscribeToAdminSession,
  type AdminMe,
} from "@/services/adminSession";
import { getAdminMe } from "@/services/adminApi";

type UseAdminSessionResult = {
  token: string | null;
  me: AdminMe | null;
  isReady: boolean;
  isLogged: boolean;
  refreshSession: (tokenOverride?: string) => Promise<AdminMe | null>;
  logout: () => void;
};

export function useAdminSession(): UseAdminSessionResult {
  const [session, setSession] = useState(readAdminSession);
  const [isReady, setIsReady] = useState(false);

  const refreshSession = useCallback(async (tokenOverride?: string) => {
    const nextToken = tokenOverride ?? readAdminSession().token;

    if (!nextToken) {
      clearAdminSession();
      setSession({ token: null, me: null });
      return null;
    }

    try {
      const me = await getAdminMe(tokenOverride);
      const nextSession = { token: nextToken, me };
      setAdminSession(nextSession);
      setSession(nextSession);
      return me;
    } catch {
      clearAdminSession();
      setSession({ token: null, me: null });
      return null;
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => subscribeToAdminSession(() => setSession(readAdminSession())), []);

  useEffect(() => {
    const existingSession = readAdminSession();

    if (!existingSession.token) {
      setIsReady(true);
      return;
    }

    void refreshSession();
  }, [refreshSession]);

  const logout = useCallback(() => {
    clearAdminSession();
    setSession({ token: null, me: null });
  }, []);

  return useMemo(
    () => ({
      token: session.token,
      me: session.me,
      isReady,
      isLogged: !!session.token && !!session.me,
      refreshSession,
      logout,
    }),
    [isReady, logout, refreshSession, session.me, session.token],
  );
}
