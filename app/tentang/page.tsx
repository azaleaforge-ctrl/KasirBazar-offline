import Link from "next/link";
import {
  WifiOff,
  Zap,
  Package,
  BarChart3,
  MonitorSmartphone,
  BadgeDollarSign,
  ArrowRight,
  Download,
  ChevronDown,
} from "lucide-react";

export const metadata = {
  title: {
    absolute:
      "Kasir Bazar — Aplikasi Kasir Offline Gratis untuk Bazar & Warung",
  },
  description:
    "Aplikasi kasir offline gratis untuk bazar & warung. Catat penjualan, kelola produk, lihat laporan, dan cetak struk tanpa internet. Mode PWA, bisa dipasang di HP.",
  keywords: [
    "aplikasi kasir offline",
    "kasir bazar",
    "kasir warung",
    "kasir tanpa internet",
    "aplikasi kasir gratis",
    "point of sale offline",
  ],
  alternates: { canonical: "/tentang" },
};

const FEATURES = [
  {
    icon: WifiOff,
    title: "Kasir Tanpa Internet",
    desc: "Semua transaksi tersimpan di perangkat. Cocok untuk bazar, warung, dan lapak di area sinyal lemah.",
  },
  {
    icon: Zap,
    title: "Catat Penjualan Cepat",
    desc: "Tambah produk ke keranjang dengan satu ketukan. Cetak struk langsung dari aplikasi.",
  },
  {
    icon: Package,
    title: "Kelola Produk & Kategori",
    desc: "Atur daftar produk, harga, dan kategori sesuka Anda.",
  },
  {
    icon: BarChart3,
    title: "Laporan & Dashboard",
    desc: "Pantau omzet, item terlaris, dan grafik penjualan kapan saja.",
  },
  {
    icon: MonitorSmartphone,
    title: "Mode PWA",
    desc: "Pasang di layar utama HP seperti aplikasi native. Buka cepat dan ringan.",
  },
  {
    icon: BadgeDollarSign,
    title: "100% Gratis",
    desc: "Tanpa biaya langganan. Data Anda, privasi Anda.",
  },
];

const STEPS = [
  "Buka Kasir Bazar di browser Anda.",
  "Tambahkan produk dan mulai mencatat transaksi.",
  "Pasang sebagai aplikasi untuk akses offline penuh.",
];

const FAQ = [
  {
    q: "Apakah Kasir Bazar benar-benar gratis?",
    a: "Ya, 100% gratis tanpa biaya langganan.",
  },
  {
    q: "Bisa dipakai tanpa internet?",
    a: "Bisa. Aplikasi berjalan offline dan data tersimpan di perangkat.",
  },
  {
    q: "Di perangkat apa saja?",
    a: "Android, iOS, Windows, macOS, dan web — cukup gunakan browser.",
  },
  {
    q: "Apakah data saya aman?",
    a: "Data tersimpan lokal di perangkat Anda, tidak dikirim ke server.",
  },
];

function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-card bg-accent px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-accent-strong"
    >
      {children}
      <ArrowRight size={16} strokeWidth={2.6} />
    </Link>
  );
}

function SecondaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 rounded-card border border-line bg-card px-6 py-3 text-sm font-bold text-ink transition-colors hover:border-accent hover:text-accent-strong"
    >
      {children}
      <Download size={16} strokeWidth={2.4} />
    </Link>
  );
}

export default function TentangPage() {
  return (
    <div className="mx-auto max-w-[1040px]">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-card border border-accent/10 bg-accent-tint px-6 py-10 sm:px-10 sm:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full bg-accent/10 blur-3xl"
        />
        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-strong ring-1 ring-accent/10">
            <WifiOff size={14} strokeWidth={2.4} />
            Aplikasi Kasir Offline
          </span>

          <h1 className="mt-4 max-w-3xl font-display text-3xl font-extrabold leading-[1.12] tracking-tight text-ink sm:text-4xl md:text-[2.75rem]">
            Kasir Bazar — Aplikasi Kasir Offline Gratis untuk Bazar &amp; Warung
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
            Catat penjualan, kelola produk, dan lihat laporan tanpa perlu
            internet. Install sekali, pakai selamanya di HP atau laptop.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton href="/">Buka Kasir</PrimaryButton>
            <SecondaryButton href="/install">Pasang Aplikasi</SecondaryButton>
          </div>
        </div>
      </section>

      {/* Fitur Unggulan */}
      <section aria-labelledby="fitur" className="mt-12">
        <h2
          id="fitur"
          className="font-display text-2xl font-extrabold tracking-tight text-ink"
        >
          Fitur Unggulan
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Semua yang Anda butuhkan untuk melayani pembeli, tanpa ribet.
        </p>

        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li
              key={f.title}
              className="surface rounded-card p-5 transition-transform duration-200 hover:-translate-y-1"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-tint text-accent ring-1 ring-accent/10">
                <f.icon size={20} strokeWidth={2.2} />
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-ink">
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                {f.desc}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Cara Mulai */}
      <section aria-labelledby="cara" className="mt-12">
        <h2
          id="cara"
          className="font-display text-2xl font-extrabold tracking-tight text-ink"
        >
          Cara Mulai
        </h2>

        <ol className="mt-5 grid gap-3 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={i} className="surface rounded-card p-5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{s}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Pertanyaan Umum */}
      <section aria-labelledby="faq" className="mt-12">
        <h2
          id="faq"
          className="font-display text-2xl font-extrabold tracking-tight text-ink"
        >
          Pertanyaan Umum
        </h2>

        <div className="mt-5 flex flex-col gap-3">
          {FAQ.map((item) => (
            <details key={item.q} className="surface group rounded-card">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-bold text-ink">
                {item.q}
                <ChevronDown
                  size={18}
                  className="shrink-0 text-ink-faint transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <p className="px-5 pb-5 text-sm leading-relaxed text-ink-soft">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mt-12 rounded-card border border-accent/10 bg-accent-tint px-6 py-10 text-center sm:px-10">
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Siap melayani pembeli tanpa ribet?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-ink-soft">
          Mulai catat penjualan sekarang — gratis dan bisa dipakai tanpa
          internet.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <PrimaryButton href="/">Buka Kasir</PrimaryButton>
          <SecondaryButton href="/install">Pasang Aplikasi</SecondaryButton>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
          <Link
            href="/products"
            className="font-semibold text-accent-strong hover:underline"
          >
            Lihat Produk →
          </Link>
          <Link
            href="/donasi"
            className="font-semibold text-accent-strong hover:underline"
          >
            Dukung Kasir Bazar →
          </Link>
        </div>
      </section>
    </div>
  );
}
