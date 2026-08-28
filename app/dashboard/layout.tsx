import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Lihat laporan penjualan, omzet, dan statistik bisnis bazar Anda.",
  alternates: { canonical: "/dashboard" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
