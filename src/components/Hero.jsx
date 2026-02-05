"use client";

import {
  Pizza,
  Hamburger,
  CupSoda,
  Soup,
  UtensilsCrossed,
  Wine,
  ChefHat,
  Leaf,
  Martini,
} from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden p-10 site-bg">

      {/* Glass overlays */}
      <div className="absolute top-20 left-10 h-40 w-40 rounded-full bg-orange-400/20 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-56 w-56 rounded-full bg-orange-500/20 blur-3xl" />

      {/* Floating food icons */}
      <Pizza className="absolute top-16 left-12 w-10 h-10 text-orange-300/80" />
      <Hamburger className="absolute top-1/3 right-20 w-12 h-12 text-orange-300/70" />
      <CupSoda className="absolute bottom-24 left-24 w-9 h-9 text-orange-200/70" />
      <Soup className="absolute bottom-16 right-40 w-10 h-10 text-orange-200/80" />
      <UtensilsCrossed className="absolute top-24 right-1/3 w-8 h-8 text-orange-300/60" />

      {/* Additional icons: wine, chef hat, salad (leaf), martini */}
      <Wine className="absolute top-10 right-6 w-8 h-8 text-orange-200/80" />
      <ChefHat className="absolute left-1/4 top-28 w-9 h-9 text-orange-300/75" />
      <Leaf className="absolute bottom-8 left-40 w-8 h-8 text-orange-200/70" />
      <Martini className="absolute top-32 right-1/6 w-9 h-9 text-orange-300/70" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-28">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-stone-950">
            We Cook for People Who <br />
            Recognize Quality <span className="food-glow">Food</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-stone-950 leading-relaxed">
            We serve our clients all over <strong>Ifite, Awka</strong>, delivering
            good and unique dishes that quench your taste — straight to your
            doorstep.
          </p>

          {/* CTA */}
          <div className="mt-10 flex gap-4">
            <a href="/menu" className="inline-block rounded-xl card px-6 py-3 text-white font-semibold shadow-lg transition text-center">
              Order Now
            </a>

          </div>
        </div>
      </div>
    </section>
  );
}
