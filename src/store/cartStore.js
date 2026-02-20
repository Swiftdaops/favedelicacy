import { create } from "zustand";

const loadItems = () => {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem("cart_items");
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
};

export const useCartStore = create((set, get) => ({
  items: loadItems(),
  drawerOpen: false,

  _normalizeId: (p) => p?._id || p?.id || null,

  addToCart: (product, qty = 1) => {
    set((state) => {
      const pid = product._id || product.id;
      const normalized = { ...product, _id: pid };
      const exists = state.items.find((i) => (i._id || i.id) === pid);
      if (exists) {
        return {
          items: state.items.map((i) =>
            (i._id || i.id) === pid ? { ...i, qty: (i.qty || 0) + Number(qty) } : i
          ),
        };
      }
      return { items: [...state.items, { ...normalized, qty: Number(qty) || 1, selectedExtras: [] }] };
    });
  },

  // Set selected extras for a cart item (array of { name, price })
  updateExtras: (id, extras = []) =>
    set((s) => ({ items: s.items.map((i) => ((i._id || i.id) === id ? { ...i, selectedExtras: extras } : i)) })),

  removeFromCart: (id) => set((s) => ({ items: s.items.filter((i) => (i._id || i.id) !== id) })),

  updateQty: (id, qty) => set((s) => ({ items: s.items.map((i) => ((i._id || i.id) === id ? { ...i, qty } : i)) })),

  clearCart: () => set({ items: [] }),

  toggleDrawer: (open) => set((s) => {
    // when opening, blur the currently focused element to avoid aria-hidden focus issues
    if (typeof window !== 'undefined' && (open === true || (typeof open === 'undefined' && !s.drawerOpen))) {
      try { document.activeElement?.blur?.(); } catch (e) {}
    }
    return { drawerOpen: typeof open === "boolean" ? open : !s.drawerOpen };
  }),

  count: () => get().items.reduce((sum, i) => sum + (i.qty || 0), 0),
  total: () =>
    get().items.reduce((sum, i) => {
      const base = (i.qty || 0) * (Number(i.price) || 0);
      const extras = (i.selectedExtras || []).reduce((es, e) => es + (Number(e.price) || 0) * (i.qty || 1), 0);
      return sum + base + extras;
    }, 0),
}));

// persist items to localStorage
if (typeof window !== "undefined") {
  useCartStore.subscribe((state) => state.items, (items) => {
    try {
      localStorage.setItem("cart_items", JSON.stringify(items || []));
    } catch (err) {
      // ignore
    }
  });
}

export default useCartStore;
