"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PackageSearch, SearchX, Store } from "lucide-react";
import { getProducts } from "@/lib/db";
import type { Product } from "@/lib/types";
import { playClick } from "@/lib/sound";
import { ProductCard, gridVariants } from "@/components/product-card";
import {
  ProductFilters,
  collectCategories,
  matchesFilters,
} from "@/components/product-filters";
import { EmptyState } from "@/components/empty-state";

function SkeletonGrid() {
  return (
    <div
      aria-hidden
      className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4"
    >
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="surface rounded-card p-3">
          <div className="aspect-square animate-pulse rounded-xl bg-page" />
          <div className="mt-3 h-3.5 w-3/4 animate-pulse rounded bg-page" />
          <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-page" />
        </div>
      ))}
    </div>
  );
}

export default function PosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    let alive = true;
    getProducts()
      .then((rows) => {
        if (alive) setProducts(rows.sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const categories = useMemo(() => collectCategories(products), [products]);

  const filtered = useMemo(
    () =>
      products.filter((p) => matchesFilters(p, query, category)),
    [products, query, category]
  );

  const resetFilters = () => {
    playClick();
    setQuery("");
    setCategory("");
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Kasir Bazar",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web, Android, iOS, Windows, macOS",
            offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
            description:
              "Aplikasi kasir offline untuk bazar & warung. Catat penjualan, kelola produk, dan lihat laporan tanpa internet.",
            url: "https://kasir-bazar-offline-pi.vercel.app",
            inLanguage: "id",
          }),
        }}
      />
      <header className="mb-5 flex items-center gap-3">
        <span className="hidden h-11 w-11 place-items-center rounded-xl bg-accent-tint text-accent ring-1 ring-accent/10 sm:grid">
          <Store size={20} strokeWidth={2} />
        </span>
        <div>
          <h1 className="font-display text-[22px] font-extrabold leading-tight tracking-tight sm:text-2xl">
            Point of Sale
          </h1>
          <p className="text-[13px] font-medium text-ink-soft">
            Ketuk produk untuk memasukkannya ke keranjang.
          </p>
        </div>
      </header>

      {loading ? (
        <SkeletonGrid />
      ) : products.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="Belum ada produk"
          subtitle="Tambahkan produk terlebih dahulu agar bisa mulai mencatat penjualan."
          actionHref="/products"
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
            <motion.div
              variants={gridVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4"
            >
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
