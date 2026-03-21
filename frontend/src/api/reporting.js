import api from "./axios";

export const getOverview = () => api.get("/reporting/reporting");
export const getUserProgress = (params) => api.get("/reporting/reporting/users", { params });
