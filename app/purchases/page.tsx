"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ReceiptText } from "lucide-react";
import { getTransactions } from "@/lib/db";
import type { PaymentMethod, Transaction } from "@/lib/types";
import { formatDate, formatRupiah } from "@/lib/format";
import { playClick } from "@/lib/sound";
import { EmptyState } from "@/components/empty-state";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function MethodBadge({ method }: { method: PaymentMethod }) {
  return method === "qris" ? (
    <span className="rounded-full bg-accent-tint px-2 py-0.5 text-[11px] font-bold text-accent-strong ring-1 ring-accent/20">
      QRIS
    </span>
  ) : (
    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200">
      Tunai
    </span>
  );
}

function DateCoin({ ts }: { ts: number }) {
  const d = new Date(ts);
  return (
    <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-accent-tint leading-none text-accent-deep ring-1 ring-accent/10">
      <span className="font-display text-base font-extrabold tabular-nums">
        {d.getDate()}
      </span>
      <span className="mt-0.5 text-[9px] font-bold uppercase tracking-wider">
        {MONTHS[d.getMonth()]}
      </span>
    </span>
  );
}

function PurchaseRow({
  tx,
  open,
  onToggle,
}: {
  tx: Transaction;
  open: boolean;
  onToggle: () => void;
}) {
  const itemCount = tx.items.reduce((s, i) => s + i.qty, 0);

  return (
    <li className="surface overflow-hidden rounded-card">
      <button
        type="button"
        onClick={() => {
          playClick();
          onToggle();
        }}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-page/60"
      >
        <DateCoin ts={tx.createdAt} />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <MethodBadge method={tx.method} />
            <span className="text-xs font-medium tabular-nums text-ink-faint">
              {itemCount} item · {formatDate(tx.createdAt)}
            </span>
          </span>
          <span className="mt-1 block truncate text-xs font-medium text-ink-faint">
            {tx.items.map((i) => i.name).join(", ")}
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block font-display text-[15px] font-extrabold tabular-nums">
            {formatRupiah(tx.total)}
          </span>
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-ink-faint"
        >
          <ChevronDown size={18} strokeWidth={2.2} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
          >
            <div className="border-t border-line px-4 pb-4 pt-2">
              <ul className="divide-y divide-line/70">
                {tx.items.map((i) => (
                  <li
                    key={i.productId}
                    className="flex items-center gap-3 py-2.5"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-accent-tint text-accent/60">
                      {i.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                         <img src={i.photo} alt={i.name} className="h-full w-full object-cover" />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                      {i.name}
                      <span className="ml-1.5 text-xs font-medium tabular-nums text-ink-faint">
                        ×{i.qty}
                      </span>
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-ink-soft">
                      {formatRupiah(i.price * i.qty)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex items-baseline justify-between border-t border-dashed border-line pt-3">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-faint">
                  Total ({tx.method === "qris" ? "QRIS" : "Tunai"})
                </span>
                <span className="font-display text-lg font-extrabold tabular-nums text-accent-deep">
                  {formatRupiah(tx.total)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export default function PurchasesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    getTransactions()
      .then((rows) =>
        setTransactions(rows.sort((a, b) => b.createdAt - a.createdAt))
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-[820px]">
      <header className="mb-5">
        <h1 className="font-display text-[22px] font-extrabold leading-tight tracking-tight sm:text-2xl">
          Pembelian
        </h1>
        <p className="text-[13px] font-medium text-ink-soft">
          Riwayat transaksi yang sudah selesai. Ketuk untuk melihat detail.
        </p>
      </header>

      {loading ? (
        <div className="space-y-3" aria-hidden>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="surface flex animate-pulse items-center gap-4 rounded-card p-4">
              <div className="h-12 w-12 rounded-xl bg-page" />
              <div className="flex-1">
                <div className="h-3 w-24 rounded bg-page" />
                <div className="mt-2 h-3 w-40 rounded bg-page" />
              </div>
              <div className="h-4 w-20 rounded bg-page" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="Belum ada transaksi"
          subtitle="Setiap pembayaran yang selesai akan tercatat di sini, lengkap dengan rinciannya."
          actionHref="/"
          actionLabel="Mulai Jualan"
        />
      ) : (
        <ul className="space-y-3">
          {transactions.map((tx) => (
            <PurchaseRow
              key={tx.id}
              tx={tx}
              open={openId === tx.id}
              onToggle={() => setOpenId(openId === tx.id ? null : tx.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
