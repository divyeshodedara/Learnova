import api from "./axios";

export const enrollCourse = (data) => api.post("/learners/enrollments", data);
export const getMyEnrollments = () => api.get("/learners/enrollments/my");
export const getCourseProgress = (enrollmentId) => api.get(`/learners/enrollments/${enrollmentId}/progress`);
