import api from "./api";
import { getOrders } from "./order.api";

function toQuery(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const listCustomers = ({ page = 1, limit = 20, q = "", segment = "", sortBy = "total_revenue", dir = "desc", signal } = {}) =>
  api
    .get(`/admin/customers${toQuery({ page, limit, q, segment, sortBy, dir })}`, { signal })
    .catch(async (err) => {
      // Fallback: older deployed backend may not have the Customers endpoints yet.
      // Derive customers + stats from /orders so the admin UI still works.
      if (!shouldFallbackToOrders(err)) throw err;
      return listCustomersFromOrders({ page, limit, q, segment, sortBy, dir, signal });
    });

export const getCustomer = (id, options) =>
  api.get(`/admin/customers/${id}`, options).catch(async (err) => {
    if (!shouldFallbackToOrders(err)) throw err;
    return getCustomerFromOrders(id, options);
  });

export const getCustomerOrders = (id, { page = 1, limit = 20, signal } = {}) =>
  api
    .get(`/admin/customers/${id}/orders${toQuery({ page, limit })}`, { signal })
    .catch(async (err) => {
      if (!shouldFallbackToOrders(err)) throw err;
      return getCustomerOrdersFromOrders(id, { page, limit, signal });
    });

function shouldFallbackToOrders(err) {
  const status = err?.status;
  const msg = String(err?.message || "");
  return status === 404 || msg.includes("Cannot GET /api/admin/customers");
}

function normalizePhone(input) {
  const digits = String(input || "").replace(/\D/g, "");
  if (!digits) return "";
  // Nigeria-friendly normalization (best-effort)
  if (digits.length === 11 && digits.startsWith("0")) return `234${digits.slice(1)}`;
  if (digits.length === 10) return `234${digits}`;
  if (digits.length === 13 && digits.startsWith("234")) return digits;
  return digits;
}

function splitName(name) {
  const raw = String(name || "").trim();
  if (!raw) return { firstName: null, lastName: null };
  const parts = raw.split(/\s+/).filter(Boolean);
  const firstName = parts[0] || null;
  const lastName = parts.length > 1 ? parts.slice(1).join(" ") : null;
  return { firstName, lastName };
}

function isRevenueStatus(status) {
  return ["paid", "confirmed", "delivered"].includes(String(status || "").toLowerCase());
}

const VIP_THRESHOLD_NGN = 20000;
function buildSegment({ lastOrderDate, totalRevenue }) {
  if ((totalRevenue || 0) >= VIP_THRESHOLD_NGN) return "VIP";
  if (!lastOrderDate) return "Lost";
  const days = (Date.now() - new Date(lastOrderDate).getTime()) / (1000 * 60 * 60 * 24);
  if (days < 30) return "Active";
  if (days <= 90) return "At Risk";
  return "Lost";
}

function ordersFromResponse(res) {
  const list = res?.data || res || [];
  return Array.isArray(list) ? list : [];
}

function groupOrdersByCustomer(orders) {
  const groups = new Map();
  for (const o of orders) {
    const phoneKey = normalizePhone(o?.customerPhone);
    const emailKey = String(o?.customerEmail || o?.email || "").trim().toLowerCase();
    const key = phoneKey || emailKey;
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(o);
  }
  return groups;
}

function computeCustomerRow(key, orders) {
  const first = orders?.[0] || {};
  const phone = normalizePhone(first?.customerPhone) || normalizePhone(first?.phone) || null;
  const name = first?.customerName || first?.name || null;
  const { firstName, lastName } = splitName(name);

  let totalOrders = 0;
  let pendingOrders = 0;
  let totalRevenue = 0;
  let revenueOrders = 0;
  let firstOrderDate = null;
  let lastOrderDate = null;

  for (const o of orders) {
    totalOrders += 1;
    if (String(o?.status || "").toLowerCase() === "pending") pendingOrders += 1;

    const createdAt = o?.createdAt ? new Date(o.createdAt) : null;
    if (createdAt && !Number.isNaN(createdAt.getTime())) {
      if (!firstOrderDate || createdAt < new Date(firstOrderDate)) firstOrderDate = createdAt.toISOString();
      if (!lastOrderDate || createdAt > new Date(lastOrderDate)) lastOrderDate = createdAt.toISOString();
    }

    if (isRevenueStatus(o?.status)) {
      revenueOrders += 1;
      totalRevenue += Number(o?.totalAmount || 0);
    }
  }

  const avgOrderValue = revenueOrders > 0 ? totalRevenue / revenueOrders : 0;
  const segment = buildSegment({ lastOrderDate, totalRevenue });

  return {
    customer: {
      _id: key,
      cid: null,
      phone,
      email: null,
      firstName,
      lastName,
      createdAt: null,
      updatedAt: null,
    },
    stats: {
      totalOrders,
      pendingOrders,
      totalRevenue,
      avgOrderValue,
      firstOrderDate,
      lastOrderDate,
      segment,
    },
  };
}

function matchQuery(row, q) {
  const query = String(q || "").trim().toLowerCase();
  if (!query) return true;
  const c = row?.customer || {};
  const name = `${c.firstName || ""} ${c.lastName || ""}`.trim().toLowerCase();
  return [c.phone, c.email, c.cid, c.firstName, c.lastName, name, c._id]
    .filter(Boolean)
    .some((v) => String(v).toLowerCase().includes(query));
}

function compareRows(sortBy, dir) {
  const asc = String(dir || "desc").toLowerCase() === "asc";
  const m = {
    total_revenue: (r) => r?.stats?.totalRevenue || 0,
    last_order_date: (r) => (r?.stats?.lastOrderDate ? new Date(r.stats.lastOrderDate).getTime() : 0),
    total_orders: (r) => r?.stats?.totalOrders || 0,
  };
  const keyFn = m[sortBy] || m.total_revenue;
  return (a, b) => {
    const av = keyFn(a);
    const bv = keyFn(b);
    if (av === bv) return String(a?.customer?._id || "").localeCompare(String(b?.customer?._id || ""));
    return asc ? av - bv : bv - av;
  };
}

async function listCustomersFromOrders({ page = 1, limit = 20, q = "", segment = "", sortBy = "total_revenue", dir = "desc", signal } = {}) {
  const res = await getOrders({ signal }).catch(async (err) => {
    // In case getOrders isn't accepting options in some older code
    if (signal) {
      return api.get("/orders", { signal });
    }
    throw err;
  });
  const orders = ordersFromResponse(res);
  const groups = groupOrdersByCustomer(orders);
  let rows = Array.from(groups.entries()).map(([key, list]) => computeCustomerRow(key, list));

  rows = rows.filter((r) => matchQuery(r, q));
  if (segment) rows = rows.filter((r) => r?.stats?.segment === segment);
  rows.sort(compareRows(sortBy, dir));

  const total = rows.length;
  const safeLimit = Math.min(100, Math.max(5, Number(limit || 20)));
  const safePage = Math.max(1, Number(page || 1));
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const start = (safePage - 1) * safeLimit;
  const items = rows.slice(start, start + safeLimit);

  return {
    items,
    meta: { page: safePage, limit: safeLimit, total, totalPages },
  };
}

async function getCustomerFromOrders(id, options = {}) {
  const res = await getOrders({ signal: options?.signal }).catch(async (err) => {
    if (options?.signal) return api.get("/orders", { signal: options.signal });
    throw err;
  });
  const orders = ordersFromResponse(res);
  const groups = groupOrdersByCustomer(orders);
  const list = groups.get(String(id)) || [];
  if (!list.length) {
    const e = new Error("Customer not found");
    e.status = 404;
    throw e;
  }
  const row = computeCustomerRow(String(id), list);
  return { customer: row.customer, stats: row.stats };
}

async function getCustomerOrdersFromOrders(id, { page = 1, limit = 20, signal } = {}) {
  const res = await getOrders({ signal }).catch(async (err) => {
    if (signal) return api.get("/orders", { signal });
    throw err;
  });
  const orders = ordersFromResponse(res);
  const key = String(id);
  const list = orders.filter((o) => {
    const phoneKey = normalizePhone(o?.customerPhone);
    const emailKey = String(o?.customerEmail || o?.email || "").trim().toLowerCase();
    return (phoneKey && phoneKey === key) || (!phoneKey && emailKey && emailKey === key);
  });
  // newest first
  list.sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime());

  const safeLimit = Math.min(100, Math.max(5, Number(limit || 20)));
  const safePage = Math.max(1, Number(page || 1));
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const start = (safePage - 1) * safeLimit;
  const items = list.slice(start, start + safeLimit);

  return {
    items,
    meta: { page: safePage, limit: safeLimit, total, totalPages },
  };
}

export default { listCustomers, getCustomer, getCustomerOrders };
