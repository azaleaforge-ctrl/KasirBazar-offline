"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MonitorDown } from "lucide-react";
import { playClick } from "@/lib/sound";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari reports installation this way
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

/**
 * Prominent PWA install button for the /install page.
 * Hidden only when the app already runs installed (standalone).
 * One tap installs when the browser supports it (localhost/HTTPS);
 * otherwise it points the user to the manual steps on the page.
 */
export function InstallButton() {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      if (!isStandalone()) setPromptEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleClick = () => {
    playClick();
    if (!promptEvent) {
      setShowHint(true);
      return;
    }
    setBusy(true);
    void promptEvent
      .prompt()
      .then(() => promptEvent.userChoice)
      .catch(() => {})
      .finally(() => {
        setBusy(false);
        setPromptEvent(null);
      });
  };

  if (installed) return null;

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={busy}
        whileTap={{ scale: 0.97 }}
        className="inline-flex h-14 items-center gap-2.5 rounded-2xl bg-accent px-8 font-display text-lg font-extrabold tracking-wide text-white shadow-pop transition-colors hover:bg-accent-strong disabled:opacity-60"
      >
        {busy ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <MonitorDown size={20} strokeWidth={2.4} />
        )}
        Pasang Kasir Bazar
      </motion.button>

      <AnimatePresence>
        {showHint && !promptEvent && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-sm text-center text-xs font-medium leading-relaxed text-ink-soft"
            role="note"
          >
            Instal otomatis butuh koneksi HTTPS. Jika tombol ini tidak
            merespons, ikuti langkah manual di bawah.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
