import { getProducts, getTransactions, getSettings } from "./db";
import type { Product, Transaction } from "./types";
import { formatRupiah, formatDateShort } from "./format";
import type * as ExcelJS from "exceljs";

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function dateStamp(): string {
  const d = new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

export async function exportJSON(): Promise<void> {
  const [products, transactions, settings] = await Promise.all([
    getProducts(),
    getTransactions(),
    getSettings(),
  ]);
  const payload = {
    exportedAt: Date.now(),
    products,
    transactions,
    settings,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, `kasir-bazar-backup-${dateStamp()}.json`);
}

export async function importJSON(file: File): Promise<void> {
  const text = await file.text();
  const data = JSON.parse(text) as {
    products?: unknown[];
    transactions?: unknown[];
    settings?: Record<string, unknown>;
  };
  const db = await (await import("./db")).getDB();
  const tx = db.transaction(
    ["products", "transactions", "settings"],
    "readwrite"
  );
  if (Array.isArray(data.products)) {
    for (const p of data.products as Product[]) {
      await tx.objectStore("products").put(p);
    }
  }
  if (Array.isArray(data.transactions)) {
    for (const t of data.transactions as Transaction[]) {
      await tx.objectStore("transactions").put(t);
    }
  }
  if (data.settings && typeof data.settings === "object") {
    for (const [key, value] of Object.entries(data.settings)) {
      await tx.objectStore("settings").put({ key, value });
    }
  }
  await tx.done;
}

export async function exportExcel(): Promise<void> {
  const ExcelJS = (await import("exceljs")).default;
  const [products, transactions, settings] = await Promise.all([
    getProducts(),
    getTransactions(),
    getSettings(),
  ]);

  const wb = new ExcelJS.Workbook();
  wb.creator = "Kasir Bazar";
  wb.created = new Date();

  const totalPendapatan = transactions.reduce((s, t) => s + t.total, 0);
  const totalTransaksi = transactions.length;
  const totalItem = transactions.reduce(
    (s, t) => s + t.items.reduce((si, i) => si + i.qty, 0),
    0
  );
  const rataRata =
    totalTransaksi > 0 ? totalPendapatan / totalTransaksi : 0;
  const timestamps = transactions.map((t) => t.createdAt).filter(Boolean);
  const periode =
    timestamps.length > 0
      ? `${formatDateShort(Math.min(...timestamps))} - ${formatDateShort(
          Math.max(...timestamps)
        )}`
      : "-";

  const headerFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F172A" },
  };
  const headerFont: Partial<ExcelJS.Font> = {
    bold: true,
    color: { argb: "FFFFFFFF" },
  };

  // --- Sheet 1: Ringkasan ---
  const summary = wb.addWorksheet("Ringkasan");
  summary.mergeCells("A1:B1");
  const titleCell = summary.getCell("A1");
  titleCell.value = "LAPORAN KASIR BAZAR";
  titleCell.font = { bold: true, size: 18 };
  titleCell.alignment = { horizontal: "center" };

  const kpis: [string, string][] = [
    ["Total Pendapatan", formatRupiah(totalPendapatan)],
    ["Total Transaksi", String(totalTransaksi)],
    ["Total Item Terjual", String(totalItem)],
    ["Rata-rata per Transaksi", formatRupiah(rataRata)],
    ["Periode", periode],
  ];
  kpis.forEach(([label, value], idx) => {
    const row = idx + 3;
    const lc = summary.getCell(`A${row}`);
    lc.value = label;
    lc.fill = headerFill;
    lc.font = headerFont;
    lc.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
    const vc = summary.getCell(`B${row}`);
    vc.value = value;
    vc.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
  });

  // --- Sheet 2: Produk Terjual (transaksi + item terjual digabung) ---
  const prodSheet = wb.addWorksheet("Produk Terjual");
  prodSheet.columns = [
    { header: "No", key: "no", width: 6 },
    { header: "Tanggal", key: "tanggal", width: 20 },
    { header: "Metode", key: "metode", width: 12 },
    { header: "Nama Produk", key: "nama", width: 30 },
    { header: "Qty", key: "qty", width: 10 },
    { header: "Total", key: "total", width: 18 },
  ];
  prodSheet.getRow(1).font = headerFont;
  prodSheet.getRow(1).fill = headerFill;
  prodSheet.getRow(1).alignment = { horizontal: "center" };
  prodSheet.views = [{ state: "frozen", ySplit: 1 }];
  prodSheet.autoFilter = { from: "A1", to: "F1" };

  const sorted = [...transactions].sort((a, b) => a.createdAt - b.createdAt);
  let n = 0;
  for (const t of sorted) {
    for (const i of t.items) {
      n += 1;
      const row = prodSheet.addRow({
        no: n,
        tanggal: formatDateShort(t.createdAt),
        metode: t.method.toUpperCase(),
        nama: i.name,
        qty: i.qty,
        total: i.price * i.qty,
      });
      row.getCell("total").numFmt = '"Rp"#,##0';
    }
  }

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  downloadBlob(blob, `laporan-kasir-bazar-${dateStamp()}.xlsx`);
}
