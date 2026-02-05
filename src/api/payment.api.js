import api from "./api";

export const uploadPaymentProof = (formData) => api.post("/payments", formData);
export const getPayments = (options) => api.get("/payments", options);
export const verifyPayment = (id) => api.patch(`/payments/${id}/verify`);
export const deletePayment = (id) => api.delete(`/payments/${id}`);
