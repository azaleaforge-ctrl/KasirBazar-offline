"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { playClick } from "@/lib/sound";

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
  actionHref,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  actionHref?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col items-center justify-center gap-3 py-16 text-center"
    >
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-accent-tint text-accent ring-1 ring-accent/10">
        <Icon size={28} strokeWidth={1.8} />
      </span>
      <h2 className="font-display text-lg font-extrabold tracking-tight">
        {title}
      </h2>
      <p className="max-w-xs text-sm leading-relaxed text-ink-soft">
        {subtitle}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          onClick={() => playClick()}
          className="mt-2 inline-flex h-11 items-center rounded-xl bg-accent px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-accent-strong"
        >
          {actionLabel}
        </Link>
      ) : (
        actionLabel &&
        onAction && (
          <button
            type="button"
            onClick={() => onAction()}
            className="mt-2 inline-flex h-11 items-center rounded-xl bg-accent px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-accent-strong"
          >
            {actionLabel}
          </button>
        )
      )}
    </motion.div>
  );
}
