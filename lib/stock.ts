import type { Product } from "./types";
import { useNotifications } from "./notifications";
import type { NotificationKind } from "./notifications";

/**
 * Fire a low-stock / out-of-stock notification when a product crosses its
 * reminder threshold. Dedupes against an existing *unread* notification for the
 * same product + kind, so a single low-stock state won't spam on every sale.
 * Notifications are disabled when stockReminder is 0/unset.
 */
export function evaluateStock(product: Product): void {
  const reminder = product.stockReminder ?? 0;
  if (reminder <= 0) return;
  const stock = product.stock ?? 0;

  let kind: NotificationKind | null = null;
  if (stock <= 0) kind = "empty";
  else if (stock <= reminder) kind = "low";
  if (!kind) return;

  const { items, push } = useNotifications.getState();
  const already = items.some(
    (i) => i.productId === product.id && i.kind === kind && !i.read
  );
  if (already) return;

  push({
    productId: product.id,
    productName: product.name,
    kind,
    stock,
    threshold: reminder,
  });
}
