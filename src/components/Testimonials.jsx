"use client";

import { motion } from "framer-motion";

const reviews = [
  { name: "Chinedu", area: "Ifite", text: "Best food I’ve had delivered here." },
  { name: "Amaka", area: "Ifite", text: "Always fresh and on time." },
  { name: "Uche", area: "Awka", text: "Premium taste, worth every naira." },
];

export default function Testimonials() {
  return (
    <section className="p-10 site-bg text-stone-950">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Customer Love
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.03 }}
              className="glass bg-orange-500/20 p-6 rounded-xl"
            >
              <p className="text-sm mb-4">“{r.text}”</p>
              <span className="text-xs text-stone-300">
                — {r.name}, {r.area}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
