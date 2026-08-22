"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Banknote,
  Check,
  Minus,
  Plus,
  QrCode,
  ShoppingBasket,
} from "lucide-react";
import { addTransaction } from "@/lib/db";
import { useCart } from "@/lib/store";
import type { PaymentMethod } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { playClick, playError, playSuccess } from "@/lib/sound";
import { EmptyState } from "@/components/empty-state";
import { QrisPlaceholder } from "@/components/qris-placeholder";
import { SuccessOverlay } from "@/components/success-overlay";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);

  const [mounted, setMounted] = useState(false);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [cashReceived, setCashReceived] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState<{ amount: number; method: PaymentMethod } | null>(
    null
  );

  useEffect(() => setMounted(true), []);

  const total = useMemo(
    () => items.reduce((n, i) => n + i.price * i.qty, 0),
    [items]
  );
  const count = useMemo(() => items.reduce((n, i) => n + i.qty, 0), [items]);

  const received = Number.parseInt(cashReceived.replace(/\D/g, ""), 10) || 0;
  const change = received - total;
  const canPay =
    method !== null &&
    (method === "qris" || (received > 0 && change >= 0)) &&
    !processing;

  const pay = async () => {
    if (!canPay || !method || items.length === 0) return;
    setProcessing(true);
    try {
      await addTransaction({
        id: crypto.randomUUID(),
        items: items.map(({ productId, name, price, qty, photo }) => ({
          productId,
          name,
          price,
          qty,
          photo,
        })),
        total,
        method,
        createdAt: Date.now(),
      });
      playSuccess();
      setDone({ amount: total, method });
      useCart.getState().clearCart();
      setTimeout(() => router.push("/purchases"), 1900);
    } catch {
      playError();
      setProcessing(false);
    }
  };

  if (done) return <SuccessOverlay amount={done.amount} method={done.method} />;

  if (mounted && items.length === 0) {
    return (
      <div className="mx-auto max-w-[720px]">
        <EmptyState
          icon={ShoppingBasket}
          title="Keranjang kosong"
          subtitle="Tidak ada yang perlu dibayar. Pilih produk dulu di halaman POS."
          actionHref="/"
          actionLabel="Kembali ke POS"
        />
      </div>
    );
  }

  const quickCash = [20000, 50000, 100000];

  return (
    <div className="mx-auto max-w-[680px] pb-4">
      <button
        type="button"
        onClick={() => {
          playClick();
          router.push("/");
        }}
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors hover:text-accent"
      >
        <ArrowLeft size={16} strokeWidth={2.2} />
        Kembali ke POS
      </button>

      <h1 className="font-display text-[22px] font-extrabold leading-tight tracking-tight sm:text-2xl">
        Pembayaran
      </h1>
      <p className="mb-4 text-[13px] font-medium text-ink-soft">
        Periksa pesanan, pilih metode bayar, lalu selesaikan transaksi.
      </p>

      {/* Order review */}
      <section aria-label="Ringkasan pesanan" className="surface rounded-card p-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-ink-faint">
          Ringkasan Pesanan
        </h2>
        <ul className="mt-1 max-h-64 divide-y divide-line/70 overflow-y-auto">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.productId}
                layout
                exit={{ opacity: 0, x: -24 }}
                className="flex items-center gap-3 py-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
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
                <span className="w-20 shrink-0 text-right text-sm font-bold tabular-nums">
                  {formatRupiah(item.price * item.qty)}
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <div className="mt-2 flex items-baseline justify-between border-t border-dashed border-line pt-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">
              Total Bayar · {count} item
            </p>
            <motion.p
              key={total}
              initial={{ scale: 0.96, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display text-3xl font-extrabold tracking-tight tabular-nums text-accent-deep"
            >
              {formatRupiah(total)}
            </motion.p>
          </div>
        </div>
      </section>

      {/* Method picker */}
      <section aria-label="Metode pembayaran" className="mt-4">
        <h2 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-ink-faint">
          Metode Pembayaran
        </h2>
        <div role="radiogroup" className="grid grid-cols-2 gap-3">
          <MethodOption
            selected={method === "qris"}
            onSelect={() => {
              playClick();
              setMethod("qris");
            }}
            icon={<QrCode size={26} strokeWidth={1.9} />}
            label="QRIS"
            sub="Scan & bayar"
          />
          <MethodOption
            selected={method === "cash"}
            onSelect={() => {
              playClick();
              setMethod("cash");
            }}
            icon={<Banknote size={26} strokeWidth={1.9} />}
            label="Uang Tunai"
            sub="Hitung kembalian"
          />
        </div>
      </section>

      {/* Method detail */}
      <AnimatePresence mode="wait">
        {method === "qris" && (
          <motion.section
            key="qris"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            aria-label="Pembayaran QRIS"
            className="surface mt-4 rounded-card p-5"
          >
            <QrisPlaceholder seed={total + count * 7919} />
          </motion.section>
        )}

        {method === "cash" && (
          <motion.section
            key="cash"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            aria-label="Pembayaran tunai"
            className="surface mt-4 rounded-card p-5"
          >
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-soft">
                Uang Diterima
              </span>
              <span className="relative block">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-display text-lg font-extrabold text-ink-faint">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={cashReceived ? Number.parseInt(cashReceived, 10).toLocaleString("id-ID") : ""}
                  onChange={(e) =>
                    setCashReceived(e.target.value.replace(/[^\d]/g, ""))
                  }
                  placeholder="0"
                  autoFocus
                  className="h-14 w-full rounded-xl border border-line bg-page pl-12 pr-4 font-display text-xl font-extrabold tabular-nums outline-none transition-colors placeholder:text-ink-faint focus:border-accent focus:bg-card"
                />
              </span>
            </label>

            <div className="mt-2.5 flex flex-wrap gap-2">
              <QuickChip
                label="Uang pas"
                onClick={() => {
                  playClick();
                  setCashReceived(String(total));
                }}
              />
              {quickCash.map((v) => (
                <QuickChip
                  key={v}
                  label={`${v / 1000}rb`}
                  onClick={() => {
                    playClick();
                    setCashReceived(String(v));
                  }}
                />
              ))}
            </div>

            <div
              aria-live="polite"
              className="mt-4 flex items-baseline justify-between rounded-xl bg-page px-4 py-3"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                {change >= 0 ? "Kembalian" : "Masih Kurang"}
              </span>
              <span
                className={`font-display text-xl font-extrabold tabular-nums ${
                  change >= 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {formatRupiah(Math.abs(change))}
              </span>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Pay button */}
      <motion.button
        type="button"
        disabled={!canPay}
        whileTap={canPay ? { scale: 0.98 } : undefined}
        onClick={() => void pay()}
        className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-accent font-display text-lg font-extrabold tracking-wide text-white shadow-pop transition-colors hover:bg-accent-strong disabled:pointer-events-none disabled:opacity-40"
      >
        {processing ? (
          "Memproses…"
        ) : (
          <>
            <Check size={19} strokeWidth={2.8} />
            Bayar {formatRupiah(total)}
          </>
        )}
      </motion.button>
      {!method && (
        <p className="mt-2 text-center text-xs font-medium text-ink-faint">
          Pilih metode pembayaran terlebih dahulu.
        </p>
      )}
    </div>
  );
}

function MethodOption({
  selected,
  onSelect,
  icon,
  label,
  sub,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      whileTap={{ scale: 0.97 }}
      onClick={onSelect}
      className={`relative flex flex-col items-center gap-1.5 rounded-2xl border-2 p-4 transition-colors ${
        selected
          ? "border-accent bg-accent-tint"
          : "border-line bg-card hover:border-ink-faint"
      }`}
    >
      {selected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full bg-accent text-white"
        >
          <Check size={12} strokeWidth={3.2} />
        </motion.span>
      )}
      <span className={selected ? "text-accent" : "text-ink-soft"}>{icon}</span>
      <span className="text-sm font-bold">{label}</span>
      <span className="text-[11px] font-medium text-ink-faint">{sub}</span>
    </motion.button>
  );
}

function QuickChip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-line bg-card px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent"
    >
      {label}
    </button>
  );
}
