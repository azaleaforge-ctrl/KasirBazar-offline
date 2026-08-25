"use client";

import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { playClick } from "@/lib/sound";

/**
 * Shared search box + category filter chips (used by POS and Produk pages).
 * Category "" means "Semua".
 */
export function ProductFilters({
  categories,
  query,
  onQuery,
  category,
  onCategory,
}: {
  categories: string[];
  query: string;
  onQuery: (v: string) => void;
  category: string;
  onCategory: (v: string) => void;
}) {
  const chips = ["Semua", ...categories];

  return (
    <div className="mb-4 flex flex-col gap-2.5 lg:flex-row lg:items-center">
      <div className="relative w-full shrink-0 lg:max-w-[260px]">
        <Search
          size={15}
          strokeWidth={2.2}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
          aria-hidden
        />
        <input
          type="text"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          onFocus={playClick}
          placeholder="Cari nama produk…"
          aria-label="Cari produk berdasarkan nama"
          className="h-10 w-full rounded-xl border border-line bg-card pl-9 pr-8 text-sm font-medium outline-none transition-colors placeholder:text-ink-faint focus:border-accent"
        />
        {query !== "" && (
          <button
            type="button"
            aria-label="Bersihkan pencarian"
            onClick={() => {
              playClick();
              onQuery("");
            }}
            className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-page hover:text-ink"
          >
            <X size={14} strokeWidth={2.4} />
          </button>
        )}
      </div>

      <div
        role="group"
        aria-label="Filter kategori"
        className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-0.5 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0"
      >
        {chips.map((c) => {
          const value = c === "Semua" ? "" : c;
          const active = category === value;
          return (
            <motion.button
              key={c}
              type="button"
              whileTap={{ scale: 0.94 }}
              aria-pressed={active}
              onClick={() => {
                if (!active) {
                  playClick();
                  onCategory(value);
                }
              }}
              className={`h-8 shrink-0 rounded-full border px-3.5 text-xs font-bold transition-colors ${
                active
                  ? "border-accent bg-accent text-white shadow-sm"
                  : "border-line bg-card text-ink-soft hover:border-accent hover:text-accent"
              }`}
            >
              {c}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/** Case-insensitive name match + category match ("" = all). */
export function matchesFilters(
  product: { name: string; category?: string },
  query: string,
  category: string
): boolean {
  const okName = product.name.toLowerCase().includes(query.trim().toLowerCase());
  const okCategory = category === "" || product.category === category;
  return okName && okCategory;
}

/** Unique, sorted category names from a product list. */
export function collectCategories(products: Array<{ category?: string }>): string[] {
  return [
    ...new Set(
      products.map((p) => p.category?.trim()).filter((c): c is string => !!c)
    ),
  ].sort((a, b) => a.localeCompare(b));
}
