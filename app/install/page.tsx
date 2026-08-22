"use client";

import { motion } from "framer-motion";
import {
  Apple,
  Check,
  Globe,
  Monitor,
  MonitorSmartphone,
  Smartphone,
} from "lucide-react";
import { InstallButton } from "@/components/install-app";

const BENEFITS = [
  {
    title: "Ikon di layar utama",
    desc: "Buka langsung seperti aplikasi biasa, tanpa mengetik alamat.",
  },
  {
    title: "Akses offline penuh",
    desc: "Jualan tetap jalan tanpa internet — data tersimpan di perangkat.",
  },
  {
    title: "Lebih cepat dibuka",
    desc: "Tampilan dan data muncul instan dari penyimpanan lokal.",
  },
  {
    title: "Gratis, tanpa app store",
    desc: "Tidak perlu unduh dari Play Store atau App Store.",
  },
];

const MANUAL_STEPS = [
  {
    icon: Monitor,
    title: "PC / Laptop",
    steps: [
      "Buka Kasir Bazar di Chrome atau Edge.",
      "Klik ikon “Instal” di ujung kanan address bar.",
      "Atau menu ⋮ → “Pasang Kasir Bazar”.",
      "Klik “Pasang” pada konfirmasi.",
    ],
  },
  {
    icon: Smartphone,
    title: "Android",
    steps: [
      "Buka Kasir Bazar di Chrome.",
      "Ketuk menu ⋮ di pojok kanan atas.",
      "Pilih “Instal aplikasi” atau “Tambahkan ke layar utama”.",
      "Ketuk “Pasang” pada konfirmasi.",
    ],
  },
  {
    icon: Apple,
    title: "iPhone / iPad",
    steps: [
      "Buka Kasir Bazar di Safari (wajib Safari).",
      "Ketuk tombol Bagikan (kotak dengan panah ke atas).",
      "Gulir lalu pilih “Tambahkan ke Layar Utama”.",
      "Ketuk “Tambah” di pojok kanan atas.",
    ],
  },
];

const reveal = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 24 },
  },
};

export default function InstallPage() {
  return (
    <div className="mx-auto max-w-[900px]">
      <header className="mb-5 flex items-center gap-3">
        <span className="hidden h-11 w-11 place-items-center rounded-xl bg-accent-tint text-accent ring-1 ring-accent/10 sm:grid">
          <MonitorSmartphone size={20} strokeWidth={2} />
        </span>
        <div>
          <h1 className="font-display text-[22px] font-extrabold leading-tight tracking-tight sm:text-2xl">
            Pasang Aplikasi
          </h1>
          <p className="text-[13px] font-medium text-ink-soft">
            Bawa Kasir Bazar ke layar utama HP atau PC Anda.
          </p>
        </div>
      </header>

      {/* Hero: benefits + install button */}
      <motion.section
        variants={reveal}
        initial="hidden"
        animate="show"
        aria-label="Keuntungan memasang aplikasi"
        className="surface rounded-card p-6 sm:p-8"
      >
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <ul className="flex flex-col gap-4">
            {BENEFITS.map((b) => (
              <li key={b.title} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-tint text-accent ring-1 ring-accent/15">
                  <Check size={13} strokeWidth={3} />
                </span>
                <span>
                  <span className="block text-sm font-bold">{b.title}</span>
                  <span className="block text-xs leading-relaxed text-ink-soft">
                    {b.desc}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col items-center gap-3 border-t border-dashed border-line pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
            <InstallButton />
            <p className="max-w-[220px] text-center text-[11px] font-medium leading-relaxed text-ink-faint">
              Setelah terpasang, buka dari ikon layar utama — bukan dari
              browser.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Manual install steps */}
      <section aria-label="Cara pasang manual" className="mt-5">
        <h2 className="mb-3 font-display text-base font-extrabold tracking-tight">
          Cara pasang manual
        </h2>
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
          className="grid gap-3 sm:grid-cols-3"
        >
          {MANUAL_STEPS.map((m, mi) => (
            <motion.div
              key={m.title}
              variants={{
                hidden: { opacity: 0, y: 14 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    type: "spring" as const,
                    stiffness: 280,
                    damping: 26,
                  },
                },
              }}
              className="surface rounded-card p-5"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent-tint text-accent">
                  <m.icon size={17} strokeWidth={2.1} />
                </span>
                <h3 className="text-sm font-bold">{m.title}</h3>
              </div>
              <ol className="mt-3.5 flex flex-col gap-2.5">
                {m.steps.map((s, si) => (
                  <li key={si} className="flex items-start gap-2.5">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-page text-[10px] font-bold tabular-nums text-ink-soft">
                      {si + 1}
                    </span>
                    <span className="text-xs leading-relaxed text-ink-soft">
                      {s}
                    </span>
                  </li>
                ))}
              </ol>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Secure-context note */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35 }}
        className="mt-5 flex items-start gap-2.5 rounded-xl bg-page px-4 py-3.5 text-[11px] font-medium leading-relaxed text-ink-soft"
      >
        <Globe size={14} className="mt-0.5 shrink-0 text-accent" />
        <span>
          Instal otomatis hanya tersedia saat aplikasi dibuka lewat localhost
          atau HTTPS. Jika Anda membuka lewat alamat IP WiFi (mis.
          http://192.168.x.x:3000), gunakan langkah manual di atas — hasilnya
          sama.
        </span>
      </motion.div>
    </div>
  );
}
