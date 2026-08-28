import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pasang Aplikasi",
  description:
    "Install Kasir Bazar sebagai aplikasi di HP atau laptop, bisa dipakai tanpa internet.",
  alternates: { canonical: "/install" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
