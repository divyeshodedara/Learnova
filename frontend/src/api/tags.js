import api from "./axios";

export const getTags = () => api.get("/tags");
export const createTag = (name) => api.post("/tags", { name });
