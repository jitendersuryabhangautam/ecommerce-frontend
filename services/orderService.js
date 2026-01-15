import api from "./api";

export const orderService = {
  // Create order
  createOrder: async (orderData) => {
    const response = await api.post("/orders", orderData);
    return response.data;
  },

  // Get user orders
  getOrders: async (params = {}) => {
    const { page = 1, limit = 10 } = params;
    const response = await api.get(`/orders?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get single order
  getOrder: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id) => {
    const response = await api.put(`/orders/${id}/cancel`);
    return response.data;
  },

  // Create payment
  createPayment: async (paymentData) => {
    const response = await api.post("/payments", paymentData);
    return response.data;
  },

  // Verify payment
  verifyPayment: async (paymentId, transactionId) => {
    const response = await api.post(`/payments/${paymentId}/verify`, {
      transaction_id: transactionId,
    });
    return response.data;
  },
};
