"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCustomer, getCustomerOrders } from "@/api/customer.api";

function fmtMoney(v) {
  return `₦${Number(v || 0).toLocaleString()}`;
}

function fmtDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return "—";
  }
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersMeta, setOrdersMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const name = useMemo(() => {
    const fn = customer?.firstName || "";
    const ln = customer?.lastName || "";
    const full = `${fn} ${ln}`.trim();
    return full || customer?.phone || customer?.email || "Customer";
  }, [customer]);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const profile = await getCustomer(id, { signal: controller.signal });
        const ord = await getCustomerOrders(id, { page: 1, limit: 20, signal: controller.signal });
        if (!mounted) return;
        setCustomer(profile?.customer || null);
        setStats(profile?.stats || null);
        setOrders(ord?.items || []);
        setOrdersMeta(ord?.meta || { page: 1, limit: 20, total: 0, totalPages: 1 });
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load customer");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [id]);

  return (
    <div className="space-y-5 text-stone-950">
      <div className="flex items-center justify-between gap-3">
        <div>
          <button onClick={() => router.push("/admin/customers")} className="text-sm underline">Back</button>
          <h1 className="text-2xl font-bold mt-2">{name}</h1>
          <div className="text-sm text-stone-600">
            {customer?.phone ? <span className="mr-3">Phone: {customer.phone}</span> : null}
            {customer?.email ? <span>Email: {customer.email}</span> : null}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-stone-500">Segment</div>
          <div className="font-semibold">{stats?.segment || "—"}</div>
        </div>
      </div>

      {loading && <div className="text-sm text-stone-500">Loading…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg border p-4">
              <div className="text-xs text-stone-500">Total Orders</div>
              <div className="text-xl font-black">{stats?.totalOrders ?? 0}</div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-xs text-stone-500">Total Revenue</div>
              <div className="text-xl font-black">{fmtMoney(stats?.totalRevenue)}</div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-xs text-stone-500">Avg Order</div>
              <div className="text-xl font-black">{fmtMoney(stats?.avgOrderValue)}</div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="text-xs text-stone-500">Pending Orders</div>
              <div className="text-xl font-black">{stats?.pendingOrders ?? 0}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <div className="p-4 border-b">
              <div className="font-semibold">Orders</div>
              <div className="text-xs text-stone-500">Most recent first</div>
            </div>

            <div className="w-full overflow-auto">
              <table className="w-full table-fixed border-collapse">
                <thead>
                  <tr className="bg-stone-50">
                    <th className="text-left px-4 py-2 text-xs text-stone-500 w-28">Order</th>
                    <th className="text-left px-4 py-2 text-xs text-stone-500">Items</th>
                    <th className="text-right px-4 py-2 text-xs text-stone-500">Total</th>
                    <th className="text-left px-4 py-2 text-xs text-stone-500">Status</th>
                    <th className="text-left px-4 py-2 text-xs text-stone-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id} className="border-b last:border-b-0 bg-white odd:bg-white even:bg-stone-50">
                      <td className="px-4 py-3 text-sm text-stone-900 font-medium truncate">{o._id?.slice?.(0, 8) || o._id}</td>
                      <td className="px-4 py-3 text-sm text-stone-700">{(o.items || []).length}</td>
                      <td className="px-4 py-3 text-sm text-stone-900 text-right">{fmtMoney(o.totalAmount)}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{o.status}</td>
                      <td className="px-4 py-3 text-sm text-stone-600 truncate">{fmtDate(o.createdAt)}</td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-sm text-stone-500" colSpan={5}>No orders for this customer.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 flex items-center justify-between gap-3">
              <div className="text-xs text-stone-500">
                Page {ordersMeta.page} / {ordersMeta.totalPages} • {ordersMeta.total} total
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-2 rounded border text-sm disabled:opacity-50"
                  disabled={ordersMeta.page <= 1}
                  onClick={async () => {
                    const nextPage = Math.max(1, (ordersMeta.page || 1) - 1);
                    const res = await getCustomerOrders(id, { page: nextPage, limit: ordersMeta.limit || 20 });
                    setOrders(res?.items || []);
                    setOrdersMeta(res?.meta || ordersMeta);
                  }}
                >
                  Prev
                </button>
                <button
                  className="px-3 py-2 rounded border text-sm disabled:opacity-50"
                  disabled={ordersMeta.page >= ordersMeta.totalPages}
                  onClick={async () => {
                    const nextPage = Math.min(ordersMeta.totalPages || 1, (ordersMeta.page || 1) + 1);
                    const res = await getCustomerOrders(id, { page: nextPage, limit: ordersMeta.limit || 20 });
                    setOrders(res?.items || []);
                    setOrdersMeta(res?.meta || ordersMeta);
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
