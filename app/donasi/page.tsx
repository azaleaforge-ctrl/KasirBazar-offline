import { Heart } from "lucide-react";

const DONATION_URL = "https://sociabuzz.com/azaleaforge15/tribe";

export default function DonasiPage() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col justify-center py-6">
      <section
        aria-label="Dukungan donasi"
        className="surface rounded-card px-6 py-10 text-center sm:px-10"
      >
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent-tint text-accent ring-1 ring-accent/15">
          <Heart size={26} strokeWidth={2.2} />
        </span>

        <h1 className="mt-5 font-display text-[22px] font-extrabold leading-tight tracking-tight sm:text-2xl">
          Donasi
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">
          Kasir Bazar gratis dan open source. Jika aplikasi ini membantu,
          dukunganmu melalui Sociabuzz akan sangat berarti.
        </p>

        <a
          href={DONATION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex h-14 items-center gap-2.5 rounded-2xl bg-accent px-8 font-display text-lg font-extrabold tracking-wide text-white shadow-pop transition-colors hover:bg-accent-strong"
        >
          <Heart size={20} strokeWidth={2.4} />
          Donasi via Sociabuzz
        </a>
      </section>
    </div>
  );
}
