"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { playClick } from "@/lib/sound";
import { Modal } from "./modal";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Hapus",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) confirmRef.current?.focus();
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} label={title}>
      <div className="pr-8">
        <h2 className="font-display text-lg font-extrabold tracking-tight">
          {title}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{message}</p>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            playClick();
            onClose();
          }}
          className="h-10 rounded-xl border border-line bg-card px-4 text-sm font-semibold text-ink-soft transition-colors hover:bg-page"
        >
          Batal
        </button>
        <motion.button
          ref={confirmRef}
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            playClick();
            onConfirm();
          }}
          className="h-10 rounded-xl bg-red-600 px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-red-700"
        >
          {confirmLabel}
        </motion.button>
      </div>
    </Modal>
  );
}
