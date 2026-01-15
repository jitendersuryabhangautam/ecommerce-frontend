import api from "./api";

export const paymentService = {
  createPayment: (paymentData) => api.post("/payments", paymentData),
  verifyPayment: (paymentId, verificationData) =>
    api.post(`/payments/${paymentId}/verify`, verificationData),
  getPaymentByOrder: (orderId) => api.get(`/orders/${orderId}/payment`),
  getPaymentHistory: (params = {}) => api.get("/payments/history", { params }),
};
