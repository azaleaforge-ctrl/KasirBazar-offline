import Link from "next/link";

const LINKS = [
  { href: "/", label: "POS" },
  { href: "/products", label: "Produk" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/purchases", label: "Pembelian" },
  { href: "/install", label: "Pasang Aplikasi" },
  { href: "/donasi", label: "Donasi" },
  { href: "/", label: "Beranda" },
];

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-line bg-card px-4 py-8 sm:px-8">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <span className="block font-display text-lg font-extrabold tracking-tight">
            Kasir Bazar
          </span>
          <span className="mt-1 block text-[13px] font-medium text-ink-faint">
            Kasir offline bazar &amp; warung
          </span>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
            Aplikasi kasir offline gratis. Data aman di perangkat, bisa dipakai
            tanpa internet.
          </p>
        </div>

        <nav
          aria-label="Navigasi footer"
          className="flex flex-wrap gap-x-5 gap-y-2"
        >
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13px] font-semibold text-ink-soft transition-colors hover:text-accent"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mx-auto mt-6 max-w-[1200px] border-t border-line pt-4">
        <p className="text-[12px] font-medium text-ink-faint">
          © {new Date().getFullYear()} Kasir Bazar. Aplikasi kasir offline gratis.
        </p>
      </div>
    </footer>
  );
}
