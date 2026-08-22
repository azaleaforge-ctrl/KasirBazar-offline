"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatRupiah } from "@/lib/format";

const ACCENT = "#0f766e";
const GOLD = "#d97706";
const GRID = "#e4eaf0";
const FAINT = "#94a3b8";

interface TipProps {
  active?: boolean;
  label?: string | number;
  payload?: Array<{
    value?: number | string;
    name?: string;
    payload?: Record<string, unknown>;
  }>;
}

function ChartTip({ active, payload, label }: TipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  const raw = point.payload as
    | { total?: number; qty?: number; name?: string }
    | undefined;
  return (
    <div className="rounded-lg border border-line bg-card px-3 py-2 text-xs shadow-pop">
      <p className="font-bold">{String(point.name ?? label ?? "")}</p>
      <p className="mt-0.5 tabular-nums text-ink-soft">
        {raw && typeof raw.total === "number"
          ? formatRupiah(raw.total)
          : `${point.value} terjual`}
      </p>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`surface rounded-card p-5 ${className}`}>
      <h2 className="text-sm font-bold">{title}</h2>
      <p className="mb-4 text-xs font-medium text-ink-faint">{subtitle}</p>
      {children}
    </section>
  );
}

export function RevenueAreaChart({
  data,
}: {
  data: Array<{ day: string; total: number }>;
}) {
  return (
    <ChartCard
      title="Pendapatan Harian"
      subtitle="Total penjualan per hari"
      className="xl:col-span-3"
    >
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity={0.28} />
              <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} strokeDasharray="3 6" vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: FAINT, fontSize: 11 }}
            minTickGap={28}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fill: FAINT, fontSize: 11 }}
            tickFormatter={(v: number) =>
              v >= 1000000
                ? `${v / 1000000}jt`
                : v >= 1000
                  ? `${v / 1000}rb`
                  : String(v)
            }
          />
          <Tooltip content={<ChartTip />} cursor={{ stroke: ACCENT, strokeOpacity: 0.25 }} />
          <Area
            type="monotone"
            dataKey="total"
            stroke={ACCENT}
            strokeWidth={2.5}
            fill="url(#revGrad)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function ProductBarChart({
  data,
}: {
  data: Array<{ name: string; qty: number }>;
}) {
  const height = Math.max(220, data.length * 42 + 30);
  return (
    <ChartCard
      title="Produk Terlaris"
      subtitle="Jumlah item terjual per produk"
      className="xl:col-span-3"
    >
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid stroke={GRID} strokeDasharray="3 6" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#475569", fontSize: 11.5 }}
          />
          <Tooltip content={<ChartTip />} cursor={{ fill: "rgba(15,118,110,0.06)" }} />
          <Bar dataKey="qty" fill={ACCENT} radius={[0, 7, 7, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function MethodDonutChart({
  data,
}: {
  data: Array<{ name: string; value: number; total: number }>;
}) {
  const grand = data.reduce((s, d) => s + d.total, 0);
  return (
    <ChartCard
      title="Metode Pembayaran"
      subtitle="Perbandingan QRIS dan tunai"
      className="xl:col-span-2"
    >
      <div className="relative">
        <ResponsiveContainer width="100%" height={210}>
          <PieChart>
            <Tooltip content={<ChartTip />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={4}
              cornerRadius={7}
              strokeWidth={0}
            >
              <Cell fill={ACCENT} />
              <Cell fill={GOLD} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
              Total
            </p>
            <p className="font-display text-base font-extrabold tabular-nums text-ink">
              {formatRupiah(grand)}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-1 flex justify-center gap-5">
        {data.map((d, i) => (
          <span key={d.name} className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: i === 0 ? ACCENT : GOLD }}
            />
            {d.name}
          </span>
        ))}
      </div>
    </ChartCard>
  );
}
