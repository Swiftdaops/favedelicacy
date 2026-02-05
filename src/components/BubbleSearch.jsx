"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";
import { useSearchStore } from "@/store/search.store";
import { getFoods } from "@/api/food.api";
import { useRouter } from "next/navigation";

export default function BubbleSearch() {
  const open = useSearchStore((s) => s.open);
  const closeSearch = useSearchStore((s) => s.closeSearch);
  const [foods, setFoods] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await getFoods();
        const data = res?.data || res || [];
        if (mounted) setFoods(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [open]);

  const results = query
    ? foods.filter((f) => (f.name || "").toLowerCase().includes(query.toLowerCase()))
    : foods.slice(0, 6);

  function openAndGo(id) {
    // navigate to menu and scroll to item by id
    closeSearch();
    router.push(`/menu#food-${id}`);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            onClick={closeSearch}
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className="fixed right-4 top-20 z-50 w-[90%] max-w-md"
          >
            <div className="card rounded-2xl p-5 shadow-xl bg-[var(--color-secondary)]/40 backdrop-blur-xl">

              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-950">Search Menu</h3>
                <button onClick={closeSearch} aria-label="Close search" className="p-2 rounded hover:bg-white/5">
                  <X className="w-5 h-5 text-stone-950" />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-700" />
                <input
                  type="text"
                  placeholder="Search for meals..."
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 text-stone-950 placeholder:text-stone-500 outline-none focus:ring-2 focus:ring-[#e63a46]"
                />
              </div>

              <div className="mt-4 max-h-64 overflow-auto">
                {loading ? (
                  <div className="py-6 text-center text-stone-700">Loading…</div>
                ) : results.length === 0 ? (
                  <div className="py-6 text-center text-stone-700">No results</div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {results.map((f) => (
                      <button
                        key={f._id}
                        onClick={() => openAndGo(f._id)}
                        className="flex items-center gap-3 p-2 rounded hover:bg-white/10 text-left"
                      >
                        <img src={f.images?.[0]?.url || f.image} alt={f.name} className="w-12 h-16 object-cover rounded" />
                        <div>
                          <div className="font-medium text-stone-950">{f.name}</div>
                          <div className="text-sm text-lime-500">₦{f.price}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

