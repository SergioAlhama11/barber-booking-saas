"use client";

export type AdminMe = {
  id: number;
  email: string;
  barbershopId: number;
  roles: string[];
};

export type AdminSession = {
  token: string | null;
  me: AdminMe | null;
};

const ADMIN_TOKEN_KEY = "admin_auth_token";
const ADMIN_ME_KEY = "admin_auth_me";
const ADMIN_SESSION_EVENT = "admin-session-changed";

function emitAdminSessionChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ADMIN_SESSION_EVENT));
}

function parseAdminMe(value: string | null): AdminMe | null {
  if (!value) return null;

  try {
    return JSON.parse(value) as AdminMe;
  } catch {
    return null;
  }
}

export function readAdminSession(): AdminSession {
  if (typeof window === "undefined") {
    return { token: null, me: null };
  }

  return {
    token: localStorage.getItem(ADMIN_TOKEN_KEY),
    me: parseAdminMe(localStorage.getItem(ADMIN_ME_KEY)),
  };
}

export function getAdminToken() {
  return readAdminSession().token;
}

export function setAdminSession(session: AdminSession) {
  if (typeof window === "undefined") return;

  if (session.token) {
    localStorage.setItem(ADMIN_TOKEN_KEY, session.token);
  } else {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }

  if (session.me) {
    localStorage.setItem(ADMIN_ME_KEY, JSON.stringify(session.me));
  } else {
    localStorage.removeItem(ADMIN_ME_KEY);
  }

  emitAdminSessionChanged();
}

export function clearAdminSession() {
  setAdminSession({ token: null, me: null });
}

export function subscribeToAdminSession(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === ADMIN_TOKEN_KEY || event.key === ADMIN_ME_KEY) {
      callback();
    }
  };

  window.addEventListener(ADMIN_SESSION_EVENT, callback);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(ADMIN_SESSION_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}
