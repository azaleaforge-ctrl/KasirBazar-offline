import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pembayaran",
  description: "Proses pembayaran, diskon, dan cetak struk untuk pelanggan.",
  alternates: { canonical: "/checkout" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
