import api from "./axios";

export const createQuiz = (courseId, data) => api.post(`/quizzes/courses/${courseId}/quizzes`, data);
export const listQuizzes = (courseId) => api.get(`/quizzes/courses/${courseId}/quizzes`);
export const updateQuiz = (id, data) => api.patch(`/quizzes/quizzes/${id}`, data);
export const deleteQuiz = (id) => api.delete(`/quizzes/quizzes/${id}`);

export const addQuestion = (quizId, data) => api.post(`/quizzes/quizzes/${quizId}/questions`, data);
export const editQuestion = (id, data) => api.patch(`/quizzes/questions/${id}`, data);
export const deleteQuestion = (id) => api.delete(`/quizzes/questions/${id}`);

export const addOption = (questionId, data) => api.post(`/quizzes/questions/${questionId}/options`, data);
export const editOption = (id, data) => api.patch(`/quizzes/options/${id}`, data);
export const deleteOption = (id) => api.delete(`/quizzes/options/${id}`);

export const setRewards = (quizId, data) => api.put(`/quizzes/quizzes/${quizId}/rewards`, data);
