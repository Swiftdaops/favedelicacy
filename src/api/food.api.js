import api from "./api";

export const getFoods = (all = false) => api.get(`/foods${all ? "?all=true" : ""}`);
export const createFood = (formData) => api.post("/foods", formData);
export const createFoodPublic = (formData) => api.post("/foods/public", formData);
export const updateFood = (id, formData) => api.put(`/foods/${id}`, formData);
export const deleteFood = (id) => api.delete(`/foods/${id}`);
