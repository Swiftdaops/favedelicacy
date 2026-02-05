import api from "./api";

export const createOrder = (data) => api.post("/orders", data);
export const getOrders = (options) => api.get("/orders", options);

export const updateOrderStatus = async (id, status) => {
  // Some bundler/runtime builds have an api object without `patch`.
  // Use fetch directly to call the PATCH endpoint so this always works.
  const base =
    typeof window !== "undefined"
      ? import.meta?.env?.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      : "http://localhost:5000";

  const url = `${base.replace(/\/$/, "")}/api/orders/${id}/status`;

  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    const error = new Error(data?.message || res.statusText || "Request failed");
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return res.json();
};
