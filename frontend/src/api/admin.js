import api from "./axios";

export const listUsers = (params) => api.get("/admin/users", { params });
export const createUser = (data) => api.post("/admin/users", data);
export const updateUser = (id, data) => api.patch(`/admin/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
