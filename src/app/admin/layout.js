"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutAdmin, getAdminProfile, uploadAdminAvatar } from "@/api/auth.api";
import { Grid, Utensils, Coffee, Package, CreditCard, Tag, LogOut, Menu, X, Plus } from "lucide-react";

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(true);
  const [admin, setAdmin] = useState(null);
  const fileRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // start collapsed on small screens
    const handleResize = () => setOpen(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await getAdminProfile();
        if (!mounted) return;
        setAdmin(res?.data || null);
      } catch (err) {
        // ignore
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  return (
    <div className="min-h-screen flex text-stone-900">
      <aside
        className={`relative transition-all duration-300 ease-in-out bg-[var(--color-secondary)] text-stone-900 flex-shrink-0 ${
          open ? "w-64 p-6" : "w-16 p-3"
        }`}
      >
        <div className="flex items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              {admin?.avatar?.url ? (
                <img src={admin.avatar.url} alt="admin" className={`h-10 w-10 rounded-full object-cover ${open ? '' : ''}`} />
              ) : (
                <div
                  className={`h-10 w-10 rounded-full bg-white/30 flex items-center justify-center font-bold text-stone-950 ${
                    open ? "text-lg" : "text-sm"
                  }`}
                >
                  AD
                </div>
              )}

              {/* when sidebar collapsed, place hamburger on top of profile pic */}
              {!open && (
                <button
                  onClick={() => setOpen(true)}
                  aria-label="Open sidebar"
                  className="absolute inset-0 m-auto z-40 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-secondary)] text-white md:hidden"
                >
                  <Menu className="w-4 h-4" />
                </button>
              )}

              {/* plus icon to upload avatar when none */}
              {open && !admin?.avatar?.url && (
                <button onClick={() => fileRef.current?.click()} className="absolute -bottom-2 right-0 z-30 rounded-full bg-white/20 p-1">
                  <Plus className="w-3 h-3 text-white" />
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const fd = new FormData();
                fd.append('avatar', f);
                try {
                  const res = await uploadAdminAvatar(fd);
                  setAdmin(res?.data || null);
                } catch (err) {
                  console.error(err);
                }
              }} />
            </div>
            {open && (
              <div>
                <div className="font-semibold">Admin</div>
                <div className="text-sm">{admin?.email || 'favedelicacy@admin.com'}</div>
                <div className="mt-2">
                  <button
                    onClick={() => setOpen(false)}
                    className="text-xs rounded-full px-3 py-1 border border-white/20 bg-transparent hover:bg-white/5"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* mobile open button moved into the profile area when collapsed */}

        <nav className="flex flex-col gap-2">
          <Link href="/admin/dashboard" className={`flex items-center gap-3 rounded px-3 py-2 hover:bg-white/10 ${open ? '' : 'justify-center'}`}>
            <Grid className="w-4 h-4" />
            {open && <span>Dashboard</span>}
          </Link>

          <Link href="/admin/foods" className={`flex items-center gap-3 rounded px-3 py-2 hover:bg-white/10 ${open ? '' : 'justify-center'}`}>
            <Utensils className="w-4 h-4" />
            {open && <span>Foods</span>}
          </Link>

          <Link href="/admin/drinks" className={`flex items-center gap-3 rounded px-3 py-2 hover:bg-white/10 ${open ? '' : 'justify-center'}`}>
            <Coffee className="w-4 h-4" />
            {open && <span>Drinks</span>}
          </Link>

          <Link href="/admin/orders" className={`flex items-center gap-3 rounded px-3 py-2 hover:bg-white/10 ${open ? '' : 'justify-center'}`}>
            <Package className="w-4 h-4" />
            {open && <span>Orders</span>}
          </Link>

          <Link href="/admin/payments" className={`flex items-center gap-3 rounded px-3 py-2 hover:bg-white/10 ${open ? '' : 'justify-center'}`}>
            <CreditCard className="w-4 h-4" />
            {open && <span>Payments</span>}
          </Link>
          <button
            onClick={async () => {
              try {
                await logoutAdmin();
              } catch (err) {
                // ignore errors, still redirect
              }
              router.push('/admin/login');
            }}
            className={`mt-4 flex items-center gap-3 rounded px-3 py-2 hover:bg-white/10 ${open ? '' : 'justify-center'} text-red-600`}
          >
            <LogOut className="w-4 h-4" />
            {open && <span>Logout</span>}
          </button>
        </nav>
      </aside>

      <main className="flex-1 bg-[var(--color-primary)] p-6 text-stone-900 relative">
        {/* mobile open button moved into the sidebar to sit over profile when collapsed */}

        {children}
      </main>
    </div>
  );
}

