"use client";

import type { AdminSession } from "./types";

const ADMIN_SESSION_EVENT = "admin-session-changed";

let currentSession: AdminSession = {
  me: null,
};

let channel: BroadcastChannel | null = null;

function getChannel() {
  if (
    typeof window === "undefined" ||
    typeof BroadcastChannel === "undefined"
  ) {
    return null;
  }

  if (!channel) {
    channel = new BroadcastChannel("admin-session");
  }

  return channel;
}

function emitAdminSessionChanged() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(ADMIN_SESSION_EVENT));
  getChannel()?.postMessage({ type: ADMIN_SESSION_EVENT });
}

export function readAdminSession(): AdminSession {
  return currentSession;
}

export function setAdminSession(session: AdminSession) {
  currentSession = session;
  emitAdminSessionChanged();
}

export function clearAdminSession() {
  setAdminSession({ me: null });
}

export function subscribeToAdminSession(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleMessage = (event: MessageEvent<{ type?: string }>) => {
    if (event.data?.type === ADMIN_SESSION_EVENT) {
      callback();
    }
  };

  const sessionChannel = getChannel();

  window.addEventListener(ADMIN_SESSION_EVENT, callback);
  sessionChannel?.addEventListener("message", handleMessage);

  return () => {
    window.removeEventListener(ADMIN_SESSION_EVENT, callback);
    sessionChannel?.removeEventListener("message", handleMessage);
  };
}
