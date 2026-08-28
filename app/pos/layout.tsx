import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "POS",
  description:
    "Kasir point of sale offline Kasir Bazar. Catat penjualan, kelola keranjang, dan cetak struk tanpa internet.",
  alternates: { canonical: "/pos" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
