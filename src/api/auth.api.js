import api from "./api";

export const loginAdmin = (data) => api.post("/auth/login", data);
export const logoutAdmin = () => api.post("/auth/logout");
export const getAdminProfile = () => api.get("/auth/me");
// file uploads may take longer; increase timeout to 60s
export const uploadAdminAvatar = (formData) => api.post("/auth/avatar", formData, { timeout: 60000 });
