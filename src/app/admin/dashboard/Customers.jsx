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

function segmentBadgeClass(segment) {
  switch (segment) {
    case "VIP":
      return "bg-stone-900 text-white";
    case "Active":
      // Requested: lime-500 with a subtle glow + pulse
      return "bg-lime-500 text-white ring-2 ring-lime-500/30 shadow-sm shadow-stone-900/5 animate-pulse";
    case "At Risk":
      return "bg-stone-200 text-stone-900";
    case "Lost":
      return "bg-stone-50 text-stone-600";
    default:
      return "bg-stone-50 text-stone-600";
  }
}

function SkeletonRow({ i }) {
  return (
    <tr className={i % 2 === 0 ? "bg-white" : "bg-stone-50"}>
      <td className="px-4 py-3">
        <div className="h-4 w-40 rounded bg-stone-200/70" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-28 rounded bg-stone-200/70" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-10 rounded bg-stone-200/70 ml-auto" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-16 rounded bg-stone-200/70 ml-auto" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-14 rounded bg-stone-200/70 ml-auto" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-20 rounded bg-stone-200/70" />
      </td>
      <td className="px-4 py-3">
        <div className="h-6 w-14 rounded-full bg-stone-200/70" />
      </td>
    </tr>
  );
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
      <div className="rounded-xl border card">
        <div className="p-4 sm:p-6 border-b">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
              <div className="text-sm text-stone-500">Customer intelligence overview</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 w-full lg:w-auto">
              <div className="sm:col-span-2">
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search name, phone, email, CID"
                  className="w-full rounded-md border  px-3 py-2 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200"
                />
              </div>

              <select
                value={segment}
                onChange={(e) => {
                  setSegment(e.target.value);
                  setPage(1);
                }}
                className="rounded-md border card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-200"
              >
                <option value="">All segments</option>
                <option value="Active">Active</option>
                <option value="At Risk">At Risk</option>
                <option value="Lost">Lost</option>
                <option value="VIP">VIP</option>
              </select>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border  px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-200"
                >
                  <option value="total_revenue">Revenue</option>
                  <option value="last_order_date">Last order</option>
                  <option value="total_orders">Orders</option>
                </select>
                <select
                  value={dir}
                  onChange={(e) => setDir(e.target.value)}
                  className="rounded-md border  px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-200"
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="text-xs text-stone-500">
            {loading ? "Loading customers…" : `Showing ${items.length} on this page • ${meta.total} total`}
          </div>
          {!loading && !error ? (
            <div className="text-xs text-stone-500">Page {meta.page} / {meta.totalPages}</div>
          ) : null}
        </div>

        {error ? (
          <div className="px-4 sm:px-6 pb-4">
            <div className="rounded-lg border border-red-200 card px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          </div>
        ) : null}

        <div className="w-full overflow-auto">
          <table className="w-full table-fixed border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="card border-y">
                <th className="text-left px-4 py-3 text-xs font-medium text-stone-500">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-stone-500">Phone</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-stone-500 w-24">Orders</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-stone-500 w-32">Revenue</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-stone-500 w-32">Avg</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 w-28">Last</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-stone-500 w-24">Segment</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} i={i} />)
                : items.map((row, i) => {
                    const c = row.customer;
                    const s = row.stats;
                    return (
                      <tr
                        key={c?._id}
                        className={
                          "border-b last:border-b-0 cursor-pointer hover:bg-stone-100/70 " +
                          (i % 2 === 0 ? "card" : "card")
                        }
                        onClick={() => router.push(`/admin/customers/${c._id}`)}
                      >
                        <td className="px-4 py-3">
                          <div className="text-sm text-stone-900 font-semibold truncate">{displayName(c)}</div>
                          <div className="text-xs text-stone-500 truncate">{c?.email || c?.cid || "—"}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-stone-700 truncate">{c?.phone || "—"}</td>
                        <td className="px-4 py-3 text-sm text-stone-900 text-right tabular-nums">{s?.totalOrders ?? 0}</td>
                        <td className="px-4 py-3 text-sm text-stone-900 text-right tabular-nums">{fmtMoney(s?.totalRevenue)}</td>
                        <td className="px-4 py-3 text-sm text-stone-900 text-right tabular-nums">{fmtMoney(s?.avgOrderValue)}</td>
                        <td className="px-4 py-3 text-sm text-stone-600 truncate">{fmtDate(s?.lastOrderDate)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap " +
                              segmentBadgeClass(s?.segment)
                            }
                          >
                            {s?.segment || "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

              {!loading && !error && items.length === 0 && (
                <tr>
                  <td className="px-4 py-10 text-sm text-stone-500" colSpan={7}>
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-stone-500">
            Page {meta.page} / {meta.totalPages} • {meta.total} total
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-2 rounded-md border bg-white text-sm disabled:opacity-50"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <button
              className="px-3 py-2 rounded-md border bg-white text-sm disabled:opacity-50"
              disabled={page >= (meta.totalPages || 1) || loading}
              onClick={() => setPage((p) => Math.min(meta.totalPages || 1, p + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
