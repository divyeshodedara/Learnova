import api from "./axios";

export const getLessons = (courseId) => api.get(`/courses/${courseId}/lessons`);

export const createLesson = (courseId, formData) =>
  api.post(`/courses/${courseId}/lessons`, formData, {
    headers: { "Content-Type": undefined },
  });

export const updateLesson = (id, formData) =>
  api.patch(`/lessons/${id}`, formData, {
    headers: { "Content-Type": undefined },
  });

export const deleteLesson = (id) => api.delete(`/lessons/${id}`);

export const addAttachment = (lessonId, formData) =>
  api.post(`/lessons/${lessonId}/attachments`, formData, {
    headers: { "Content-Type": undefined },
  });

export const deleteAttachment = (id) => api.delete(`/attachments/${id}`);
