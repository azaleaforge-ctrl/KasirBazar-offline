"use client";

import { useEffect, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function KpiCard({
  label,
  value,
  format,
  icon: Icon,
  delta,
}: {
  label: string;
  value: number;
  format: (n: number) => string;
  icon: LucideIcon;
  /** Period-over-period change in %, or null when the previous period has no data. */
  delta?: number | null;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, reduce]);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: {
          opacity: 1,
          y: 0,
          transition: { type: "spring", stiffness: 260, damping: 24 },
        },
      }}
      className="surface relative overflow-hidden rounded-card p-5"
    >
      <span
        aria-hidden
        className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-accent-tint"
      />
      <div className="relative flex items-start justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
          {label}
        </span>
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent-tint text-accent">
          <Icon size={17} strokeWidth={2.1} />
        </span>
      </div>
      <p className="relative mt-3 font-display text-[26px] font-extrabold leading-none tracking-tight tabular-nums">
        {format(display)}
      </p>
      {delta !== undefined && (
        <motion.p
          key={`${delta}`}
          initial={reduce ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className={`relative mt-2 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
            delta === null
              ? "bg-slate-100 text-ink-faint"
              : delta >= 0
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
          }`}
        >
          {delta === null ? (
            "—"
          ) : (
            <>
              {delta >= 0 ? (
                <ArrowUpRight size={12} strokeWidth={2.5} />
              ) : (
                <ArrowDownRight size={12} strokeWidth={2.5} />
              )}
              {Math.abs(Math.round(delta))}%
            </>
          )}
        </motion.p>
      )}
    </motion.div>
  );
}

export const kpiVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
