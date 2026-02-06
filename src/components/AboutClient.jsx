"use client";

import { motion } from "framer-motion";
import { ChefHat, Truck, Flame, Star, HeartHandshake } from "lucide-react";

export default function AboutClient() {
  return (
    <section className="site-bg text-stone-200 overflow-hidden">
      {/* HERO */}
      <div className="relative py-24 px-6 max-w-6xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-5xl font-bold text-stone-950"
        >
          FAVE DELICACY: More Than Just Food
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 max-w-2xl mx-auto text-stone-300"
        >
          We’re not just another food vendor. We are a modern kitchen serving
          carefully crafted meals to people who value taste, consistency, and
          quality — delivered fresh across Ifite, Awka.
        </motion.p>
      </div>

      {/* STORY */}
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-semibold text-stone-950">Our Story</h2>
          <p className="mt-4 text-stone-300 leading-relaxed">
            We started with one simple belief — great food should never be
            rushed or compromised. Every meal we prepare is cooked with fresh
            ingredients, seasoned with intention, and handled with care.
          </p>
          <p className="mt-4 text-stone-300 leading-relaxed">
            From grilled chicken to signature dishes, our kitchen exists to
            satisfy real cravings and deliver memorable experiences.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="card p-8 bg-orange-400/20 backdrop-blur-xl rounded-2xl"
        >
          <Flame className="w-10 h-10 text-[#e63a46]" />
          <h3 className="mt-4 text-xl font-semibold text-stone-950">Crafted With Passion</h3>
          <p className="mt-2 text-stone-800">
            Every dish is prepared by chefs who understand flavor, balance,
            and consistency.
          </p>
        </motion.div>
      </div>

      {/* VALUES */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-semibold text-center text-stone-950"
        >
          What We Stand For
        </motion.h2>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: ChefHat, title: "Chef-Crafted Meals", text: "Prepared by professionals who care about taste and presentation." },
            { icon: Flame, title: "Fresh Ingredients", text: "We cook only with fresh, high-quality ingredients." },
            { icon: Truck, title: "Fast Delivery", text: "Reliable doorstep delivery across Ifite, Awka." },
            { icon: Star, title: "Trusted by Locals", text: "Loved and recommended by customers in our community." },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card bg-orange-400/25 backdrop-blur-xl p-6 rounded-xl"
            >
              <item.icon className="w-8 h-8 text-[#e63a46]" />
              <h3 className="mt-4 font-semibold text-stone-950">{item.title}</h3>
              <p className="mt-2 text-sm text-stone-800">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* PROMISE */}
      <div className="bg-[#e63a46] py-20">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-4xl mx-auto text-center px-6">
          <HeartHandshake className="w-12 h-12 mx-auto text-white" />
          <h2 className="mt-6 text-3xl font-bold text-white">Our Promise to You</h2>
          <p className="mt-4 text-white/90">Consistent quality. Honest portions. Reliable delivery. Every order is treated like it’s for family.</p>
        </motion.div>
      </div>
    </section>
  );
}
