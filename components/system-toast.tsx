"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { useSystemToast } from "@/lib/system-toast";

const AUTO_DISMISS_MS = 5000;
const spring = { type: "spring", stiffness: 280, damping: 26 } as const;

export function SystemToast() {
  const message = useSystemToast((s) => s.message);
  const hide = useSystemToast((s) => s.hide);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) setVisible(true);
  }, [message]);

  const dismiss = useCallback(() => {
    setVisible(false);
    hide();
    window.location.reload();
  }, [hide]);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [visible, dismiss]);

  if (!message) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-3 sm:inset-x-auto sm:right-4 sm:items-end">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={spring}
            role="status"
            className="surface relative flex w-[min(92vw,360px)] items-start gap-3 overflow-hidden rounded-card bg-accent-tint p-3.5 pr-10 shadow-pop ring-1 ring-accent/20"
          >
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-1 bg-accent"
            />
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent text-white">
              <CheckCircle2 size={18} strokeWidth={2.2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold leading-snug text-accent-strong">
                Reset selesai
              </span>
              <span className="mt-0.5 block text-xs font-medium leading-snug text-ink-soft">
                {message}
              </span>
            </span>
            <button
              type="button"
              aria-label="Tutup"
              onClick={dismiss}
              className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-white/70 hover:text-ink"
            >
              <X size={14} strokeWidth={2.4} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
