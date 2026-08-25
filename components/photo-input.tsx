"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { playClick, playError } from "@/lib/sound";

const TARGET_BYTES = 190_000;
const MAX_DIM = 720;

/** Resize + compress an image file to a small base64 JPEG data URL. */
async function shrinkToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  let width = bitmap.width;
  let height = bitmap.height;
  if (Math.max(width, height) > MAX_DIM) {
    const scale = MAX_DIM / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak didukung");
  ctx.drawImage(bitmap, 0, 0, width, height);

  let quality = 0.82;
  let url = canvas.toDataURL("image/jpeg", quality);
  while (url.length > TARGET_BYTES && quality > 0.35) {
    quality -= 0.15;
    url = canvas.toDataURL("image/jpeg", quality);
  }
  if (url.length > TARGET_BYTES) {
    // honey: single extra downscale pass - enough for counter photos
    canvas.width = Math.round(width * 0.6);
    canvas.height = Math.round(height * 0.6);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    url = canvas.toDataURL("image/jpeg", 0.6);
  }
  bitmap.close();
  return url;
}

export function PhotoInput({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value?: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      onChange(await shrinkToDataUrl(file));
    } catch {
      playError();
      setError("Foto gagal diproses. Coba foto lain.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="relative h-32 overflow-hidden rounded-xl border border-dashed border-line bg-page">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Pratinjau produk" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 text-ink-faint">
            <ImagePlus size={22} strokeWidth={1.8} />
            <span className="text-xs font-medium">Belum ada foto</span>
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-white/70">
            <Loader2 size={22} className="animate-spin text-accent" />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            playClick();
            inputRef.current?.click();
          }}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-card px-3 text-xs font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent"
        >
          <ImagePlus size={14} strokeWidth={2.2} />
          {value ? "Ganti Foto" : "Pilih Foto"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => {
              playClick();
              onChange(undefined);
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-ink-faint transition-colors hover:text-red-600"
          >
            <Trash2 size={14} strokeWidth={2.2} />
            Hapus
          </button>
        )}
        {error && (
          <span role="alert" className="text-xs font-semibold text-red-600">
            {error}
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Unggah foto produk"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
