"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { PaymentMethod } from "@/lib/types";
import { formatRupiah } from "@/lib/format";

const CONFETTI_COLORS = ["#0f766e", "#14b8a6", "#d97706", "#fbbf24", "#134e4a"];

export function SuccessOverlay({
  amount,
  method,
}: {
  amount: number;
  method: PaymentMethod;
}) {
  const reduce = useReducedMotion();

  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        left: 6 + Math.random() * 88,
        dx: -150 + Math.random() * 300,
        rotate: -260 + Math.random() * 520,
        delay: Math.random() * 0.28,
        w: 5 + Math.random() * 6,
        h: 9 + Math.random() * 8,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[70] grid place-items-center bg-white/92 backdrop-blur-md"
      role="status"
    >
      <div className="relative text-center">
        {/* Confetti */}
        {!reduce && (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {pieces.map((p) => (
              <motion.span
                key={p.id}
                initial={{ x: 0, y: -12, opacity: 1, rotate: 0 }}
                animate={{ x: p.dx, y: 300, opacity: 0, rotate: p.rotate }}
                transition={{ duration: 1.15, delay: p.delay, ease: "easeIn" }}
                style={{
                  position: "absolute",
                  left: `${p.left}%`,
                  top: 30,
                  width: p.w,
                  height: p.h,
                  background: p.color,
                  borderRadius: p.w > p.h ? "999px" : "3px",
                }}
              />
            ))}
          </div>
        )}

        {/* Checkmark */}
        <motion.div
          initial={reduce ? false : { scale: 0.35, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 17 }}
          className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-accent-tint ring-8 ring-accent/10"
        >
          <svg viewBox="0 0 24 24" width={44} height={44} fill="none" aria-hidden>
            <motion.path
              d="M5 13l5 5L19 7"
              stroke="#0f766e"
              strokeWidth={2.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: reduce ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45, delay: 0.18, ease: "easeOut" }}
            />
          </svg>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.35 }}
        >
          <h2 className="mt-6 font-display text-2xl font-extrabold tracking-tight">
            Pembayaran Berhasil!
          </h2>
          <p className="mt-1.5 text-sm font-semibold tabular-nums text-ink-soft">
            {formatRupiah(amount)} · {method === "qris" ? "QRIS" : "Uang Tunai"}
          </p>
          <p className="mt-4 text-xs font-medium text-ink-faint">
            Membuka riwayat pembelian…
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
