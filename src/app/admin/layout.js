"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAdmin, uploadAdminAvatar } from "@/api/auth.api";
import { Grid, Utensils, Coffee, Package, CreditCard, LogOut, Menu, Plus, Bell, Users } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { getPendingOrdersCount } from "@/api/order.api";
import { AuthProvider, useAuth } from "@/context/AuthProvider";

function AdminLayoutInner({ children }) {
  const [open, setOpen] = useState(true);
  const fileRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const isLoginRoute = pathname === "/admin/login";
  const { admin, setAdmin } = useAuth();

  const [nowTs, setNowTs] = useState(0);

  const [pendingCount, setPendingCount] = useState(0);
  const [lastUpdateTs, setLastUpdateTs] = useState(0);
  const [stoppedPolling, setStoppedPolling] = useState(false);
  const [lastSeenCount, setLastSeenCount] = useState(() => {
    try {
      const v = localStorage.getItem("admin_last_seen_orders_count");
      return v ? Number(v) : 0;
    } catch (e) {
      return 0;
    }
  });

  const unread = Math.max(0, pendingCount - (lastSeenCount || 0));
  const unreadReliable = unread > 0 && nowTs - (lastUpdateTs || 0) < 30000;

  useEffect(() => {
    if (isLoginRoute) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNowTs(Date.now());
    const t = setInterval(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNowTs(Date.now());
    }, 1000);
    return () => clearInterval(t);
  }, [isLoginRoute]);

  useEffect(() => {
    if (isLoginRoute) return;

    let bc = null;
    try {
      bc = new BroadcastChannel("favedelicacy_admin");
    } catch (e) {
      bc = null;
    }

    const zeroStreakRef = { current: 0 };
    const stoppedRef = { current: false };

    const sync = async () => {
      try {
        const res = await getPendingOrdersCount();
        const count = res?.count ?? 0;
        setPendingCount(count);
        setLastUpdateTs(Date.now());

        // resume if a new order appears while we had stopped polling
        if (count > 0 && stoppedRef.current) {
          stoppedRef.current = false;
          setStoppedPolling(false);
          startInterval();
        }

        if (count === 0) {
          zeroStreakRef.current = (zeroStreakRef.current || 0) + 1;
          // if we see several consecutive zero responses, stop polling to avoid unnecessary requests
          if (zeroStreakRef.current >= 3 && !stoppedRef.current) {
            stoppedRef.current = true;
            setStoppedPolling(true);
            stopInterval();
          }
        } else {
          zeroStreakRef.current = 0;
        }

        return count;
      } catch (e) {
        return null;
      }
    };

    let iv = null;
    const startInterval = () => {
      if (iv) clearInterval(iv);
      iv = setInterval(() => {
        if (!stoppedRef.current) sync();
      }, 5000);
    };

    const stopInterval = () => {
      if (iv) {
        clearInterval(iv);
        iv = null;
      }
    };

    // initial sync + heartbeat broadcast
    sync().then((count) => {
      try {
        if (bc) bc.postMessage({ type: "heartbeat", data: { count } });
        else
          localStorage.setItem(
            "favedelicacy_admin_heartbeat",
            JSON.stringify({ ts: Date.now(), count })
          );
      } catch (e) {}
    });

    // start the polling interval (unless immediately stopped by consecutive zeros)
    startInterval();

    const handle = (e) => {
      if (!e) return;
      const { data, type } = e?.data || e || {};
      if (type === "orders-updated") {
        toast.success("Orders updated", {
          action: (
            <button
              className="underline"
              onClick={() => {
                router.push("/admin/dashboard/orders");
                try {
                  localStorage.setItem(
                    "admin_last_seen_orders_count",
                    String(pendingCount)
                  );
                } catch (e) {}
                setLastSeenCount(pendingCount);
              }}
            >
              View
            </button>
          ),
        });
        sync();
      } else if (type === "orders-viewed") {
        const c = Number(data?.count || 0);
        setLastSeenCount(c);
        try {
          localStorage.setItem("admin_last_seen_orders_count", String(c));
        } catch (e) {}
      } else if (type === "heartbeat") {
        const c = Number(data?.count || 0);
        setPendingCount(c);
        setLastUpdateTs(Date.now());
        // resume polling if other tabs report new orders
        try {
          if (c > 0 && stoppedRef.current) {
            stoppedRef.current = false;
            setStoppedPolling(false);
            startInterval();
          }
        } catch (e) {}
      }
    };

    if (bc) bc.onmessage = handle;

    const onStorage = (ev) => {
      try {
        if (ev.key === "favedelicacy_admin_heartbeat") {
          const obj = JSON.parse(ev.newValue || "{}");
          if (obj && obj.count != null) {
            setPendingCount(Number(obj.count));
            setLastUpdateTs(Date.now());
          }
        } else if (ev.key === "favedelicacy_admin") {
          const parsed = JSON.parse(ev.newValue || "{}");
          if (parsed?.type === "orders-updated") {
            handle({ data: parsed });
          }
        }
      } catch (e) {}
    };

    window.addEventListener("storage", onStorage);

    

    return () => {
      if (bc) try { bc.close(); } catch (e) {}
      window.removeEventListener("storage", onStorage);
      stopInterval();
    };
  }, [router, isLoginRoute]);

  if (isLoginRoute) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen flex text-stone-900">
      <aside
        className={`relative transition-all duration-300 ease-in-out bg-(--color-secondary) text-stone-900 shrink-0 ${
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
                  className="absolute inset-0 m-auto z-40 flex h-10 w-10 items-center justify-center rounded-full bg-(--color-secondary) text-white md:hidden"
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
                        try {
                          localStorage.setItem("admin_last_seen_orders_count", String(pendingCount));
                        } catch (e) {}
                        setLastSeenCount(pendingCount);
                        try {
                          const ch = new BroadcastChannel("admin-orders");
                          ch.postMessage({ type: "orders-viewed", pendingCount });
                          ch.close();
                        } catch (e) {
                          try {
                            localStorage.setItem(
                              "admin_orders_viewed",
                              JSON.stringify({ ts: Date.now(), pendingCount })
                            );
                          } catch (err) {}
                        }
                        router.push("/admin/orders");
                      }}
                      aria-label="Orders"
                      className="relative p-2 rounded-full hover:bg-white/5"
                    >
                      <Bell className="w-4 h-4" />
                      {unread > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{unread}</span>
                      )}
                      {!unreadReliable && unread > 0 && (
                        <span className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-[10px] rounded-full px-1">syncing</span>
                      )}
                    </button>

                    {stoppedPolling && pendingCount === 0 && (
                      <span className="text-xs text-white/60 ml-2">No new orders</span>
                    )}

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

          <Link href="/admin/customers" className={`flex items-center gap-3 rounded px-3 py-2 hover:bg-white/10 ${open ? "" : "justify-center"}`}>
            <Users className="w-4 h-4" />
            {open && <span>Customers</span>}
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

      <main className="flex-1 bg-(--color-primary) p-6 text-stone-900 relative">{children}</main>
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

