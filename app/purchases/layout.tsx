import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Riwayat Pembelian",
  description: "Cek riwayat transaksi dan struk pembelian yang tersimpan di perangkat.",
  alternates: { canonical: "/purchases" },
  openGraph: {
    title: "Riwayat Pembelian - Kasir Bazar",
    url: "/purchases",
    description: "Cek riwayat transaksi dan struk pembelian yang tersimpan di perangkat.",
    locale: "id_ID",
    type: "website",
    siteName: "Kasir Bazar",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
