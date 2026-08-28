import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Donasi",
  description: "Dukung pengembangan aplikasi kasir offline gratis untuk pedagang bazar.",
  alternates: { canonical: "/donasi" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
