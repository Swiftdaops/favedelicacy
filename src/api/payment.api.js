import api from "./api";

// Uploads can take longer — increase timeout for uploads
export const uploadPaymentProof = (formData) => api.post("/payments", formData, { timeout: 60000 });
export const getPayments = (options) => api.get("/payments", options);
export const verifyPayment = (id) => api.patch(`/payments/${id}/verify`);
export const unverifyPayment = (id) => api.patch(`/payments/${id}/unverify`);
export const deletePayment = (id) => api.delete(`/payments/${id}`);
