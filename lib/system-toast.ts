import { create } from "zustand";

interface SystemToastState {
  message: string | null;
  show: (msg: string) => void;
  hide: () => void;
}

/** Single transient system notice (e.g. reset complete) shown globally. */
export const useSystemToast = create<SystemToastState>((set) => ({
  message: null,
  show: (msg) => set({ message: msg }),
  hide: () => set({ message: null }),
}));
