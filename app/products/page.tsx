"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Package, Pencil, Plus, SearchX, Trash2 } from "lucide-react";
import { addProduct, deleteProduct, getProducts, updateProduct } from "@/lib/db";
import type { Product } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import { playClick, playError } from "@/lib/sound";
import { evaluateStock } from "@/lib/stock";
import { useProductFocus } from "@/lib/notifications";
import { ProductForm } from "@/components/product-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import {
  ProductFilters,
  collectCategories,
  matchesFilters,
} from "@/components/product-filters";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  const reload = () =>
    getProducts()
      .then((rows) =>
        setProducts(rows.sort((a, b) => b.createdAt - a.createdAt))
      )
      .catch(() => {});

  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 2600);
    return () => clearTimeout(t);
  }, [notice]);

  const focusId = useProductFocus((s) => s.focusId);
  const clearFocus = useProductFocus((s) => s.clear);
  useEffect(() => {
    if (!focusId) return;
    const target = products.find((p) => p.id === focusId);
    if (target) setEditing(target);
    clearFocus();
  }, [focusId, products, clearFocus]);

  const categories = useMemo(() => collectCategories(products), [products]);

  const filtered = useMemo(
    () => products.filter((p) => matchesFilters(p, query, category)),
    [products, query, category]
  );

  const filtersActive = query.trim() !== "" || category !== "";

  const resetFilters = () => {
    playClick();
    setQuery("");
    setCategory("");
  };

  const handleSave = async (product: Product) => {
    try {
      if (editing) {
        await updateProduct(product);
        setNotice("Produk berhasil diperbarui.");
      } else {
        await addProduct(product);
        setNotice("Produk baru berhasil disimpan.");
      }
      playClick();
      evaluateStock(product);
      setAdding(false);
      setEditing(null);
      await reload();
    } catch {
      playError();
      setNotice("Gagal menyimpan produk.");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteProduct(deleting.id);
      playClick();
      setNotice(`"${deleting.name}" dihapus.`);
      setDeleting(null);
      await reload();
    } catch {
      playError();
      setNotice("Gagal menghapus produk.");
      setDeleting(null);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2.5 font-display text-[22px] font-extrabold leading-tight tracking-tight sm:text-2xl">
            Produk
            {!loading && products.length > 0 && (
              <span className="rounded-full bg-accent-tint px-2.5 py-0.5 text-xs font-bold tabular-nums text-accent-strong ring-1 ring-accent/15">
                {filtersActive ? `${filtered.length}/${products.length}` : products.length}
              </span>
            )}
          </h1>
          <p className="text-[13px] font-medium text-ink-soft">
            Kelola daftar barang yang dijual di bazar Anda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span aria-live="polite" className="text-xs font-semibold text-accent-strong">
            {notice}
          </span>
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              playClick();
              setAdding(true);
            }}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-accent-strong"
          >
            <Plus size={17} strokeWidth={2.5} />
            Tambah Produk
          </motion.button>
        </div>
      </header>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="surface flex animate-pulse gap-3 rounded-card p-3">
              <div className="h-16 w-16 shrink-0 rounded-xl bg-page" />
              <div className="flex-1 py-1">
                <div className="h-3.5 w-2/3 rounded bg-page" />
                <div className="mt-2.5 h-3 w-1/3 rounded bg-page" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Belum ada produk"
          subtitle="Simpan nama, harga, dan foto produk agar bisa langsung dipilih saat melayani pembeli."
          actionLabel="Tambah Produk"
        />
      ) : (
        <>
          <ProductFilters
            categories={categories}
            query={query}
            onQuery={setQuery}
            category={category}
            onCategory={setCategory}
          />

          {filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Tidak ada yang cocok"
              subtitle="Tidak ada produk dengan nama atau kategori tersebut. Coba kata kunci lain."
              actionLabel="Reset Pencarian"
              onAction={resetFilters}
            />
          ) : (
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
              className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
            >
              <AnimatePresence initial={false}>
                {filtered.map((p) => {
                  const reminder = p.stockReminder ?? 0;
                  const empty = p.stock != null && p.stock <= 0;
                  const low =
                    p.stock != null &&
                    reminder > 0 &&
                    p.stock > 0 &&
                    p.stock <= reminder;
                  return (
                  <motion.li
                    key={p.id}
                    layout
                    exit={{ opacity: 0, scale: 0.94 }}
                    variants={{
                      hidden: { opacity: 0, y: 14 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: { type: "spring", stiffness: 280, damping: 26 },
                      },
                    }}
                    className={`surface flex items-center gap-3.5 rounded-card p-3.5 ${
                      empty
                        ? "ring-1 ring-red-300 bg-red-50/70"
                        : low
                          ? "ring-1 ring-amber-300 bg-amber-50/70"
                          : ""
                    }`}
                  >
                    <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-accent-tint text-accent/60">
                      {p.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.photo} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Package size={24} strokeWidth={1.7} />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">
                        {p.name}
                      </span>
                      {p.category && (
                        <span className="mt-1 inline-block rounded-md bg-page px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-soft">
                          {p.category}
                        </span>
                      )}
                      <span className="mt-1 block font-display text-[15px] font-extrabold tabular-nums text-accent-deep">
                        {formatRupiah(p.price)}
                      </span>
                      {p.stock != null &&
                        (empty ? (
                          <span className="text-[11px] font-semibold text-red-600">
                            Stok habis
                          </span>
                        ) : low ? (
                          <span className="text-[11px] font-semibold text-amber-600">
                            Stok menipis: {p.stock}
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-ink-faint">
                            Stok: {p.stock}
                          </span>
                        ))}
                    </span>

                    <span className="flex shrink-0 flex-col gap-1">
                      <button
                        type="button"
                        aria-label={`Ubah ${p.name}`}
                        onClick={() => {
                          playClick();
                          setEditing(p);
                        }}
                        className="grid h-9 w-9 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-page hover:text-accent"
                      >
                        <Pencil size={15} strokeWidth={2.1} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Hapus ${p.name}`}
                        onClick={() => {
                          playClick();
                          setDeleting(p);
                        }}
                        className="grid h-9 w-9 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-page hover:text-red-600"
                      >
                        <Trash2 size={15} strokeWidth={2.1} />
                      </button>
                    </span>
                  </motion.li>
                  );
                })}
              </AnimatePresence>
            </motion.ul>
          )}
        </>
      )}

      {(adding || editing) && (
        <ProductForm
          key={editing?.id ?? "new"}
          product={editing ?? undefined}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Hapus produk?"
        message={`"${deleting?.name ?? ""}" akan dihapus dari daftar. Riwayat penjualan yang sudah ada tidak ikut terhapus.`}
        confirmLabel="Ya, Hapus"
        onConfirm={() => void handleDelete()}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
