import api from "./axios";

export const getQuizzes = (courseId) => api.get(`/courses/${courseId}/quizzes`);
export const createQuiz = (courseId, data) => api.post(`/courses/${courseId}/quizzes`, data);
export const updateQuiz = (id, data) => api.patch(`/quizzes/${id}`, data);
export const deleteQuiz = (id) => api.delete(`/quizzes/${id}`);

export const addQuestion = (quizId, data) => api.post(`/quizzes/${quizId}/questions`, data);
export const updateQuestion = (id, data) => api.patch(`/questions/${id}`, data);
export const deleteQuestion = (id) => api.delete(`/questions/${id}`);

export const addOption = (questionId, data) => api.post(`/questions/${questionId}/options`, data);
export const updateOption = (id, data) => api.patch(`/options/${id}`, data);
export const deleteOption = (id) => api.delete(`/options/${id}`);

export const setRewards = (quizId, rewards) => api.put(`/quizzes/${quizId}/rewards`, { rewards });
