import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Produk",
  description:
    "Kelola daftar produk, kategori, dan harga untuk bazar atau warung Anda secara offline.",
  alternates: { canonical: "/products" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
