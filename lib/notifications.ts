import { create } from "zustand";

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

interface NotifState {
  items: AppNotification[];
  push: (n: Omit<AppNotification, "id" | "createdAt" | "read">) => void;
  dismiss: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
}

export const useNotifications = create<NotifState>((set) => ({
  items: [],
  push: (n) =>
    set((state) => {
      const item: AppNotification = {
        ...n,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        read: false,
      };
      // newest first, cap history at 50
      return { items: [item, ...state.items].slice(0, 50) };
    }),
  dismiss: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  markRead: (id) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, read: true } : i)),
    })),
  markAllRead: () =>
    set((state) => ({
      items: state.items.map((i) => ({ ...i, read: true })),
    })),
  clear: () => set({ items: [] }),
}));

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
