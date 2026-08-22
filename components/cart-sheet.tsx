"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, PackageOpen, X } from "lucide-react";
import { useCart } from "@/lib/store";
import { formatRupiah } from "@/lib/format";
import { playClick } from "@/lib/sound";
import { CartLine } from "./cart-line";
import { consumePendingOpen } from "./cart-bus";

/**
 * Mobile cart: a floating "Bayar" dock above the tab bar,
 * and the full cart as a draggable bottom sheet.
 */
export function MobileCartDock() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clearCart);

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  const count = items.reduce((n, i) => n + i.qty, 0);
  const total = items.reduce((n, i) => n + i.price * i.qty, 0);

  useEffect(() => {
    setMounted(true);
    if (consumePendingOpen()) setOpen(true);
    const onEvent = () => setOpen(true);
    window.addEventListener("kasir:cart", onEvent);
    return () => window.removeEventListener("kasir:cart", onEvent);
  }, []);

  // Lock body scroll while the sheet is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape closes the sheet
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!mounted) return null;

  const goCheckout = () => {
    playClick();
    setOpen(false);
    router.push("/checkout");
  };

  return (
    <>
      {/* Floating total + Bayar dock */}
      <AnimatePresence>
        {count > 0 && !open && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed inset-x-4 bottom-[5.5rem] z-30 flex items-center justify-between gap-3 rounded-2xl border border-line bg-card p-2.5 pl-4 shadow-pop"
          >
            <button
              type="button"
              onClick={() => {
                playClick();
                setOpen(true);
              }}
              className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
              aria-label="Buka keranjang"
            >
              <span className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-faint">
                  {count} item
                </span>
                <span className="block truncate font-display text-lg font-extrabold tabular-nums leading-tight text-accent-deep">
                  {formatRupiah(total)}
                </span>
              </span>
              <span className="shrink-0 text-[11px] font-semibold text-accent underline-offset-2">
                Lihat
              </span>
            </button>
            <button
              type="button"
              onClick={goCheckout}
              className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-accent px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-accent-strong"
            >
              Bayar
              <ArrowRight size={15} strokeWidth={2.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom sheet */}
      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Tutup keranjang"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-ink/45 backdrop-blur-[2px]"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Keranjang belanja"
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 110 || info.velocity.y > 600)
                  setOpen(false);
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[82dvh] flex-col rounded-t-3xl bg-card shadow-pop"
            >
              <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 cursor-grab rounded-full bg-line active:cursor-grabbing" />

              <header className="flex items-center justify-between px-5 pb-1 pt-3">
                <h2 className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight">
                  Keranjang
                  {count > 0 && (
                    <span className="rounded-full bg-accent-tint px-2 py-0.5 text-[11px] font-bold tabular-nums text-accent-strong ring-1 ring-accent/15">
                      {count}
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-1">
                  {items.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        playClick();
                        clearCart();
                      }}
                      className="rounded-lg px-2 py-1.5 text-xs font-semibold text-ink-faint transition-colors hover:text-red-600"
                    >
                      Kosongkan
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Tutup keranjang"
                    onClick={() => {
                      playClick();
                      setOpen(false);
                    }}
                    className="grid h-9 w-9 place-items-center rounded-xl text-ink-soft transition-colors hover:bg-page"
                  >
                    <X size={18} strokeWidth={2.2} />
                  </button>
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto px-5">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-12 text-center">
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-accent-tint text-accent">
                      <PackageOpen size={24} strokeWidth={2} />
                    </span>
                    <p className="text-sm font-bold">Keranjang masih kosong</p>
                    <p className="max-w-[220px] text-xs leading-relaxed text-ink-faint">
                      Ketuk produk di atas untuk memasukkannya ke keranjang.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-line/70">
                    <AnimatePresence initial={false}>
                      {items.map((item) => (
                        <CartLine key={item.productId} item={item} />
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </div>

              <footer className="border-t border-line px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4">
                <div className="mb-3 flex items-baseline justify-between">
                  <span className="text-sm font-bold">Total bayar</span>
                  <motion.span
                    key={total}
                    initial={{ scale: 0.94, opacity: 0.6 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-display text-2xl font-extrabold tabular-nums text-accent-deep"
                  >
                    {formatRupiah(total)}
                  </motion.span>
                </div>
                <motion.button
                  type="button"
                  disabled={items.length === 0}
                  whileTap={items.length > 0 ? { scale: 0.97 } : undefined}
                  onClick={goCheckout}
                  className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-accent-strong disabled:pointer-events-none disabled:opacity-40"
                >
                  Lanjut ke Pembayaran
                  <ArrowRight size={16} strokeWidth={2.5} />
                </motion.button>
              </footer>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
