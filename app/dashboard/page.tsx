"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Banknote,
  Coins,
  ReceiptText,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { getTransactions } from "@/lib/db";
import type { Transaction } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { ExportButtons } from "@/components/export-buttons";
import { KpiCard, kpiVariants } from "@/components/kpi-card";
import {
  MethodDonutChart,
  ProductBarChart,
  RevenueAreaChart,
} from "@/components/dashboard-charts";
import { EmptyState } from "@/components/empty-state";
import { ResetCycleWidget } from "@/components/reset-cycle-widget";

const DAY_MS = 86_400_000;
const PERIOD_KEY = "kasir-dash-period";

type PeriodKey = "today" | "7d" | "30d" | "custom";

const PERIODS: ReadonlyArray<{ key: PeriodKey; label: string }> = [
  { key: "today", label: "Hari ini" },
  { key: "7d", label: "7 Hari" },
  { key: "30d", label: "30 Hari" },
  { key: "custom", label: "Custom" },
];

interface Range {
  start: number;
  end: number;
}

function dayKey(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dayLabel(key: string): string {
  const [, m, d] = key.split("-");
  return `${d}/${m}`;
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function parseDateInput(value: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const ts = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime();
  return Number.isNaN(ts) ? null : ts;
}

function resolveRange(
  period: PeriodKey,
  customStart: string,
  customEnd: string
): Range | null {
  const today = startOfDay(Date.now());
  if (period === "today") return { start: today, end: Date.now() };
  if (period === "7d") return { start: today - 6 * DAY_MS, end: Date.now() };
  if (period === "30d") return { start: today - 29 * DAY_MS, end: Date.now() };
  const s = parseDateInput(customStart);
  const e = parseDateInput(customEnd);
  if (s === null || e === null || s > e) return null;
  return { start: s, end: Math.min(e + DAY_MS - 1, Date.now()) };
}

interface Summary {
  revenue: number;
  count: number;
  itemsSold: number;
  avg: number;
}

function summarize(rows: Transaction[]): Summary {
  const revenue = rows.reduce((s, t) => s + t.total, 0);
  const itemsSold = rows.reduce(
    (s, t) => s + t.items.reduce((si, i) => si + i.qty, 0),
    0
  );
  return {
    revenue,
    count: rows.length,
    itemsSold,
    avg: rows.length > 0 ? revenue / rows.length : 0,
  };
}

function deltaPct(current: number, previous: number): number | null {
  return previous > 0 ? ((current - previous) / previous) * 100 : null;
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const reload = () =>
    getTransactions()
      .then((rows) => setTransactions(rows.sort((a, b) => b.createdAt - a.createdAt)))
      .catch(() => {});

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  // Restore saved period preference (UI-only; data always recomputed).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PERIOD_KEY);
      if (saved && PERIODS.some((p) => p.key === saved)) {
        selectPeriod(saved as PeriodKey);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      window.localStorage.setItem(PERIOD_KEY, period);
    } catch {}
  }, [period]);

  const selectPeriod = (key: PeriodKey) => {
    if (key === "custom" && !customStart && !customEnd) {
      const today = startOfDay(Date.now());
      setCustomStart(dayKey(today - 6 * DAY_MS));
      setCustomEnd(dayKey(today));
    }
    setPeriod(key);
  };

  const range = useMemo(
    () => resolveRange(period, customStart, customEnd),
    [period, customStart, customEnd]
  );

  const stats = useMemo(() => {
    if (!range) {
      return {
        revenue: 0,
        count: 0,
        itemsSold: 0,
        avg: 0,
        deltas: { revenue: null, count: null, itemsSold: null, avg: null },
        revenueSeries: [] as Array<{ day: string; total: number }>,
        topProducts: [] as Array<{ name: string; qty: number }>,
        methods: [] as Array<{ name: string; value: number; total: number }>,
      };
    }

    const inRange = (t: Transaction, r: Range) =>
      t.createdAt >= r.start && t.createdAt <= r.end;
    const current = transactions.filter((t) => inRange(t, range));
    // Immediately preceding equal-length span.
    const prevRange: Range = {
      start: range.start - (range.end - range.start + 1),
      end: range.start - 1,
    };
    const previous = transactions.filter((t) => inRange(t, prevRange));

    const nowSum = summarize(current);
    const prevSum = summarize(previous);

    // Revenue per day across the whole selected range (missing days = 0).
    const byDay = new Map<string, number>();
    for (const t of current) {
      const key = dayKey(t.createdAt);
      byDay.set(key, (byDay.get(key) ?? 0) + t.total);
    }
    const revenueSeries: Array<{ day: string; total: number }> = [];
    for (
      let cur = new Date(startOfDay(range.start));
      cur.getTime() <= range.end;
      cur.setDate(cur.getDate() + 1)
    ) {
      const key = dayKey(cur.getTime());
      revenueSeries.push({ day: dayLabel(key), total: byDay.get(key) ?? 0 });
    }

    // Items sold per product (top 8)
    const byProduct = new Map<string, number>();
    for (const t of current) {
      for (const i of t.items) {
        byProduct.set(i.name, (byProduct.get(i.name) ?? 0) + i.qty);
      }
    }
    const topProducts = [...byProduct.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, qty]) => ({
        name: name.length > 16 ? `${name.slice(0, 15)}…` : name,
        qty,
      }));

    // Payment method split
    let qrisCount = 0;
    let cashCount = 0;
    let qrisTotal = 0;
    let cashTotal = 0;
    for (const t of current) {
      if (t.method === "qris") {
        qrisCount += 1;
        qrisTotal += t.total;
      } else {
        cashCount += 1;
        cashTotal += t.total;
      }
    }

    return {
      ...nowSum,
      deltas: {
        revenue: deltaPct(nowSum.revenue, prevSum.revenue),
        count: deltaPct(nowSum.count, prevSum.count),
        itemsSold: deltaPct(nowSum.itemsSold, prevSum.itemsSold),
        avg: deltaPct(nowSum.avg, prevSum.avg),
      },
      revenueSeries,
      topProducts,
      methods: [
        { name: "QRIS", value: qrisCount, total: qrisTotal },
        { name: "Tunai", value: cashCount, total: cashTotal },
      ].filter((m) => m.value > 0),
    };
  }, [transactions, range]);

  const hasSales = transactions.length > 0;

  return (
    <div className="mx-auto max-w-[1200px]">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-extrabold leading-tight tracking-tight sm:text-2xl">
            Dashboard
          </h1>
          <p className="text-[13px] font-medium text-ink-soft">
            Ringkasan performa penjualan bazar Anda.
          </p>
        </div>
        <ExportButtons withImport onImported={() => void reload()} />
      </header>

      <ResetCycleWidget />

      {/* Period filter */}
      <section aria-label="Periode data" className="mb-3 mt-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <div
            role="group"
            aria-label="Pilih periode"
            className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-line bg-card p-1 shadow-card"
          >
            {PERIODS.map((p) => {
              const active = period === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => selectPeriod(p.key)}
                  aria-pressed={active}
                  className={`relative rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    active ? "text-white" : "text-ink-soft hover:text-accent"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="dash-period-pill"
                      className="absolute inset-0 rounded-lg bg-accent"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{p.label}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence initial={false}>
            {period === "custom" && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex flex-wrap items-center gap-2"
              >
                <label className="sr-only" htmlFor="dash-custom-start">
                  Tanggal mulai
                </label>
                <input
                  id="dash-custom-start"
                  type="date"
                  value={customStart}
                  max={customEnd || undefined}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs font-semibold tabular-nums text-ink shadow-sm"
                />
                <span className="text-xs font-bold text-ink-faint">s/d</span>
                <label className="sr-only" htmlFor="dash-custom-end">
                  Tanggal akhir
                </label>
                <input
                  id="dash-custom-end"
                  type="date"
                  value={customEnd}
                  min={customStart || undefined}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="rounded-lg border border-line bg-card px-2.5 py-1.5 text-xs font-semibold tabular-nums text-ink shadow-sm"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* KPI row */}
      <motion.section
        variants={kpiVariants}
        initial="hidden"
        animate="show"
        aria-label="Ringkasan utama"
        className="grid grid-cols-2 gap-3 xl:grid-cols-4"
      >
        <KpiCard
          label="Total Pendapatan"
          value={stats.revenue}
          format={(n) => formatRupiah(Math.round(n))}
          icon={Coins}
          delta={stats.deltas.revenue}
        />
        <KpiCard
          label="Total Transaksi"
          value={stats.count}
          format={(n) => String(Math.round(n))}
          icon={ReceiptText}
          delta={stats.deltas.count}
        />
        <KpiCard
          label="Item Terjual"
          value={stats.itemsSold}
          format={(n) => String(Math.round(n))}
          icon={ShoppingBag}
          delta={stats.deltas.itemsSold}
        />
        <KpiCard
          label="Rata-rata / Transaksi"
          value={stats.avg}
          format={(n) => formatRupiah(Math.round(n))}
          icon={Banknote}
          delta={stats.deltas.avg}
        />
      </motion.section>

      {/* Charts */}
      {!hasSales ? (
        <div className="surface mt-4 rounded-card">
          <EmptyState
            icon={TrendingUp}
            title="Belum ada penjualan"
            subtitle="Grafik dan laporan akan muncul otomatis setelah transaksi pertama tercatat di POS."
            actionHref="/"
            actionLabel="Mulai Jualan"
          />
        </div>
      ) : loading ? null : (
        <motion.div
          key={`${range?.start ?? "all"}-${range?.end ?? "all"}`}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mt-4 grid gap-4 xl:grid-cols-5"
        >
          <RevenueAreaChart data={stats.revenueSeries} />
          <MethodDonutChart data={stats.methods} />
          <ProductBarChart data={stats.topProducts} />
        </motion.div>
      )}
    </div>
  );
}
