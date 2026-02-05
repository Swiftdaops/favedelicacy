"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  ChefHat,
  Truck,
  Salad,
  Star
} from "lucide-react";

const reasons = [
  {
    title: "Chef-Crafted Meals",
    desc: "Every dish is carefully prepared by skilled chefs who understand taste, balance, and quality.",
    icon: ChefHat,
  },
  {
    title: "Fast Doorstep Delivery",
    desc: "Hot, fresh meals delivered quickly to your doorstep anywhere in Ifite, Awka.",
    icon: Truck,
  },
  {
    title: "Fresh Ingredients Only",
    desc: "We use only fresh, locally sourced ingredients — no shortcuts, no compromises.",
    icon: Salad,
  },
];

export default function WhyChooseUs() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative p-10 site-bg text-stone-950"
    >
      <div className="max-w-6xl mx-auto">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-stone-950">
            Why People Choose Us
          </h2>
          <p className="mt-3 text-stone-900 max-w-xl mx-auto">
            We don’t just cook food — we deliver quality, trust, and satisfaction.
          </p>

          {/* ⭐ Star Rating */}
          <div className="mt-6 flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0.4 }}
                animate={
                  isInView
                    ? { scale: 1, opacity: 1 }
                    : {}
                }
                transition={{
                  delay: 0.2 + i * 0.12,
                  duration: 0.4,
                }}
              >
                <Star
                  className="w-6 h-6"
                  fill={isInView ? "#facc15" : "none"}
                  stroke="#facc15"
                />
              </motion.div>
            ))}
          </div>

          <p className="mt-2 text-sm text-stone-800">
            Trusted by locals in Ifite, Awka
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {reasons.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  delay: 0.3 + i * 0.15,
                  duration: 0.5,
                }}
                className="glass bg-orange-500/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-orange-400/30 mb-4">
                  <Icon className="w-6 h-6 text-stone-950" />
                </div>

                <h3 className="text-xl font-semibold text-stone-950">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm text-stone-900 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <a href="/menu" className="card px-6 py-2 rounded inline-block">Order Now</a>
        </div>
      </div>
    </section>
  );
}
