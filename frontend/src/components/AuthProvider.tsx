"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearAuthSession,
  readAuthSession,
  subscribeToAuthSession,
  type AuthSession,
} from "@/services/authSession";
import { getCurrentSession, logoutSession } from "@/services/api";

type AuthContextValue = {
  email: string | null;
  isLogged: boolean;
  isReady: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession>(readAuthSession);
  const [isLogged, setIsLogged] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    return subscribeToAuthSession(async () => {
      const localSession = readAuthSession();
      setSession(localSession);

      try {
        const currentSession = await getCurrentSession();
        setIsLogged(!!currentSession?.email);

        if (currentSession?.email && currentSession.email !== localSession.email) {
          setSession({ email: currentSession.email });
        }
      } catch {
        setIsLogged(false);
      }
    });
  }, []);

  useEffect(() => {
    async function syncSession() {
      try {
        const currentSession = await getCurrentSession();

        if (currentSession?.email) {
          setSession({ email: currentSession.email });
          setIsLogged(true);
        } else {
          setIsLogged(false);
        }
      } finally {
        setIsReady(true);
      }
    }

    syncSession();
  }, []);

  async function logout() {
    await logoutSession();
    clearAuthSession();
    setSession({ email: null });
    setIsLogged(false);
  }

  const value = useMemo(
    () => ({
      email: session.email,
      isLogged,
      isReady,
      logout,
    }),
    [isLogged, isReady, session.email],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }

  return context;
}
