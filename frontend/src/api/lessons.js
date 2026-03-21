import api from "./axios";

export const addLesson = (courseId, data) => api.post(`/courses/${courseId}/lessons`, data, {
  headers: { "Content-Type": "multipart/form-data" }
});
export const getLessons = (courseId) => api.get(`/courses/${courseId}/lessons`);
export const editLesson = (lessonId, data) => api.patch(`/lessons/${lessonId}`, data, {
  headers: { "Content-Type": "multipart/form-data" }
});
export const deleteLesson = (lessonId) => api.delete(`/lessons/${lessonId}`);

export const addAttachment = (lessonId, data) => api.post(`/lessons/${lessonId}/attachments`, data, {
  headers: { "Content-Type": "multipart/form-data" }
});
export const deleteAttachment = (attachmentId) => api.delete(`/attachments/${attachmentId}`);
