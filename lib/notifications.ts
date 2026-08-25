import { create } from "zustand";
import {
  getNotifications,
  putNotification,
  deleteNotification,
  clearNotifications,
} from "./db";

export type NotificationKind = "low" | "empty";

export interface AppNotification {
  id: string;
  productId: string;
  productName: string;
  kind: NotificationKind;
  stock: number;
  threshold: number;
  createdAt: number;
  read: boolean;
}

const MAX_ITEMS = 50;

interface NotifState {
  items: AppNotification[];
  hydratedAt: number | null;
  push: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  dismiss: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
  hydrate: () => Promise<void>;
}

export const useNotifications = create<NotifState>((set) => ({
  items: [],
  hydratedAt: null,
  push: (n) =>
    set((state) => {
      const item: AppNotification = {
        ...n,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        read: false,
      };
      // newest first, cap history at 50
      const next = [item, ...state.items].slice(0, MAX_ITEMS);
      // persist the new notification
      void putNotification(item);
      // drop overflow from IDB too
      const dropped = state.items.filter((i) => !next.includes(i));
      for (const d of dropped) void deleteNotification(d.id);
      return { items: next };
    }),
  dismiss: (id) => {
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
    void deleteNotification(id);
  },
  markRead: (id) =>
    set((state) => {
      const items = state.items.map((i) =>
        i.id === id ? { ...i, read: true } : i
      );
      const updated = items.find((i) => i.id === id);
      if (updated) void putNotification(updated);
      return { items };
    }),
  markAllRead: () =>
    set((state) => {
      const items = state.items.map((i) => ({ ...i, read: true }));
      for (const i of items) void putNotification(i);
      return { items };
    }),
  clear: () => {
    set({ items: [] });
    void clearNotifications();
  },
  hydrate: async () => {
    const stored = await getNotifications();
    set({ items: stored, hydratedAt: Date.now() });
  },
}));

// Hydrate from IndexedDB on load (browser only; SSR skips).
if (typeof window !== "undefined") {
  void useNotifications.getState().hydrate();
}

// Request to open a product's detail/edit modal from a notification.
interface FocusState {
  focusId: string | null;
  focus: (id: string) => void;
  clear: () => void;
}

export const useProductFocus = create<FocusState>((set) => ({
  focusId: null,
  focus: (id) => set({ focusId: id }),
  clear: () => set({ focusId: null }),
}));
