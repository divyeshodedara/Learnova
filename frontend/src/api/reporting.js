import api from "./axios";

export const getOverview = () => api.get("/reporting");
export const getUserProgress = (params) => api.get("/reporting/users", { params });
