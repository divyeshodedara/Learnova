import api from "./axios";

export const getInvitations = (courseId) => api.get(`/courses/${courseId}/invitations`);
export const sendInvitation = (courseId, data) => api.post(`/courses/${courseId}/invitations`, data);
