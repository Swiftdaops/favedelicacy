"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Use this instead of window.location
import {
  ShoppingBag,
  Search,
  Info,
  Phone,
  Menu,
  X,
  ShoppingCart,
} from "lucide-react";
import { Utensils, Coffee } from "lucide-react";
import useCartStore from "@/store/cartStore";
import CartDrawer from "./CartDrawer";
import { useSearchStore } from "@/store/search.store";

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Hide navbar on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Cart logic moved out of JSX for cleaner code
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + (i.qty || 0), 0));
  const toggleDrawer = useCartStore((s) => s.toggleDrawer);
  const openSearch = useSearchStore((s) => s.openSearch);

  return (
    <header className="sticky top-0 z-50 bg-[var(--background)]/70 backdrop-blur border-b border-white/30">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link
            href="/"
            className="text-xl font-extrabold tracking-tight text-red-600"
          >
            FaveDelicacy
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-5">
            <Link
              href="/menu"
              className="hidden sm:flex items-center gap-2 text-stone-900 hover:text-red-600"
            >
              <Utensils className="h-4 w-4 text-red-600" />
              <span className="font-medium">Menu</span>
            </Link>

            <Link
              href="/drinks"
              className="hidden sm:flex items-center gap-2 text-stone-900 hover:text-red-600"
            >
              <Coffee className="h-4 w-4 text-red-600" />
              <span className="font-medium">Drinks</span>
            </Link>

            <Link
              href="/about"
              className="hidden sm:flex items-center gap-2 text-stone-900 hover:text-red-600"
            >
              <Info className="h-4 w-4 text-red-600" />
              <span className="font-medium">About</span>
            </Link>

            <Link
              href="/contact"
              className="hidden sm:flex items-center gap-2 text-stone-900 hover:text-red-600"
            >
              <Phone className="h-4 w-4 text-red-600" />
              <span className="font-medium">Contact</span>
            </Link>

            <button
              aria-label="Search"
              onClick={() => openSearch()}
              className="rounded-full p-2 hover:bg-red-100 transition"
            >
              <Search className="h-5 w-5 text-red-600" />
            </button>

            <button 
              onClick={() => toggleDrawer(true)} 
              className="relative rounded-full p-2 hover:bg-red-100 transition"
            >
              <ShoppingBag className="h-5 w-5 text-red-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </nav>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              aria-label="Search"
              onClick={() => openSearch()}
              className="rounded-full p-2 hover:bg-red-100 transition"
            >
              <Search className="h-5 w-5 text-red-600" />
            </button>

            <button 
              onClick={() => toggleDrawer(true)} 
              className="relative rounded-full p-2 hover:bg-red-100 transition"
            >
              <ShoppingBag className="h-5 w-5 text-red-600" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              aria-label="Menu"
              onClick={() => setOpen(true)}
              className="rounded-full p-2 hover:bg-red-100 transition"
            >
              <Menu className="h-6 w-6 text-red-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {open && (
        <div className="fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40" 
            onClick={() => setOpen(false)} 
          />
          
          <div className="absolute right-0 top-0 h-full w-72 bg-white p-6 shadow-xl animate-in slide-in-from-right">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-red-600">Menu</span>
              <button onClick={() => setOpen(false)}>
                <X className="h-6 w-6 text-red-600" />
              </button>
            </div>

            <nav className="mt-8 flex flex-col gap-4 card">
              <Link
                href="/menu"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg p-3 hover:bg-red-50 text-stone-900"
              >
                <Utensils className="h-5 w-5 text-red-600" />
                <span className="font-medium">Menu</span>
              </Link>

              <Link
                href="/drinks"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg p-3 hover:bg-red-50 text-stone-900"
              >
                <Coffee className="h-5 w-5 text-red-600" />
                <span className="font-medium">Drinks</span>
              </Link>

              <Link
                href="/about"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg p-3 hover:bg-red-50 text-stone-900"
              >
                <Info className="h-5 w-5 text-red-600" />
                <span className="font-medium">About</span>
              </Link>

              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg p-3 hover:bg-red-50 text-stone-900"
              >
                <Phone className="h-5 w-5 text-red-600" />
                <span className="font-medium">Contact</span>
              </Link>
            </nav>
          </div>
        </div>
      )}
      <CartDrawer />
    </header>
  );
}