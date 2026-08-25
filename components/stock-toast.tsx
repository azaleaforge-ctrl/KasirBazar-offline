"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, PackageX, X } from "lucide-react";
import {
  useNotifications,
  useProductFocus,
  type AppNotification,
} from "@/lib/notifications";
import { playNotify } from "@/lib/sound";

const spring = { type: "spring", stiffness: 280, damping: 26 } as const;

function message(n: AppNotification): string {
  return n.kind === "empty"
    ? `Stok "${n.productName}" habis.`
    : `Stok "${n.productName}" menipis — tersisa ${n.stock}.`;
}

export function Toast() {
  const items = useNotifications((s) => s.items);
  const markRead = useNotifications((s) => s.markRead);
  const router = useRouter();
  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const seen = useRef<Set<string>>(new Set());
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Seed once with pre-existing ids so a page reload doesn't re-toast old
  // alerts. Runs before the items effect below, which skips seeded ids.
  useEffect(() => {
    for (const item of useNotifications.getState().items) {
      seen.current.add(item.id);
    }
  }, []);

  // Hiding the popup only — the notification stays in the bell list.
  const dismissToast = (id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const fresh = items.filter((i) => !seen.current.has(i.id));
    if (fresh.length === 0) return;
    for (const item of fresh) {
      seen.current.add(item.id);
      setToasts((prev) => [...prev, item]);
      playNotify();
      // Auto-dismiss after 5s.
      timers.current.set(
        item.id,
        setTimeout(() => dismissToast(item.id), 5000)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Clear any pending timers on unmount.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
      pending.clear();
    };
  }, []);

  const openProduct = (n: AppNotification) => {
    useProductFocus.getState().focus(n.productId);
    router.push("/products");
    markRead(n.id);
    dismissToast(n.id);
  };

  return (
    <div className="fixed right-4 top-4 z-[60] flex w-[min(92vw,360px)] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={spring}
            role="status"
            tabIndex={0}
            onClick={() => openProduct(toast)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openProduct(toast);
              }
            }}
            className={`surface relative flex cursor-pointer items-start gap-3 overflow-hidden rounded-card p-3.5 pr-10 shadow-pop ${
              toast.kind === "empty"
                ? "bg-red-50/90 ring-1 ring-red-200"
                : "bg-amber-50/90 ring-1 ring-amber-200"
            }`}
          >
            <span
              aria-hidden
              className={`absolute inset-y-0 left-0 w-1 ${
                toast.kind === "empty" ? "bg-red-500" : "bg-amber-500"
              }`}
            />
            <span
              className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                toast.kind === "empty"
                  ? "bg-red-100 text-red-600"
                  : "bg-amber-100 text-amber-600"
              }`}
            >
              {toast.kind === "empty" ? (
                <PackageX size={18} strokeWidth={2.2} />
              ) : (
                <AlertTriangle size={18} strokeWidth={2.2} />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold leading-snug">
                {toast.productName}
              </span>
              <span className="mt-0.5 block text-xs font-medium leading-snug text-ink-soft">
                {message(toast)}
              </span>
            </span>
            <button
              type="button"
              aria-label="Tutup notifikasi"
              onClick={(e) => {
                e.stopPropagation();
                dismissToast(toast.id);
              }}
              className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-white/70 hover:text-ink"
            >
              <X size={14} strokeWidth={2.4} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
