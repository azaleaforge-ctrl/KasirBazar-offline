"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { playClick, playError } from "@/lib/sound";
import { Modal } from "./modal";
import { PhotoInput } from "./photo-input";

export function ProductForm({
  product,
  onClose,
  onSave,
}: {
  /** Existing product when editing, undefined when adding. */
  product?: Product;
  onClose: () => void;
  onSave: (product: Product) => Promise<void>;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(
    product?.price != null ? String(product.price) : ""
  );
  const [category, setCategory] = useState(product?.category ?? "");
  const [photo, setPhoto] = useState<string | undefined>(product?.photo);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const cleanName = name.trim();
    const cleanPrice = Number.parseInt(price.replace(/\D/g, ""), 10);
    if (!cleanName) {
      playError();
      setError("Nama produk wajib diisi.");
      return;
    }
    if (!Number.isFinite(cleanPrice) || cleanPrice <= 0) {
      playError();
      setError("Harga harus lebih dari 0.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave({
        id: product?.id ?? crypto.randomUUID(),
        name: cleanName,
        price: cleanPrice,
        category: category.trim() || undefined,
        photo,
        createdAt: product?.createdAt ?? Date.now(),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      label={product ? "Ubah Produk" : "Tambah Produk"}
    >
      <h2 className="pr-8 font-display text-lg font-extrabold tracking-tight">
        {product ? "Ubah Produk" : "Tambah Produk"}
      </h2>

      <form
        className="mt-4 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <PhotoInput value={photo} onChange={setPhoto} />

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-soft">
            Nama Produk
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Es Teh Manis"
            autoFocus
            className="h-11 w-full rounded-xl border border-line bg-page px-3.5 text-sm font-medium outline-none transition-colors placeholder:text-ink-faint focus:border-accent focus:bg-card"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-soft">
              Harga
            </span>
            <span className="relative block">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-faint">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value.replace(/[^\d]/g, ""))
                }
                placeholder="5.000"
                className="h-11 w-full rounded-xl border border-line bg-page pl-9 pr-3 text-sm font-semibold tabular-nums outline-none transition-colors placeholder:text-ink-faint focus:border-accent focus:bg-card"
              />
            </span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-soft">
              Kategori{" "}
              <span className="font-medium normal-case text-ink-faint">
                (opsional)
              </span>
            </span>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Minuman"
              className="h-11 w-full rounded-xl border border-line bg-page px-3.5 text-sm font-medium outline-none transition-colors placeholder:text-ink-faint focus:border-accent focus:bg-card"
            />
          </label>
        </div>

        {error && (
          <p role="alert" className="text-xs font-bold text-red-600">
            {error}
          </p>
        )}

        <div className="mt-1 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              playClick();
              onClose();
            }}
            className="h-11 rounded-xl border border-line bg-card px-4 text-sm font-semibold text-ink-soft transition-colors hover:bg-page"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="h-11 rounded-xl bg-accent px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-accent-strong disabled:opacity-50"
          >
            {saving ? "Menyimpan…" : "Simpan"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
