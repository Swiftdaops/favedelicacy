"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { listCustomers } from "@/api/customer.api";

function fmtMoney(v) {
  return `₦${Number(v || 0).toLocaleString()}`;
}

function fmtDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return "—";
  }
}

function displayName(c) {
  const full = `${c?.firstName || ""} ${c?.lastName || ""}`.trim();
  return full || c?.phone || c?.email || "—";
}

export default function Customers() {
  const router = useRouter();

  const [q, setQ] = useState("");
  const [segment, setSegment] = useState("");
  const [sortBy, setSortBy] = useState("total_revenue");
  const [dir, setDir] = useState("desc");
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const queryKey = useMemo(() => ({ q, segment, sortBy, dir, page }), [q, segment, sortBy, dir, page]);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const t = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await listCustomers({ ...queryKey, limit: 20, signal: controller.signal });
        if (!mounted) return;
        setItems(res?.items || []);
        setMeta(res?.meta || { page: 1, limit: 20, total: 0, totalPages: 1 });
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load customers");
        setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }, 250);

    return () => {
      mounted = false;
      clearTimeout(t);
      controller.abort();
    };
  }, [queryKey]);

  return (
    <div className="space-y-4 text-stone-950 pb-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <div className="text-sm text-stone-500">Customer intelligence overview</div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search name, phone, email, CID"
            className="w-full sm:w-72 rounded border px-3 py-2 text-sm"
          />
          <select
            value={segment}
            onChange={(e) => {
              setSegment(e.target.value);
              setPage(1);
            }}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="">All</option>
            <option value="Active">Active</option>
            <option value="At Risk">At Risk</option>
            <option value="Lost">Lost</option>
            <option value="VIP">VIP</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded border px-3 py-2 text-sm">
            <option value="total_revenue">Revenue</option>
            <option value="last_order_date">Last order</option>
            <option value="total_orders">Orders</option>
          </select>
          <select value={dir} onChange={(e) => setDir(e.target.value)} className="rounded border px-3 py-2 text-sm">
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
      </div>

      {loading && <div className="text-sm text-stone-500">Loading…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className="text-sm text-stone-500">No customers yet.</div>
      )}

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="w-full overflow-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-stone-50">
                <th className="text-left px-4 py-2 text-xs text-stone-500">Name</th>
                <th className="text-left px-4 py-2 text-xs text-stone-500">Phone</th>
                <th className="text-right px-4 py-2 text-xs text-stone-500 w-24">Orders</th>
                <th className="text-right px-4 py-2 text-xs text-stone-500 w-32">Revenue</th>
                <th className="text-right px-4 py-2 text-xs text-stone-500 w-32">Avg</th>
                <th className="text-left px-4 py-2 text-xs text-stone-500 w-28">Last</th>
                <th className="text-left px-4 py-2 text-xs text-stone-500 w-24">Segment</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => {
                const c = row.customer;
                const s = row.stats;
                return (
                  <tr
                    key={c?._id}
                    className="border-b last:border-b-0 bg-white odd:bg-white even:bg-stone-50 cursor-pointer"
                    onClick={() => router.push(`/admin/customers/${c._id}`)}
                  >
                    <td className="px-4 py-3 text-sm text-stone-900 font-medium truncate">{displayName(c)}</td>
                    <td className="px-4 py-3 text-sm text-stone-700 truncate">{c?.phone || "—"}</td>
                    <td className="px-4 py-3 text-sm text-stone-900 text-right">{s?.totalOrders ?? 0}</td>
                    <td className="px-4 py-3 text-sm text-stone-900 text-right">{fmtMoney(s?.totalRevenue)}</td>
                    <td className="px-4 py-3 text-sm text-stone-900 text-right">{fmtMoney(s?.avgOrderValue)}</td>
                    <td className="px-4 py-3 text-sm text-stone-600 truncate">{fmtDate(s?.lastOrderDate)}</td>
                    <td className="px-4 py-3 text-sm text-stone-900 whitespace-nowrap">{s?.segment || "—"}</td>
                  </tr>
                );
              })}

              {!loading && items.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-sm text-stone-500" colSpan={7}>No results.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 flex items-center justify-between gap-3">
          <div className="text-xs text-stone-500">
            Page {meta.page} / {meta.totalPages} • {meta.total} total
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded border text-sm disabled:opacity-50" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
            <button className="px-3 py-2 rounded border text-sm disabled:opacity-50" disabled={page >= (meta.totalPages || 1)} onClick={() => setPage((p) => Math.min(meta.totalPages || 1, p + 1))}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
