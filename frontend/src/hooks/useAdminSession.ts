"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clearAdminSession,
  readAdminSession,
  setAdminSession,
  subscribeToAdminSession,
} from "@/services/admin/auth/session";
import { AdminMe } from "@/services/admin/auth/types";
import { getAdminMe, logoutAdmin } from "@/services/admin/auth/api";

type UseAdminSessionResult = {
  me: AdminMe | null;
  isReady: boolean;
  isLogged: boolean;
  refreshSession: () => Promise<AdminMe | null>;
  logout: () => Promise<void>;
};

export function useAdminSession(): UseAdminSessionResult {
  const [session, setSession] = useState(readAdminSession);
  const [isReady, setIsReady] = useState(false);

  const refreshSession = useCallback(async () => {
    try {
      const me = await getAdminMe();

      console.log("REFRESH_SESSION", me);

      const nextSession = { me };

      setAdminSession(nextSession);
      setSession(nextSession);

      return me;
    } catch (error) {
      console.log("REFRESH_ERROR", error);

      clearAdminSession();
      setSession({ me: null });

      return null;
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(
    () => subscribeToAdminSession(() => setSession(readAdminSession())),
    [],
  );

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const logout = useCallback(async () => {
    try {
      await logoutAdmin();
    } finally {
      clearAdminSession();
      setSession({ me: null });
    }
  }, []);

  return useMemo(
    () => ({
      me: session.me,
      isReady,
      isLogged: !!session.me,
      refreshSession,
      logout,
    }),
    [isReady, logout, refreshSession, session.me],
  );
}
