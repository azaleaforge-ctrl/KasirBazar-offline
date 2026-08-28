import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { SplashScreen } from "@/components/splash-screen";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kasir-bazar-offline-pi.vercel.app"),
  title: {
    default: "Kasir Bazar - Kasir Offline",
    template: "%s - Kasir Bazar",
  },
  description:
    "Aplikasi kasir offline untuk bazar & warung. Catat penjualan, kelola produk, dan lihat laporan - tanpa internet.",
  applicationName: "Kasir Bazar",
  manifest: "/manifest.json",
  keywords: [
    "kasir offline",
    "aplikasi kasir",
    "kasir bazar",
    "kasir warung",
    "point of sale",
    "aplikasi kasir gratis",
    "kasir tanpa internet",
  ],
  authors: [{ name: "Kasir Bazar" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://kasir-bazar-offline-pi.vercel.app",
    siteName: "Kasir Bazar",
    title: "Kasir Bazar - Kasir Offline",
    description:
      "Aplikasi kasir offline untuk bazar & warung. Catat penjualan, kelola produk, dan lihat laporan - tanpa internet.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kasir Bazar - Kasir Offline",
    description:
      "Aplikasi kasir offline untuk bazar & warung. Catat penjualan, kelola produk, dan lihat laporan - tanpa internet.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} ${bricolage.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kasir Bazar" />
        {/* Hide the splash if JS never runs (it is removed by SplashScreen) */}
        <noscript>
          <style>{`#splash{display:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-dvh font-sans text-ink">
        <SplashScreen />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
