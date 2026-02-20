"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getFoods } from "@/api/food.api";
import useCartStore from "@/store/cartStore";

export default function MenuClient() {
  const [foods, setFoods] = useState([]);
  const addToCart = useCartStore((s) => s.addToCart);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getFoods();
        const data = res?.data || res || [];
        if (mounted) setFoods(data);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="min-h-screen site-bg text-stone-950 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14 text-center">
          <h1 className="text-4xl font-bold text-stone-950">Our Menu</h1>
          <p className="mt-3 text-stone-600 max-w-xl mx-auto">
            Carefully prepared dishes made with fresh ingredients and delivered hot to your doorstep.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {foods.map((food, i) => (
            <motion.div key={food._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} id={`food-${food._id}`} className="card rounded-2xl p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="md:w-2/3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-stone-950">{food.name}</h2>
                    <span className="text-lg font-bold text-lime-500">₦{food.price}</span>
                  </div>
                  <p className="mt-2 text-sm text-stone-600 leading-relaxed">{food.description}</p>
                  <div className="mt-4">
                    <button onClick={() => addToCart(food)} className="card px-4 py-2 rounded">Add to cart</button>
                  </div>
                </div>
                <div className="md:w-1/3">
                  <img src={food.images?.[0]?.url || food.image} alt={food.name} className="w-full h-[420px] md:h-[320px] object-cover rounded-xl" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
