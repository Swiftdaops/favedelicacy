"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import useCartStore from "@/store/cartStore";
import "swiper/css";
import { useEffect, useState } from "react";
import { getFoods } from "../api/food.api";

export default function BestSellers() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);

  useEffect(() => {
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
  }, []);

  return (
    <section className="p-10 site-bg text-stone-950">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">Best Sellers</h2>

        {loading ? (
          <div className="text-center text-white">Loading…</div>
        ) : (
          <Swiper
            spaceBetween={20}
            slidesPerView={1.2}
            breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
          >
            {foods.map((food) => (
              <SwiperSlide key={food._id}>
                <motion.div whileHover={{ y: -6 }} className="glass glass-red rounded-2xl overflow-hidden">
                  <img src={food.images?.[0]?.url || food.image} alt={food.name} className="w-full h-[420px] md:h-[320px] object-cover rounded-xl" />

                  <div className="p-4">
                    <h3 className="text-lg font-semibold">{food.name}</h3>
                    <p className="text-sm text-lime-500 mt-1">₦{food.price}</p>

                    <button onClick={() => addToCart(food)} className="mt-4 w-full flex items-center justify-center gap-2 card py-2 rounded-lg text-stone-950">
                      <ShoppingCart size={18} />
                      Add to cart
                    </button>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        <div className="mt-6 text-center">
          <a href="/menu" className="card px-6 py-2 rounded inline-block">View Full Menu</a>
        </div>
      </div>
    </section>
  );
}
