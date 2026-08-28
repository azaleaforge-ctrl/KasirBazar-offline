import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Lihat laporan penjualan, omzet, dan statistik bisnis bazar Anda.",
  alternates: { canonical: "/dashboard" },
  openGraph: {
    title: "Dashboard - Kasir Bazar",
    url: "/dashboard",
    description: "Lihat laporan penjualan, omzet, dan statistik bisnis bazar Anda.",
    locale: "id_ID",
    type: "website",
    siteName: "Kasir Bazar",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
