"use client";

import { useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { Package, Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { playAdd, playError } from "@/lib/sound";
import { useCart } from "@/lib/store";

export const gridVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
};

export function ProductCard({ product }: { product: Product }) {
  const addToCart = useCart((s) => s.addToCart);
  const cartQty = useCart(
    (s) => s.items.find((i) => i.productId === product.id)?.qty ?? 0
  );
  const [burst, setBurst] = useState(0);

  const stock = product.stock;
  const reminder = product.stockReminder ?? 0;
  const out = stock != null && stock <= 0;
  const low = stock != null && reminder > 0 && stock > 0 && stock <= reminder;
  const atLimit = stock != null && cartQty >= stock;
  const blocked = out || atLimit;

  const handleAdd = () => {
    if (stock != null && cartQty >= stock) {
      playError();
      return;
    }
    addToCart(product);
    playAdd();
    setBurst((b) => b + 1);
  };

  return (
    <motion.button
      type="button"
      variants={cardVariants}
      whileTap={blocked ? undefined : { scale: 0.96 }}
      onClick={handleAdd}
      disabled={blocked}
      aria-label={`Tambah ${product.name} ke keranjang`}
      className={`surface group relative overflow-hidden rounded-card p-3 text-left transition-shadow duration-300 hover:shadow-pop ${blocked ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <span className="relative block aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-accent-tint to-white">
        {product.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.photo}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-accent/50">
            <Package size={34} strokeWidth={1.6} />
          </span>
        )}
        {product.category && (
          <span className="absolute left-2 top-2 z-10 max-w-[calc(100%-1rem)] truncate rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-strong ring-1 ring-accent/15 backdrop-blur-sm">
            {product.category}
          </span>
        )}
        {/* Signature moment: the "+1" burst on add */}
        <AddBurst burstKey={burst} />
        <span className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-accent text-white opacity-0 shadow-md transition-all duration-200 group-hover:opacity-100 group-active:opacity-0">
          <Plus size={16} strokeWidth={2.5} />
        </span>
      </span>

      <span className="mt-2.5 block truncate text-sm font-bold leading-snug">
        {product.name}
      </span>
      <span className="mt-0.5 block font-display text-[15px] font-extrabold tabular-nums text-accent-deep">
        {formatRupiah(product.price)}
      </span>
      {stock != null && (
        <span
          className={`mt-0.5 block text-[11px] font-semibold ${
            out
              ? "text-red-600"
              : low
                ? "text-amber-600"
                : "text-ink-faint"
          }`}
        >
          {out
            ? "Stok habis"
            : atLimit
              ? `Stok habis di keranjang (${stock})`
              : low
                ? `Stok menipis: ${stock}`
                : `Stok: ${stock}`}
        </span>
      )}
    </motion.button>
  );
}

function AddBurst({ burstKey }: { burstKey: number }) {
  return (
    <AnimatePresence>
      {burstKey > 0 && (
        <motion.span
          key={burstKey}
          initial={{ opacity: 1, y: 4, scale: 0.7 }}
          animate={{ opacity: 0, y: -38, scale: 1.15 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="pointer-events-none absolute right-2 top-2 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white shadow-md"
          aria-hidden
        >
          +1
        </motion.span>
      )}
    </AnimatePresence>
  );
}
