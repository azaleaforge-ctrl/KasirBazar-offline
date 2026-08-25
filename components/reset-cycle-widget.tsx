"use client";

import { useCallback, useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import {
  getResetInfo,
  manualReset,
  type ResetInfo,
} from "@/lib/reset-cycle";
import { playClick } from "@/lib/sound";
import { useSystemToast } from "@/lib/system-toast";

const THEME = {
  hidden: {
    card: "bg-card ring-1 ring-line",
    circle: "bg-accent-tint text-accent",
    button: "text-accent-strong hover:bg-accent-tint",
  },
  warn: {
    card: "bg-amber-50/80 ring-1 ring-amber-200",
    circle: "bg-amber-100 text-amber-600",
    button: "text-amber-700 hover:bg-amber-100",
  },
  critical: {
    card: "bg-red-50/80 ring-1 ring-red-200",
    circle: "bg-red-100 text-red-600",
    button: "text-red-700 hover:bg-red-100",
  },
} as const;

export function ResetCycleWidget() {
  const [info, setInfo] = useState<ResetInfo | null>(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    let alive = true;
    const refresh = () => {
      getResetInfo().then((next) => {
        if (alive) setInfo(next);
      });
    };
    refresh();
    const timer = setInterval(refresh, 30000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const handleReset = useCallback(async () => {
    playClick();
    setResetting(true);
    try {
      await manualReset();
      setInfo(await getResetInfo());
      useSystemToast
        .getState()
        .show("Reset manual selesai, akan refresh otomatis 5 detik lagi");
    } finally {
      setResetting(false);
    }
  }, []);

  if (!info) return null;

  const theme = THEME[info.status];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      aria-label="Pengingat reset data bulanan"
      className={`surface flex flex-col gap-3 rounded-card p-4 shadow-pop sm:flex-row sm:items-center sm:gap-3 ${theme.card}`}
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${theme.circle}`}
        aria-hidden
      >
        <RotateCcw size={18} strokeWidth={2.2} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-display text-sm font-extrabold tracking-tight">
          Reset Data Bulanan
        </span>
        <span className="mt-0.5 block text-xs font-medium text-ink-soft">
          {info.label}
        </span>
      </span>

      <button
        type="button"
        aria-label="Reset data sekarang"
        disabled={resetting}
        onClick={() => void handleReset()}
        className={`inline-flex h-9 shrink-0 items-center justify-center gap-1.5 self-start rounded-lg px-3.5 text-xs font-bold transition-colors disabled:opacity-50 sm:self-auto ${theme.button}`}
      >
        <RotateCcw size={13} strokeWidth={2.5} className={resetting ? "animate-spin" : undefined} />
        {resetting ? "Mereset…" : "Reset sekarang"}
      </button>
    </motion.section>
  );
}
