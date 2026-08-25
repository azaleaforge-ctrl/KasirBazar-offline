"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Bell, PackageX, X } from "lucide-react";
import {
  useNotifications,
  useProductFocus,
  type AppNotification,
} from "@/lib/notifications";
import { playClick } from "@/lib/sound";

const spring = { type: "spring", stiffness: 280, damping: 26 } as const;

function message(n: AppNotification): string {
  return n.kind === "empty"
    ? `Stok "${n.productName}" habis.`
    : `Stok "${n.productName}" menipis — tersisa ${n.stock}.`;
}

export function NotificationBell() {
  const items = useNotifications((s) => s.items);
  const markRead = useNotifications((s) => s.markRead);
  const markAllRead = useNotifications((s) => s.markAllRead);
  const dismiss = useNotifications((s) => s.dismiss);
  const clear = useNotifications((s) => s.clear);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const unread = items.filter((i) => !i.read).length;

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const openProduct = (n: AppNotification) => {
    useProductFocus.getState().focus(n.productId);
    router.push("/products");
    markRead(n.id);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label={
          unread > 0 ? `Notifikasi (${unread} belum dibaca)` : "Notifikasi"
        }
        aria-expanded={open}
        onClick={() => {
          playClick();
          setOpen((v) => !v);
        }}
        className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-card text-ink-soft transition-colors hover:text-accent"
      >
        <Bell size={19} strokeWidth={2.2} />
        <AnimatePresence>
          {unread > 0 && (
            <motion.span
              key={unread}
              initial={{ scale: 0.3 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 520, damping: 16 }}
              className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white shadow-sm"
            >
              {unread > 99 ? "99+" : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={spring}
            className="surface absolute right-0 top-12 z-50 w-[min(88vw,340px)] overflow-hidden rounded-card shadow-pop"
          >
            <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
              <span className="font-display text-sm font-extrabold tracking-tight">
                Notifikasi
              </span>
              <div className="flex items-center gap-3">
                {unread > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      markAllRead();
                    }}
                    className="text-xs font-bold text-accent transition-colors hover:text-accent-strong"
                  >
                    Tandai dibaca
                  </button>
                )}
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      clear();
                    }}
                    className="text-xs font-bold text-ink-faint transition-colors hover:text-red-600"
                  >
                    Hapus semua
                  </button>
                )}
              </div>
            </div>

            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs font-medium text-ink-faint">
                Belum ada notifikasi.
              </p>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {items.map((n) => (
                  <li key={n.id} className="relative">
                    <button
                      type="button"
                      onClick={() => openProduct(n)}
                      className="flex w-full items-start gap-3 px-4 py-3 pr-10 text-left transition-colors hover:bg-page"
                    >
                      <span
                        className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                          n.kind === "empty"
                            ? "bg-red-100 text-red-600"
                            : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        {n.kind === "empty" ? (
                          <PackageX size={15} strokeWidth={2.2} />
                        ) : (
                          <AlertTriangle size={15} strokeWidth={2.2} />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-[13px] font-bold ${
                            n.read ? "text-ink-soft" : "text-accent-strong"
                          }`}
                        >
                          {n.productName}
                        </span>
                        <span className="mt-0.5 block text-xs font-medium leading-snug text-ink-soft">
                          {message(n)}
                        </span>
                      </span>
                      {!n.read && (
                        <span
                          aria-hidden
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent"
                        />
                      )}
                    </button>
                    <button
                      type="button"
                      aria-label="Hapus notifikasi"
                      onClick={(e) => {
                        e.stopPropagation();
                        playClick();
                        dismiss(n.id);
                      }}
                      className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-white/70 hover:text-ink"
                    >
                      <X size={14} strokeWidth={2.4} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
