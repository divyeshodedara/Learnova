import api from "./axios";

export const createOrder = (data) => api.post(`/payments/create-order`, data);
export const verifyPayment = (data) => api.post(`/payments/verify`, data);
export const getMyPayments = () => api.get(`/payments/my`);
