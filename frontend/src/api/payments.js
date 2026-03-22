import api from "./axios";

export const createOrder = (courseId) =>
  api.post("/payments/create-order", { courseId });

export const verifyPayment = (data) =>
  api.post("/payments/verify", data);

export const cancelPayment = (paymentId) =>
  api.post("/payments/cancel", { paymentId });

export const getPaymentStatus = (courseId) =>
  api.get(`/payments/status/${courseId}`);

export const getMyPayments = () => api.get("/payments/my");

export const getAllPayments = (params) =>
  api.get("/payments/admin/all", { params });
