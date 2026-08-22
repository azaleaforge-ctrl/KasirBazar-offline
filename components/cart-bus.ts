"use client";

/**
 * Tiny bus so the mobile top-bar cart button can open the cart sheet
 * that lives inside the POS page (including right after a navigation).
 */
let pendingOpen = false;

export function requestOpenCart(): void {
  pendingOpen = true;
  window.dispatchEvent(new Event("kasir:cart"));
}

export function consumePendingOpen(): boolean {
  const value = pendingOpen;
  pendingOpen = false;
  return value;
}
