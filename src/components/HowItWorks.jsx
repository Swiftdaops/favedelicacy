"use client";

import { motion } from "framer-motion";
import { BookOpen, ShoppingBag, Truck } from "lucide-react";
import { useRouter } from "next/navigation";

const steps = [
  { icon: BookOpen, title: "Browse Menu" },
  { icon: ShoppingBag, title: "Place Your Order" },
  { icon: Truck, title: "We Deliver to You" },
];

export default function HowItWorks() {
  const router = useRouter();
  return (
    <section className="p-10 site-bg text-stone-950">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-12">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className="p-6 rounded-2xl bg-[var(--background)] shadow"
              >
                <Icon className="mx-auto mb-4 text-[#e63a46]" size={40} />
                <h3 className="font-semibold text-lg">{step.title}</h3>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-8">
          <button
            onClick={() => router.push('/menu')}
            className="card px-6 py-2 rounded"
            aria-label="Start order - go to menu"
          >
            Start Order
          </button>
        </div>
      </div>
    </section>
  );
}
