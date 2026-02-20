import api from "./api";

export const createOrder = (data) => api.post("/orders", data);
export const getOrders = () => api.get("/orders");
export const getPendingOrdersCount = async (options) => {
  // The deployed backend may not expose /orders/pending-count.
  // Compute it from /orders to keep the admin poller working.
  const res = await api.get("/orders", options);
  const list = res?.data || res || [];
  const count = Array.isArray(list)
    ? list.filter((o) => o && o.status === "pending").length
    : 0;
  return { count };
};
export const updateOrderStatus = (id, status) =>
  api.patch(`/orders/${id}/status`, { status });
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

export default { createOrder, getOrders, getPendingOrdersCount, updateOrderStatus, deleteOrder };
