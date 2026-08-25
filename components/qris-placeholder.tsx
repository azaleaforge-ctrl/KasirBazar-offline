"use client";

import { useMemo } from "react";
import { QrCode } from "lucide-react";

/** Deterministic PRNG so the mock QR is stable across re-renders. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const N = 21; // QR grid size
const CELL = 10;
const PAD = 8;
const SIZE = N * CELL + PAD * 2;

function inFinderZone(x: number, y: number): boolean {
  return (
    (x < 8 && y < 8) || (x >= N - 8 && y < 8) || (x < 8 && y >= N - 8)
  );
}

/** Mock QRIS code - a decorative placeholder, not a scannable payment code. */
export function QrisPlaceholder({ seed }: { seed: number }) {
  const rects = useMemo(() => {
    const rand = mulberry32(seed);
    const out: Array<{ x: number; y: number }> = [];
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        if (inFinderZone(x, y)) continue;
        if (rand() < 0.44) out.push({ x, y });
      }
    }
    return out;
  }, [seed]);

  const finder = (fx: number, fy: number) => (
    <g key={`${fx}-${fy}`}>
      <rect x={PAD + fx * CELL} y={PAD + fy * CELL} width={CELL * 7} height={CELL * 7} rx={2} fill="#0f172a" />
      <rect x={PAD + (fx + 1) * CELL} y={PAD + (fy + 1) * CELL} width={CELL * 5} height={CELL * 5} fill="#ffffff" />
      <rect x={PAD + (fx + 2) * CELL} y={PAD + (fy + 2) * CELL} width={CELL * 3} height={CELL * 3} rx={1.5} fill="#0f172a" />
    </g>
  );

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="rounded-2xl border border-line bg-card p-4 shadow-sm">
        <svg
          width={180}
          height={180}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label="Contoh kode QRIS"
        >
          <rect width={SIZE} height={SIZE} fill="#ffffff" />
          {rects.map((r, i) => (
            <rect
              key={i}
              x={PAD + r.x * CELL}
              y={PAD + r.y * CELL}
              width={CELL - 1.5}
              height={CELL - 1.5}
              rx={1.5}
              fill="#0f172a"
            />
          ))}
          {finder(0, 0)}
          {finder(N - 7, 0)}
          {finder(0, N - 7)}
        </svg>
      </div>
      <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
        <QrCode size={14} className="text-accent" />
        Minta pembeli memindai kode QRIS ini
      </p>
      <p className="-mt-1 text-[11px] font-medium text-ink-faint">
        Contoh tampilan - hubungkan ke akun QRIS asli untuk menerima pembayaran.
      </p>
    </div>
  );
}
