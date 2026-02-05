import api from './api';

export const getDrinks = (all = false) => api.get(`/drinks${all ? '?all=true' : ''}`);
export const createDrink = (data) => api.post('/drinks', data);
export const createDrinkPublic = (data) => api.post('/drinks/public', data);
export const updateDrink = (id, data) => api.put(`/drinks/${id}`, data);
export const deleteDrink = (id) => api.delete(`/drinks/${id}`);

export default { getDrinks, createDrink, updateDrink, deleteDrink };
