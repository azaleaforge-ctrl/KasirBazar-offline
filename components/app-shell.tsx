"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Heart,
  LayoutDashboard,
  Package,
  ReceiptText,
  ShoppingBasket,
  ShoppingCart,
  Smartphone,
  Store,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/lib/store";
import { playClick } from "@/lib/sound";
import { useIsDesktop } from "./use-media-query";
import { useOnlineStatus } from "./use-online";
import { requestOpenCart } from "./cart-bus";
import { CartPanel } from "./cart-panel";
import { MobileCartDock } from "./cart-sheet";
import { Toast } from "./stock-toast";
import { NotificationBell } from "./notification-bell";
import { ResetCycleManager } from "./reset-cycle-manager";
import { SystemToast } from "./system-toast";
import { DeployWatcher } from "./deploy-watcher";

interface NavItem {
  href: string;
  label: string;
  /** Shorter label for the cramped mobile tab bar. */
  shortLabel?: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: "/", label: "POS", icon: ShoppingBasket },
  { href: "/products", label: "Produk", icon: Package },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/purchases", label: "Pembelian", icon: ReceiptText },
  { href: "/install", label: "Pasang Aplikasi", shortLabel: "Pasang", icon: Smartphone },
  { href: "/donasi", label: "Donasi", shortLabel: "Donasi", icon: Heart },
];

const TITLES: Record<string, string> = {
  "/": "Point of Sale",
  "/products": "Produk",
  "/dashboard": "Dashboard",
  "/purchases": "Riwayat Pembelian",
  "/checkout": "Pembayaran",
  "/install": "Pasang Aplikasi",
  "/donasi": "Donasi",
};

function useCartCount(): number {
  return useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
}

function CartBadge() {
  const count = useCartCount();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || count === 0) return null;
  return (
    <motion.span
      key={count}
      initial={{ scale: 0.3 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 520, damping: 16 }}
      className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-white shadow-sm"
      aria-hidden
    >
      {count > 99 ? "99+" : count}
    </motion.span>
  );
}

function BrandMark({ size = "md" }: { size?: "md" | "sm" }) {
  const box = size === "md" ? "h-10 w-10 rounded-xl" : "h-8 w-8 rounded-lg";
  const icon = size === "md" ? 20 : 15;
  return (
    <span
      className={`${box} grid shrink-0 place-items-center bg-accent text-white shadow-sm`}
    >
      <Store size={icon} strokeWidth={2.2} />
    </span>
  );
}

