import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pembayaran",
  description: "Proses pembayaran, diskon, dan cetak struk untuk pelanggan.",
  alternates: { canonical: "/checkout" },
  openGraph: {
    title: "Pembayaran - Kasir Bazar",
    url: "/checkout",
    description: "Proses pembayaran, diskon, dan cetak struk untuk pelanggan.",
    locale: "id_ID",
    type: "website",
    siteName: "Kasir Bazar",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
