"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logoutAdmin, uploadAdminAvatar } from "@/api/auth.api";
import { Grid, Utensils, Coffee, Package, CreditCard, LogOut, Menu, Plus, Bell } from "lucide-react";
import { useEffect } from "react";
import { getOrders } from "@/api/order.api";
import { AuthProvider, useAuth } from "@/context/AuthProvider";

function AdminLayoutInner({ children }) {
      const [open, setOpen] = useState(true);
      const fileRef = useRef(null);
      const router = useRouter();
      const { admin, setAdmin } = useAuth();
      const [pendingCount, setPendingCount] = useState(0);
      const [lastSeenCount, setLastSeenCount] = useState(() => {
        try {
          const v = localStorage.getItem('admin_last_seen_orders_count');
          return v ? Number(v) : 0;
        } catch (e) {
          return 0;
        }
      });

      useEffect(() => {
        let mounted = true;
        let channel;
        async function load() {
          try {
            const res = await getOrders();
            const list = res?.data || res || [];
            if (!mounted) return;
            const pending = list.filter((o) => o.status === "pending").length;
            setPendingCount(pending);
          } catch (err) {
            // ignore
          }
        }

        function onMessage(e) {
          try {
            const data = e?.data || (typeof e === 'string' ? JSON.parse(e) : null);
            if (!data) return;
            if (data.type === 'orders-updated') {
              if (typeof data.pendingCount === 'number') setPendingCount(data.pendingCount);
              else load();
            } else if (data.type === 'orders-viewed') {
              // another tab viewed orders, update lastSeen
              const seen = Number(data.pendingCount || 0);
              setLastSeenCount(seen);
              try { localStorage.setItem('admin_last_seen_orders_count', String(seen)); } catch(e){}
            }
          } catch (err) {}
        }

        // BroadcastChannel for same-origin tabs
        try {
          channel = new BroadcastChannel('admin-orders');
          channel.addEventListener('message', onMessage);
        } catch (e) {
          // fallback: listen to storage events
          window.addEventListener('storage', (ev) => {
            if (ev.key === 'admin_orders_updated') {
              try {
                const data = JSON.parse(ev.newValue || '{}');
                if (data && typeof data.pendingCount === 'number') setPendingCount(data.pendingCount);
              } catch (err) {}
            }
            if (ev.key === 'admin_orders_viewed') {
              try {
                const data = JSON.parse(ev.newValue || '{}');
                if (data && typeof data.pendingCount === 'number') {
                  setLastSeenCount(data.pendingCount);
                }
              } catch (err) {}
            }
          });
        }

        load();
        const id = setInterval(load, 15000);
        return () => {
          mounted = false;
          clearInterval(id);
          try { channel?.close?.(); } catch (e) {}
        };
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
                    <img src={admin.avatar.url} alt="admin" className={`h-10 w-10 rounded-full object-cover ${open ? "" : ""}`} />
                  ) : (
                    <div
                      className={`h-10 w-10 rounded-full bg-white/30 flex items-center justify-center font-bold text-stone-950 ${
                        open ? "text-lg" : "text-sm"
                      }`}
                    >
                      AD
                    </div>
                  )}

                  {!open && (
                    <button
                      onClick={() => setOpen(true)}
                      aria-label="Open sidebar"
                      className="absolute inset-0 m-auto z-40 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-secondary)] text-white md:hidden"
                    >
                      <Menu className="w-4 h-4" />
                    </button>
                  )}

                  {open && !admin?.avatar?.url && (
                    <button onClick={() => fileRef.current?.click()} className="absolute -bottom-2 right-0 z-30 rounded-full bg-white/20 p-1">
                      <Plus className="w-3 h-3 text-white" />
                    </button>
                  )}

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const fd = new FormData();
                      fd.append("avatar", f);
                      try {
                        const res = await uploadAdminAvatar(fd);
                        setAdmin(res?.data || null);
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                  />
                </div>

                {open && (
                  <div>
                    <div className="font-semibold">Fave</div>
                    <div className="text-sm">{admin?.email || "favedelicacy@admin.com"}</div>
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                          <button
                          onClick={() => {
                            // mark as viewed and navigate
                            try { localStorage.setItem('admin_last_seen_orders_count', String(pendingCount)); } catch (e) {}
                            setLastSeenCount(pendingCount);
                            try {
                              const ch = new BroadcastChannel('admin-orders');
                              ch.postMessage({ type: 'orders-viewed', pendingCount });
                              ch.close();
                            } catch (e) {
                              try { localStorage.setItem('admin_orders_viewed', JSON.stringify({ ts: Date.now(), pendingCount })); } catch (e) {}
                            }
                            router.push('/admin/orders');
                          }}
                          aria-label="Orders"
                          className="relative p-2 rounded-full hover:bg-white/5"
                        >
                          <Bell className="w-4 h-4" />
                          {(pendingCount > (lastSeenCount || 0)) && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{pendingCount - (lastSeenCount || 0)}</span>
                          )}
                        </button>

                        <button
                          onClick={() => setOpen(false)}
                          className="text-xs rounded-full px-3 py-1 border border-white/20 bg-transparent hover:bg-white/5"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              <Link href="/admin/dashboard" className={`flex items-center gap-3 rounded px-3 py-2 hover:bg-white/10 ${open ? "" : "justify-center"}`}>
                <Grid className="w-4 h-4" />
                {open && <span>Dashboard</span>}
              </Link>

              <Link href="/admin/foods" className={`flex items-center gap-3 rounded px-3 py-2 hover:bg-white/10 ${open ? "" : "justify-center"}`}>
                <Utensils className="w-4 h-4" />
                {open && <span>Foods</span>}
              </Link>

              <Link href="/admin/drinks" className={`flex items-center gap-3 rounded px-3 py-2 hover:bg-white/10 ${open ? "" : "justify-center"}`}>
                <Coffee className="w-4 h-4" />
                {open && <span>Drinks</span>}
              </Link>

              <Link href="/admin/orders" className={`flex items-center gap-3 rounded px-3 py-2 hover:bg-white/10 ${open ? "" : "justify-center"}`}>
                <Package className="w-4 h-4" />
                {open && <span>Orders</span>}
              </Link>

              <Link href="/admin/payments" className={`flex items-center gap-3 rounded px-3 py-2 hover:bg-white/10 ${open ? "" : "justify-center"}`}>
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
                  router.push("/admin/login");
                }}
                className={`mt-4 flex items-center gap-3 rounded px-3 py-2 hover:bg-white/10 ${open ? "" : "justify-center"} text-red-600`}
              >
                <LogOut className="w-4 h-4" />
                {open && <span>Logout</span>}
              </button>
            </nav>
          </aside>

          <main className="flex-1 bg-[var(--color-primary)] p-6 text-stone-900 relative">{children}</main>
        </div>
      );
    }

    export default function AdminLayout({ children }) {
      return (
        <AuthProvider>
          <AdminLayoutInner>{children}</AdminLayoutInner>
        </AuthProvider>
      );
    }

