import api from "./api";

export const createOrder = (data) => api.post("/orders", data);
export const getOrders = () => api.get("/orders");
export const updateOrderStatus = (id, status) =>
  api.patch(`/orders/${id}/status`, { status });
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

export default { createOrder, getOrders, updateOrderStatus };
