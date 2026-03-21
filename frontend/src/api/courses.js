import api from "./axios";

export const getCourses = (params) => api.get("/courses", { params });
export const getCourseById = (id) => api.get(`/courses/${id}`);
export const createCourse = (data) => api.post("/courses", data);
export const updateCourse = (id, data) => api.patch(`/courses/${id}`, data);
export const togglePublish = (id, data) => api.patch(`/courses/${id}/publish`, data);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);
export const getPublishedCourses = () => api.get("/courses/published");
export const getCourseDetail = (id) => api.get(`/courses/${id}/detail`);
