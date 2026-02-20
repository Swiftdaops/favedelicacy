import api from "./api";

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
  api.get(`/admin/customers${toQuery({ page, limit, q, segment, sortBy, dir })}`, { signal });

export const getCustomer = (id, options) => api.get(`/admin/customers/${id}`, options);

export const getCustomerOrders = (id, { page = 1, limit = 20, signal } = {}) =>
  api.get(`/admin/customers/${id}/orders${toQuery({ page, limit })}`, { signal });

export default { listCustomers, getCustomer, getCustomerOrders };
