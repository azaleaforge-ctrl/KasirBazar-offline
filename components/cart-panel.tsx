"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, PackageOpen, Trash2 } from "lucide-react";
import { useCart } from "@/lib/store";
import { formatRupiah } from "@/lib/format";
import { playClick } from "@/lib/sound";
import { CartLine } from "./cart-line";

export function CartPanel() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clearCart);

  const count = items.reduce((n, i) => n + i.qty, 0);
  const total = items.reduce((n, i) => n + i.price * i.qty, 0);

  return (
    <aside
      aria-label="Keranjang belanja"
      className="sticky top-16 flex h-[calc(100dvh-4rem)] w-[350px] shrink-0 flex-col border-l border-line bg-card"
    >
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <h2 className="flex items-center gap-2 font-display text-base font-extrabold tracking-tight">
          Keranjang
          {count > 0 && (
            <span className="rounded-full bg-accent-tint px-2 py-0.5 text-[11px] font-bold tabular-nums text-accent-strong ring-1 ring-accent/15">
              {count}
            </span>
          )}
        </h2>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => {
              playClick();
              clearCart();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-ink-faint transition-colors hover:bg-page hover:text-red-600"
          >
            <Trash2 size={13} strokeWidth={2.2} />
            Kosongkan
          </button>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-accent-tint text-accent">
              <PackageOpen size={24} strokeWidth={2} />
            </span>
            <p className="text-sm font-bold">Keranjang masih kosong</p>
            <p className="max-w-[200px] text-xs leading-relaxed text-ink-faint">
              Pilih produk di sebelah kiri untuk mulai mencatat penjualan.
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

      <footer className="border-t border-line px-5 pb-5 pt-4">
        <div className="mb-1 flex items-baseline justify-between text-xs font-medium text-ink-soft">
          <span>Total item</span>
          <span className="tabular-nums">{count}</span>
        </div>
        <div className="mb-4 flex items-baseline justify-between">
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
          onClick={() => {
            playClick();
            router.push("/checkout");
          }}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-bold text-white shadow-sm transition-colors hover:bg-accent-strong disabled:pointer-events-none disabled:opacity-40"
        >
          Bayar
          <ArrowRight size={16} strokeWidth={2.5} />
        </motion.button>
      </footer>
    </aside>
  );
}
