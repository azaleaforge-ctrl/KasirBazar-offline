"use client";

import { Minus, Package, Plus } from "lucide-react";
import { motion } from "framer-motion";
import type { CartItem } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { playClick } from "@/lib/sound";
import { useCart } from "@/lib/store";

export function CartLine({ item }: { item: CartItem }) {
  const setQty = useCart((s) => s.setQty);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -28, transition: { duration: 0.18 } }}
      className="flex items-center gap-3 py-3"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-accent-tint text-accent">
        {item.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.photo}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Package size={17} strokeWidth={2} />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold leading-snug">
          {item.name}
        </span>
        <span className="block text-[11px] font-medium tabular-nums text-ink-faint">
          {formatRupiah(item.price)} / pcs
        </span>
      </span>

      <span className="flex items-center gap-0.5 rounded-full border border-line bg-page p-0.5">
        <button
          type="button"
          aria-label={`Kurangi ${item.name}`}
          onClick={() => {
            playClick();
            setQty(item.productId, item.qty - 1);
          }}
          className="grid h-7 w-7 place-items-center rounded-full text-ink-soft transition-colors hover:bg-card hover:text-accent"
        >
          <Minus size={13} strokeWidth={2.5} />
        </button>
        <span className="w-6 text-center text-sm font-bold tabular-nums">
          {item.qty}
        </span>
        <button
          type="button"
          aria-label={`Tambah ${item.name}`}
          onClick={() => {
            playClick();
            setQty(item.productId, item.qty + 1);
          }}
          className="grid h-7 w-7 place-items-center rounded-full text-ink-soft transition-colors hover:bg-card hover:text-accent"
        >
          <Plus size={13} strokeWidth={2.5} />
        </button>
      </span>

      <span className="w-[4.5rem] shrink-0 text-right text-[13px] font-bold tabular-nums">
        {formatRupiah(item.price * item.qty)}
      </span>
    </motion.li>
  );
}
