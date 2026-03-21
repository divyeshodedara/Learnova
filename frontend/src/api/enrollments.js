import api from "./axios";

export const enrollInCourse = (courseId) => api.post("/enrollments", { courseId });
export const getMyEnrollments = () => api.get("/enrollments/my");
export const getCourseProgress = (enrollmentId) => api.get(`/enrollments/${enrollmentId}/progress`);