/** Green/red online-offline capsule shown next to the brand name. */
function StatusCapsule({ compact = false }: { compact?: boolean }) {
  const online = useOnlineStatus();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <motion.span
      layout
      transition={{ type: "spring", stiffness: 400, damping: 32 }}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full font-bold uppercase tracking-wide transition-colors ${
        compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]"
      } ${
        online
          ? "bg-emerald-500/15 text-emerald-600"
          : "bg-red-500/15 text-red-600"
      }`}
      role="status"
      aria-label={online ? "Aplikasi online" : "Aplikasi offline"}
    >
      <motion.span
        key={online ? "on" : "off"}
        initial={{ scale: 0.4 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
        className={`h-1.5 w-1.5 rounded-full ${
          online ? "bg-emerald-500" : "bg-red-500"
        }`}
        aria-hidden
      />
      {online ? "Online" : "Offline"}
    </motion.span>
  );
}

/* ------------------------------ Desktop shell ----------------------------- */

function DesktopShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = TITLES[pathname] ?? "Kasir Bazar";
  const onPos = pathname === "/";

  return (
    <div className="min-h-dvh">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-card px-4 py-6">
        <div className="mb-3 px-1">
          <StatusCapsule />
        </div>

        <Link
          href="/"
          onClick={() => playClick()}
          className="mb-8 flex items-center gap-3 rounded-xl px-1 py-1"
        >
          <BrandMark />
          <span>
            <span className="block font-display text-lg font-extrabold leading-tight tracking-tight">
              Kasir Bazar
            </span>
            <span className="block text-[11px] font-medium text-ink-faint">
              Kasir offline bazar &amp; warung
            </span>
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => playClick()}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition-colors ${
                  active
                    ? "text-accent-strong"
                    : "text-ink-soft hover:bg-page hover:text-ink"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="dnav-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-xl bg-accent-tint ring-1 ring-accent/15"
                  />
                )}
                <item.icon
                  size={18}
                  strokeWidth={2.2}
                  className="relative z-10"
                />
                <span className="relative z-10 text-sm font-semibold">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex items-start gap-2 rounded-xl bg-page px-3 py-2.5 text-[11px] font-medium leading-snug text-ink-soft">
          <WifiOff size={14} className="mt-0.5 shrink-0 text-accent" />
          Mode offline - data tersimpan aman di perangkat ini.
        </div>
      </aside>

      {/* Main column */}
      <div className="ml-64 flex min-h-dvh flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-white/85 px-8 backdrop-blur">
          <div className="flex min-w-0 items-baseline gap-3">
            <span className="truncate font-display text-[15px] font-extrabold tracking-tight">
              Kasir Bazar
            </span>
            <span className="hidden text-xs font-medium text-ink-faint xl:inline">
              {title}
            </span>
          </div>
          <NotificationBell />
        </header>

        <div className="flex flex-1 items-stretch">
          <main className="min-w-0 flex-1 px-8 py-7">{children}</main>
          {onPos && <CartPanel />}
        </div>
      </div>

      <Toast />
    </div>
  );
}

/* ------------------------------- Mobile shell ----------------------------- */

function MobileShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const openCart = () => {
    playClick();
    requestOpenCart();
    if (pathname !== "/") router.push("/");
  };

  return (
    <div className="min-h-dvh pb-28">
      <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur">
        <div className="flex justify-end px-4 pt-2">
          <StatusCapsule compact />
        </div>
        <div className="flex items-center justify-between px-4 pb-2 pt-1.5">
          <Link
            href="/"
            onClick={() => playClick()}
            className="flex min-w-0 items-center gap-2"
          >
            <BrandMark size="sm" />
            <span className="font-display text-[15px] font-extrabold tracking-tight">
              Kasir Bazar
            </span>
          </Link>

          {pathname !== "/checkout" && (
            <span className="flex shrink-0 items-center gap-2">
              <NotificationBell />
              <button
                type="button"
                onClick={openCart}
                aria-label={`Buka keranjang`}
                className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-card text-ink-soft transition-colors hover:text-accent"
              >
                <ShoppingCart size={19} strokeWidth={2.2} />
                <CartBadge />
              </button>
            </span>
          )}
        </div>
      </header>

      <main className="px-4 pt-4">{children}</main>

      {pathname === "/" && <MobileCartDock />}

      <nav
        aria-label="Navigasi utama"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/92 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      >
        <div className="grid h-16 grid-cols-6">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => playClick()}
                aria-current={active ? "page" : undefined}
                className="relative flex flex-col items-center justify-center gap-1"
              >
                {active && (
                  <motion.span
                    layoutId="mnav-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute top-0 h-0.5 w-10 rounded-full bg-accent"
                  />
                )}
                <item.icon
                  size={21}
                  strokeWidth={2.2}
                  className={active ? "text-accent" : "text-ink-faint"}
                />
                <span
                  className={`text-[10.5px] font-semibold ${
                    active ? "text-accent-strong" : "text-ink-faint"
                  }`}
                >
                  {item.shortLabel ?? item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <Toast />
    </div>
  );
}

/* --------------------------------- Shell ---------------------------------- */

export function AppShell({ children }: { children: React.ReactNode }) {
  const isDesktop = useIsDesktop();
  return (
    <>
      <ResetCycleManager />
      <SystemToast />
      <DeployWatcher />
      {isDesktop ? (
        <DesktopShell>{children}</DesktopShell>
      ) : (
        <MobileShell>{children}</MobileShell>
      )}
    </>
  );
}
