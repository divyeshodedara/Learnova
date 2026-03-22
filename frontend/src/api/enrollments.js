import api from "./axios";

export const enrollInCourse = (courseId) => api.post("/learners/enrollments", { courseId });
export const getMyEnrollments = () => api.get("/learners/enrollments/my");
export const getCourseProgress = (enrollmentId) => api.get(`/learners/enrollments/${enrollmentId}/progress`);

export const getPublishedCourses = () => api.get("/learners/courses/published");
export const getCourseDetail = (id) => api.get(`/learners/courses/${id}/detail`);
export const getCourseReviews = (id) => api.get(`/learners/courses/${id}/reviews`);
export const addCourseReview = (id, data) => api.post(`/learners/courses/${id}/reviews`, data);
