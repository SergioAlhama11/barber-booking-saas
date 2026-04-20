import { useEffect, useState } from "react";

const STORAGE_KEY = "pwa_install_dismissed";

export function usePWAInstall() {
  const [prompt, setPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  const isIOS =
    typeof window !== "undefined" &&
    /iPhone|iPad|iPod/i.test(navigator.userAgent);

  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    const handler = (e: any) => {
      e.preventDefault();
      setPrompt(e);

      // ⏱️ delay estilo Uber
      setTimeout(() => setVisible(true), 4000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // iOS fallback (no event)
    if (isIOS && !isStandalone) {
      setTimeout(() => setVisible(true), 4000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

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
