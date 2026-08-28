import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donasi",
  description: "Dukung pengembangan aplikasi kasir offline gratis untuk pedagang bazar.",
  alternates: { canonical: "/donasi" },
  openGraph: {
    title: "Donasi - Kasir Bazar",
    url: "/donasi",
    description: "Dukung pengembangan aplikasi kasir offline gratis untuk pedagang bazar.",
    locale: "id_ID",
    type: "website",
    siteName: "Kasir Bazar",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
