const AUTH_EMAIL_KEY = "auth_email";
const AUTH_SESSION_EVENT = "auth-session-changed";

export type AuthSession = {
  email: string | null;
};

function emitAuthSessionChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function readAuthSession(): AuthSession {
  if (typeof window === "undefined") {
    return { email: null };
  }

  return {
    email: localStorage.getItem(AUTH_EMAIL_KEY),
  };
}

export function getAuthEmail() {
  return readAuthSession().email;
}

export function setAuthSession(session: AuthSession) {
  if (typeof window === "undefined") return;

  if (session.email) {
    localStorage.setItem(AUTH_EMAIL_KEY, session.email);
  } else {
    localStorage.removeItem(AUTH_EMAIL_KEY);
  }

  emitAuthSessionChanged();
}

export function setAuthEmail(email: string) {
  setAuthSession({ email });
}

export function clearAuthSession() {
  setAuthSession({ email: null });
}

export function subscribeToAuthSession(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === AUTH_EMAIL_KEY) {
      callback();
    }
  };

  window.addEventListener(AUTH_SESSION_EVENT, callback);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(AUTH_SESSION_EVENT, callback);
    window.removeEventListener("storage", handleStorage);
  };
}
