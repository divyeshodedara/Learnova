import api from "./axios";

export const getTags = () => api.get("/tags");
export const createTag = (data) => api.post("/tags", data);
