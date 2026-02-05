"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { getDrinks } from "../api/drink.api";
import { useCartStore } from "../store/cartStore";

// framer-motion handles animations; no external carousel dependency required

export default function DrinksCarousel() {
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const autoplayRef = useRef(null);
  const { addToCart: addToCartStore, toggleDrawer } = useCartStore();

  useEffect(() => {
    async function loadDrinks() {
      try {
        const res = await getDrinks();
        // backend returns arrays directly; normalize and log for debugging
        const data = res?.data || res || [];
        console.log("Drinks fetched:", data);
          setDrinks(data);
        // Initialize quantities to 1 for each drink
        const initQty = {};
        (res || []).forEach(d => { initQty[d._id] = 1; });
        setQuantities(initQty);
        setIndex(0);
      } catch (err) {
        console.error("Failed to load drinks:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDrinks();
  }, []);

  // autoplay
  useEffect(() => {
    if (!drinks.length) return;
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      if (!paused) setIndex((i) => (i + 1) % drinks.length);
    }, 4000);
    return () => clearInterval(autoplayRef.current);
  }, [drinks, paused]);

  function updateQuantity(drinkId, delta) {
    setQuantities(prev => ({
      ...prev,
      [drinkId]: Math.max(1, (prev[drinkId] || 1) + delta)
    }));
  }

  function addToCart(drink) {
    const qty = quantities[drink._id] || 1;
    // Add to cart with quantity
    addToCartStore(drink, qty);
    toast.success("Added to cart", {
      description: `${drink.name} (x${qty}) • ₦${(drink.price * qty).toLocaleString()}`,
    });
    // Reset quantity to 1 after adding
    setQuantities(prev => ({ ...prev, [drink._id]: 1 }));
    toggleDrawer(true);
  }

  return (
    <section className="w-full site-bg py-16">
      {/* Copy */}
      <div className="max-w-5xl mx-auto px-4 mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-stone-950">
          Refresh Your Taste
        </h1>
        <p className="mt-3 text-stone-950 max-w-xl mx-auto">
          Perfectly chilled drinks curated to complement every meal.  
          Tap, sip, and enjoy premium refreshment — delivered fast in Ifite, Awka.
        </p>
        <p className="mt-2 text-sm text-white font-medium">
          Swipe to browse • Adjust quantity • Tap card to add to cart
        </p>
      </div>

      {/* Carousel */}
      {loading ? (
        <div className="max-w-5xl mx-auto px-4 text-center py-12 text-stone-700">Loading drinks…</div>
      ) : drinks.length === 0 ? (
        <div className="max-w-5xl mx-auto px-4 text-center py-12 text-stone-700">No drinks available yet.</div>
      ) : (
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="mx-auto max-w-[640px]"
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={drinks[index]._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="cursor-pointer rounded-2xl overflow-hidden bg-white shadow-md transition-all flex flex-col"
                onClick={() => addToCart(drinks[index])}
              >
                <div className="relative w-full aspect-[3/4] overflow-hidden">
                  <img
                    src={drinks[index].images?.[0]?.url || drinks[index].images?.[0] || "/placeholder-drink.jpg"}
                    alt={drinks[index].name}
                    className="w-full h-full object-cover"
                  />
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.04 }} className="absolute inset-0 bg-black" />
                </div>

                <div className="p-4 bg-white">
                  <h3 className="font-semibold text-stone-950">{drinks[index].name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium text-stone-950">₦{drinks[index].price}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-stone-200 rounded-lg bg-white overflow-hidden">
                        <button onClick={(e) => { e.stopPropagation(); updateQuantity(drinks[index]._id, -1); }} className="p-1.5 hover:bg-stone-50 transition-colors"><Minus size={14} className="text-stone-600" /></button>
                        <span className="w-8 text-center text-xs font-black text-stone-900">{quantities[drinks[index]._id] || 1}</span>
                        <button onClick={(e) => { e.stopPropagation(); updateQuantity(drinks[index]._id, 1); }} className="p-1.5 hover:bg-stone-50 transition-colors"><Plus size={14} className="text-stone-600" /></button>
                      </div>
                      <ShoppingCart className="w-4 h-4 text-stone-950" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <button onClick={() => setIndex((i) => (i - 1 + drinks.length) % drinks.length)} className="px-3 py-1 rounded bg-stone-100">Prev</button>
              <div className="text-sm text-stone-600">{index + 1} / {drinks.length}</div>
              <button onClick={() => setIndex((i) => (i + 1) % drinks.length)} className="px-3 py-1 rounded bg-stone-100">Next</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
