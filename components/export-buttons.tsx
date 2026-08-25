"use client";

import { useEffect, useRef, useState } from "react";
import {
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  WifiOff,
} from "lucide-react";
import { exportExcel, exportJSON, importJSON } from "@/lib/export";
import { playClick, playError } from "@/lib/sound";
import { useOnlineStatus } from "./use-online";

type Status = { kind: "ok" | "err"; msg: string } | null;

export function ExportButtons({
  withImport = false,
  onImported,
}: {
  withImport?: boolean;
  onImported?: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const online = useOnlineStatus();

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 3500);
    return () => clearTimeout(t);
  }, [status]);

  const runExport = async (kind: "json" | "excel") => {
    playClick();
    setBusy(kind);
    try {
      if (kind === "json") {
        await exportJSON();
        setStatus({ kind: "ok", msg: "Backup JSON berhasil diunduh." });
      } else {
        await exportExcel();
        setStatus({ kind: "ok", msg: "Laporan Excel berhasil diunduh." });
      }
    } catch {
      playError();
      setStatus({ kind: "err", msg: "Ekspor gagal. Coba lagi." });
    } finally {
      setBusy(null);
    }
  };

  const runImport = async (file: File | undefined) => {
    if (!file) return;
    setBusy("import");
    try {
      await importJSON(file);
      playClick();
      setStatus({ kind: "ok", msg: "Impor berhasil - data dimuat ulang." });
      onImported?.();
    } catch {
      playError();
      setStatus({ kind: "err", msg: "File tidak valid atau bukan backup Kasir Bazar." });
    } finally {
      setBusy(null);
    }
  };

  const btn =
    "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        title={
          online ? undefined : "Perlu koneksi internet untuk ekspor Excel"
        }
        className="inline-flex"
      >
        <button
          type="button"
          onClick={() => void runExport("excel")}
          disabled={busy !== null || !online}
          className={`${btn} bg-accent text-white shadow-sm hover:bg-accent-strong`}
        >
          {busy === "excel" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <FileSpreadsheet size={15} strokeWidth={2.1} />
          )}
          Ekspor Excel
        </button>
      </span>
      {!online && (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600">
          <WifiOff size={12} strokeWidth={2.4} />
          Perlu koneksi internet untuk ekspor Excel
        </span>
      )}

      <button
        type="button"
        onClick={() => void runExport("json")}
        disabled={busy !== null}
        className={`${btn} border border-line bg-card text-ink-soft hover:border-accent hover:text-accent`}
      >
        {busy === "json" ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Download size={15} strokeWidth={2.1} />
        )}
        Backup JSON
      </button>

      {withImport && (
        <>
          <button
            type="button"
            onClick={() => {
              playClick();
              fileRef.current?.click();
            }}
            disabled={busy !== null}
            className={`${btn} border border-line bg-card text-ink-soft hover:border-accent hover:text-accent`}
          >
            {busy === "import" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Upload size={15} strokeWidth={2.1} />
            )}
            Impor JSON
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            aria-label="Pilih file backup JSON"
            onChange={(e) => {
              void runImport(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </>
      )}

      <span aria-live="polite" className="text-xs font-semibold">
        {status && (
          <span className={status.kind === "ok" ? "text-accent-strong" : "text-red-600"}>
            {status.msg}
          </span>
        )}
      </span>
    </div>
  );
}
