"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Full-screen splash shown on every full page load.
 * Server-rendered with the initial HTML (client components SSR too), so it
 * paints instantly with zero blank flash, then fades out after mount.
 * Root layout never remounts on SPA navigation → refresh-only by design.
 */
export function SplashScreen() {
  const [show, setShow] = useState(true);
  const reduce = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          id="splash"
          role="status"
          aria-label="Memuat"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: reduce ? 1 : 1.04,
            transition: { duration: reduce ? 0 : 0.45, ease: "easeInOut" },
          }}
          className="pointer-events-none fixed inset-0 z-[100] grid place-items-center bg-page"
        >
          <div className="flex flex-col items-center gap-5">
            <div className="relative grid h-24 w-24 place-items-center">
              {/* Spinner ring */}
              <span
                aria-hidden
                className="absolute inset-0 animate-spin rounded-full border-[3px] border-accent/15 border-t-accent"
                style={{ animationDuration: "1.2s" }}
              />
              {/* Basket mark - inlined from public/icon.svg (zero extra request) */}
              <svg
                viewBox="0 0 512 512"
                className="h-16 w-16 drop-shadow-sm"
                aria-hidden
              >
                <rect width="512" height="512" rx="112" fill="#0F766E" />
                <g
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="30"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M205 205 C205 150 307 150 307 205" />
                  <path d="M165 215 L347 215 L322 360 L190 360 Z" />
                  <path d="M205 215 L222 360 M256 215 L256 360 M307 215 L290 360" />
                </g>
              </svg>
            </div>

            <div className="text-center">
              <p className="font-display text-lg font-extrabold tracking-tight text-ink">
                Kasir Bazar
              </p>
              <p className="mt-0.5 text-xs font-medium text-ink-faint">
                Menyiapkan kasir…
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
