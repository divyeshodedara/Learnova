import api from "./axios";

export const getLessonForPlayer = (courseId, lessonId) =>
  api.get(`/players/player/${courseId}/${lessonId}`);

export const markLessonProgress = (lessonId, data) =>
  api.patch(`/players/progress/lesson/${lessonId}`, data);

export const startQuizAttempt = (quizId) =>
  api.post(`/players/quizzes/${quizId}/attempt`);

export const submitAnswer = (attemptId, data) =>
  api.post(`/players/attempts/${attemptId}/answer`, data);

export const completeAttempt = (attemptId) =>
  api.post(`/players/attempts/${attemptId}/complete`);
