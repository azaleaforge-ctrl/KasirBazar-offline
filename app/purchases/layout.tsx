import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Riwayat Pembelian",
  description: "Cek riwayat transaksi dan struk pembelian yang tersimpan di perangkat.",
  alternates: { canonical: "/purchases" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
