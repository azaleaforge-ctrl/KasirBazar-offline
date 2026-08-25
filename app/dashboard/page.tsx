"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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

function dayKey(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dayLabel(key: string): string {
  const [, m, d] = key.split("-");
  return `${d}/${m}`;
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = () =>
    getTransactions()
      .then((rows) => setTransactions(rows.sort((a, b) => b.createdAt - a.createdAt)))
      .catch(() => {});

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const revenue = transactions.reduce((s, t) => s + t.total, 0);
    const itemsSold = transactions.reduce(
      (s, t) => s + t.items.reduce((si, i) => si + i.qty, 0),
      0
    );
    const avg = transactions.length > 0 ? revenue / transactions.length : 0;

    // Revenue per day - fill the gap between first and last sale (max 14 days)
    const byDay = new Map<string, number>();
    for (const t of transactions) {
      const key = dayKey(t.createdAt);
      byDay.set(key, (byDay.get(key) ?? 0) + t.total);
    }
    const keys = [...byDay.keys()].sort();
    const revenueSeries: Array<{ day: string; total: number }> = [];
    if (keys.length > 0) {
      const start = new Date(keys[0]);
      const end = new Date(keys[keys.length - 1]);
      const maxDays = 14;
      for (
        let cur = start, n = 0;
        cur <= end && n < maxDays;
        n++
      ) {
        const key = dayKey(cur.getTime());
        revenueSeries.push({ day: dayLabel(key), total: byDay.get(key) ?? 0 });
        cur.setDate(cur.getDate() + 1);
      }
    }

    // Items sold per product (top 8)
    const byProduct = new Map<string, number>();
    for (const t of transactions) {
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
    for (const t of transactions) {
      if (t.method === "qris") {
        qrisCount += 1;
        qrisTotal += t.total;
      } else {
        cashCount += 1;
        cashTotal += t.total;
      }
    }

    return {
      revenue,
      count: transactions.length,
      itemsSold,
      avg,
      revenueSeries,
      topProducts,
      methods: [
        { name: "QRIS", value: qrisCount, total: qrisTotal },
        { name: "Tunai", value: cashCount, total: cashTotal },
      ].filter((m) => m.value > 0),
    };
  }, [transactions]);

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
        />
        <KpiCard
          label="Total Transaksi"
          value={stats.count}
          format={(n) => String(Math.round(n))}
          icon={ReceiptText}
        />
        <KpiCard
          label="Item Terjual"
          value={stats.itemsSold}
          format={(n) => String(Math.round(n))}
          icon={ShoppingBag}
        />
        <KpiCard
          label="Rata-rata / Transaksi"
          value={stats.avg}
          format={(n) => formatRupiah(Math.round(n))}
          icon={Banknote}
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
