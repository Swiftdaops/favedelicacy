import { create } from "zustand";

export const useSearchStore = create((set) => ({
  open: false,
  openSearch: () => set({ open: true }),
  closeSearch: () => set({ open: false }),
}));

export default useSearchStore;
