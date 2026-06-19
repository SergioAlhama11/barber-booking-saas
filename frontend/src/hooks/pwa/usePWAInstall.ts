import { useEffect, useState } from "react";

const STORAGE_KEY = "pwa_install_dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function usePWAInstall() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  const isIOS =
    typeof window !== "undefined" &&
    /iPhone|iPad|iPod/i.test(navigator.userAgent);

  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      "standalone" in window.navigator);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);

      setTimeout(() => setVisible(true), 4000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    if (isIOS && !isStandalone) {
      setTimeout(() => setVisible(true), 4000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isIOS, isStandalone]);

  const install = async () => {
    if (!prompt) return;

    prompt.prompt();
    await prompt.userChoice;

    setPrompt(null);
    setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  return {
    install,
    dismiss,
    visible,
    canInstall: !!prompt,
    isIOS,
    isStandalone,
  };
}
